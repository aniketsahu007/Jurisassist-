import gc
import logging
import tempfile
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import SessionLocal
from .models import Document, DocumentStatus
from .storage import get_supabase, STORAGE_BUCKET
from .services.document_processor import DocumentProcessor

logger = logging.getLogger(__name__)

def _acquire_document_lock(db: Session, doc_id: str) -> bool:
    """Allow only one worker or manual retry to process a document at a time."""
    return bool(
        db.execute(
            text("SELECT pg_try_advisory_lock(hashtext(:doc_id))"),
            {"doc_id": doc_id},
        ).scalar()
    )


def _release_document_lock(db: Session, doc_id: str) -> None:
    db.execute(
        text("SELECT pg_advisory_unlock(hashtext(:doc_id))"),
        {"doc_id": doc_id},
    )
    db.commit()


def _process_phase5(db: Session, doc: Document) -> int:
    """Chunk, embed, and persist one document without rerunning OCR or NLP."""
    from .services.chunker import DocumentChunker
    from .services.vector_store import vector_store
    from .models import DocumentChunk

    logger.info("Starting Phase 5 (vector ingestion) for doc %s", doc.id)

    # Delete old chunks in both Postgres and ChromaDB before re-ingesting.
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()
    vector_store.delete_document_chunks(doc.id)

    chunks = DocumentChunker().chunk(doc.ocr_text, doc.id)
    db_chunks = [
        DocumentChunk(
            document_id=doc.id,
            chunk_index=chunk["chunk_index"],
            text_content=chunk["text_content"],
            vector_id=f"{doc.id}__chunk_{chunk['chunk_index']}",
        )
        for chunk in chunks
    ]

    if db_chunks:
        # Save in batches to avoid exploding the SQLAlchemy session memory for huge documents
        batch_size = 1000
        for i in range(0, len(db_chunks), batch_size):
            db.bulk_save_objects(db_chunks[i:i + batch_size])
            db.commit()

    embedded_count = vector_store.ingest_document_chunks(chunks, doc.id, doc.case_id)
    logger.info("Phase 5 complete: %s chunks embedded for doc %s", embedded_count, doc.id)
    return embedded_count


