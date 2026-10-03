from app.database import SessionLocal
from app.models import CaseReport
db = SessionLocal()
report = db.query(CaseReport).filter(CaseReport.case_id == '3018eba2-18c5-448e-9372-b618034a2da4').first()
if report:
    err = report.report_json.get("error") if report.report_json else "None"
    print(f"Status: {report.status}, Error: {err}")
else:
    print("No report found")
