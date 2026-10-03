import os
from app.database import SessionLocal
from app.models import Case

db = SessionLocal()
dev_user_id = "00000000-0000-0000-0000-000000000000"
target_user_id = "7a623775-9ba9-4827-8594-27946c7e4a2b"  # aniketsaahu22@gmail.com

cases = db.query(Case).filter(Case.user_id == dev_user_id).all()
for c in cases:
    c.user_id = target_user_id

db.commit()
print(f"Moved {len(cases)} cases from dev-user to aniketsaahu22@gmail.com")
