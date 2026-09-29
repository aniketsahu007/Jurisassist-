from app.database import SessionLocal
from app.models import Document

db = SessionLocal()
doc = db.query(Document).order_by(Document.created_at.desc()).first()

print(f"Document text preview (first 1000 chars):\n")
print(doc.ocr_text[:1000])