def process_document_task(
    doc_id: str,
    db: Session = None,
    lock_already_acquired: bool = False,
):
    """
    Background task to download a document from Supabase Storage, run OCR/text extraction,
    and save the results back to the PostgreSQL database.
    """
    logger.info(f"Starting background processing for document: {doc_id}")
    owns_db = db is None
    db = db or SessionLocal()
    lock_acquired = lock_already_acquired
    
    try:
        if not lock_already_acquired:
            try:
                lock_acquired = _acquire_document_lock(db, doc_id)
            except Exception:
                logger.exception("Could not acquire processing lock for document %s", doc_id)
                return

            if not lock_acquired:
                logger.warning("Document %s is already being processed; skipping duplicate task.", doc_id)
                return

        # 1. Fetch document record
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            logger.error(f"Document {doc_id} not found in database.")
            return
            
        if doc.status != DocumentStatus.PROCESSING_OCR:
            logger.warning(f"Document {doc_id} is in status {doc.status}, skipping OCR processing.")
            return

        # 2. Download file from Supabase Storage
        supabase = get_supabase()
        try:
            file_data = supabase.storage.from_(STORAGE_BUCKET).download(doc.file_url)
        except Exception as e:
            logger.error(f"Failed to download file from Supabase for doc {doc_id}: {e}")
            doc.status = DocumentStatus.FAILED
            db.commit()
            return
            
        # Write to a temporary file so PyMuPDF can open it
        temp_ext = os.path.splitext(doc.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=temp_ext) as tmp_file:
            tmp_file.write(file_data)
            tmp_file_path = tmp_file.name
            
        # 3. Process the file via our pipeline (OCR)
        processor = DocumentProcessor()
        try:
            result = processor.process_file(tmp_file_path)
            
            if result.get("error"):
                logger.error(f"DocumentProcessor flagged an error for {doc_id}: {result['error']}")
            
            doc.ocr_text = result["text"]
            doc.ocr_confidence = result["confidence"]
            
            doc.status = DocumentStatus.PROCESSING_AI
            db.commit()

            # Free OCR / PyMuPDF / Pillow memory before loading spaCy
            del result
            gc.collect()
            
            # --- PHASE 4: Entity Extraction & Timeline ---
            if doc.ocr_text:
                logger.info(f"Starting Phase 4 (AI extraction) for doc {doc_id}")
                
                # 4.1 Extract Entities
                from .services.entity_extractor import EntityExtractor
                from .services.timeline_builder import TimelineBuilder
                from .models import ExtractedEntity, TimelineEvent
                
                extractor = EntityExtractor()
                entities = extractor.extract_entities(doc.ocr_text)
                
                db_entities = []
                for e in entities:
                    new_entity = ExtractedEntity(
                        document_id=doc.id,
                        entity_type=e["entity_type"],
                        value=e["value"],
                        context=e["context"],
                        confidence=e["confidence"]
                    )
                    db_entities.append(new_entity)
                
                if db_entities:
                    db.bulk_save_objects(db_entities)
                    
                # 4.2 Build Timeline
                timeline_builder = TimelineBuilder()
                events = timeline_builder.build_timeline(entities)
                
                db_events = []
                for ev in events:
                    new_event = TimelineEvent(
                        case_id=doc.case_id,
                        source_doc_id=doc.id,
                        event_date=ev["event_date"],
                        event_type=ev["event_type"],
                        description=ev["description"],
                        confidence=ev["confidence"],
                        is_ai_generated=ev["is_ai_generated"]
                    )
                    db_events.append(new_event)
                    
                if db_events:
                    db.bulk_save_objects(db_events)
            
            # Free spaCy / entity-extraction memory before loading sentence-transformers
            gc.collect()

            # --- PHASE 5: Chunk & Embed into Vector DB ---
            if doc.ocr_text:
                try:
                    _process_phase5(db, doc)

                except ImportError as ie:
                    # chromadb / sentence-transformers not installed yet — skip gracefully
                    logger.warning(f"Vector DB dependencies not installed, skipping Phase 5: {ie}")
                except Exception as vec_err:
                    import traceback
                    logger.error(f"Phase 5 vector ingestion failed for doc {doc_id}: {vec_err}")
                    logger.error(traceback.format_exc())
                    # Do NOT fail the whole pipeline — OCR + extraction are more critical
            
            doc.status = DocumentStatus.COMPLETED
            logger.info(f"Successfully processed document {doc_id}. Pipeline finished.")
            
        finally:
            # Clean up the temporary file immediately
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)
                
        # 5. Save updates to database
        db.commit()

    except Exception as e:
        logger.exception(f"Unexpected error in background task for doc {doc_id}: {e}")
        try:
            db.rollback()
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                doc.status = DocumentStatus.FAILED
                db.commit()
        except Exception as inner_e:
            logger.error(f"Failed to mark document {doc_id} as FAILED: {inner_e}")
    finally:
        if lock_acquired:
            try:
                _release_document_lock(db, doc_id)
            except Exception:
                logger.exception("Failed to release processing lock for document %s", doc_id)
        if owns_db:
            db.close()


def process_phase5_only(doc_id: str, db: Session = None):
    """Safely retry vector ingestion using already stored OCR text."""
    owns_db = db is None
    db = db or SessionLocal()
    lock_acquired = False

    try:
        lock_acquired = _acquire_document_lock(db, doc_id)
        if not lock_acquired:
            logger.warning("Document %s is already being processed; skipping Phase 5 retry.", doc_id)
            return

        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            logger.error("Document %s not found in database.", doc_id)
            return
        if not doc.ocr_text:
            raise ValueError("Document has no stored OCR text; use the full retry instead.")

        doc.status = DocumentStatus.PROCESSING_AI
        db.commit()
        _process_phase5(db, doc)
        doc.status = DocumentStatus.COMPLETED
        db.commit()
    except Exception:
        logger.exception("Phase 5-only retry failed for document %s", doc_id)
        db.rollback()
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = DocumentStatus.FAILED
            db.commit()
        raise
    finally:
        if lock_acquired:
            try:
                _release_document_lock(db, doc_id)
            except Exception:
                logger.exception("Failed to release processing lock for document %s", doc_id)
        if owns_db:
            db.close()
