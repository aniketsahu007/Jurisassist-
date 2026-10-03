import asyncio
from app.database import SessionLocal
from app.services.report_generator import process_report_async
from app.models import CaseReport

async def main():
    db = SessionLocal()
    # Find the report we created earlier in GENERATING state
    report = db.query(CaseReport).filter(CaseReport.case_id == "3018eba2-18c5-448e-9372-b618034a2da4").first()
    if not report:
        print("No report found")
        return
        
    print(f"Running async processor for report {report.id}...")
    await process_report_async(report.case_id, report.id)
    
    # Reload from DB
    db.refresh(report)
    print(f"Status is now: {report.status}")
    if report.status == "FAILED":
        print(f"Error: {report.report_json.get('error')}")

if __name__ == "__main__":
    asyncio.run(main())
