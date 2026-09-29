import argparse
from app.database import SessionLocal
from app.models import Document, ExtractedEntity, TimelineEvent, DocumentStatus
from app.tasks import (
    _acquire_document_lock,
    _release_document_lock,
    process_document_task,
    process_phase5_only,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Safely retry document processing.")
    parser.add_argument("--document-id", help="Document ID; defaults to the newest document")
    parser.add_argument(
        "--full",
        action="store_true",
        help="Rerun download, OCR, entity extraction, timeline, and Phase 5",
    )
    args = parser.parse_args()

    db = SessionLocal()
    lock_acquired = False
    handed_off_to_task = False
    try:
        query = db.query(Document)
        if args.document_id:
            doc = query.filter(Document.id == args.document_id).first()
        else:
            doc = query.order_by(Document.created_at.desc()).first()

        if not doc:
            print("No documents found.")
            return 0

        print(f"Retrying document: {doc.filename} (ID: {doc.id})")

        if not args.full:
            print("Running Phase 5 only using the stored OCR text.")
            process_phase5_only(doc.id, db=db)
            print("Done processing Phase 5!")
            return 0

        # Hold the same database advisory lock while resetting and processing,
        # so an API background task cannot start between those operations.
        lock_acquired = _acquire_document_lock(db, doc.id)
        if not lock_acquired:
            print("Document is already being processed; no retry started.")
            return 2

        db.query(ExtractedEntity).filter(ExtractedEntity.document_id == doc.id).delete()
        db.query(TimelineEvent).filter(TimelineEvent.source_doc_id == doc.id).delete()
        doc.status = DocumentStatus.PROCESSING_OCR
        db.commit()

        process_document_task(doc.id, db=db, lock_already_acquired=True)
        handed_off_to_task = True
        print("Done processing!")
        return 0
    finally:
        if lock_acquired and not handed_off_to_task:
            _release_document_lock(db, doc.id)
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
