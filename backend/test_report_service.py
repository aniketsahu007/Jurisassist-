from app.database import SessionLocal
from app.services.report_generator import generate_case_report_sync, process_report_async

db = SessionLocal()
case_id = "5d2ee58e-5161-4ff7-8388-a39d5e5360f9"
user_id = "7a623775-9ba9-4827-8594-27946c7e4a2b" # from earlier db check

print("Generating report sync...")
report = generate_case_report_sync(db, case_id, user_id)
print(f"Report initialized: {report.status}, ID: {report.id}")

# we won't run async here as it requires asyncio context
