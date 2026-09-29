from app.database import SessionLocal
from app.models import Document, DocumentChunk, ExtractedEntity, TimelineEvent

def check_phase_5_status():
    db = SessionLocal()
    # Get the most recent document that was processed
    doc = db.query(Document).filter(Document.status == "COMPLETED").order_by(Document.created_at.desc()).first()
    
    if not doc:
        print("No processed documents found in the database. You need to upload and process a document first to test Phase 5.")
        return

    print(f"Latest Processed Document: {doc.filename} (ID: {doc.id})")
    print("-" * 50)
    
    # Check Chunks (Phase 4/5)
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
    print(f"Chunks generated: {len(chunks)}")
    
    # Check Entities (Phase 4/5)
    entities = db.query(ExtractedEntity).filter(ExtractedEntity.document_id == doc.id).all()
    print(f"Entities extracted: {len(entities)}")
    if entities:
        print(f"  Example entity: {entities[0].value} ({entities[0].entity_type})")
        
    # Check Timeline Events (Phase 4/5)
    events = db.query(TimelineEvent).filter(TimelineEvent.source_doc_id == doc.id).all()
    print(f"Timeline Events extracted: {len(events)}")
    if events:
        print(f"  Example event: {events[0].event_date} - {events[0].description[:50]}...")

if __name__ == "__main__":
    check_phase_5_status()
