import os
import sys
from app.database import SessionLocal
from app.models import Case, User

db = SessionLocal()
cases = db.query(Case).all()
print(f"Total cases: {len(cases)}")
for c in cases:
    print(f"Case '{c.title}' (ID: {c.id}) -> user_id: {c.user_id}")

users = db.query(User).all()
print(f"\nTotal users in DB: {len(users)}")
for u in users:
    print(f"User '{u.email}' -> ID: {u.id}")
