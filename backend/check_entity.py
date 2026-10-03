from app.database import SessionLocal
from app.models import ExtractedEntity

db = SessionLocal()
e = db.query(ExtractedEntity).first()
if e:
    print(f"type: {type(e.entity_type)}, value: {e.entity_type}")
    print(f"value: {e.value}")
    try:
        print(f"name: {e.entity_type.name}")
    except Exception as ex:
        print(f"Error accessing name: {ex}")
else:
    print("No entities")
