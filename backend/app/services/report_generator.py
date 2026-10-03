import json
from sqlalchemy.orm import Session
from ..models import Case, Document, ExtractedEntity, TimelineEvent, CaseReport
from .llm_chain import generate_chat_response
import asyncio

def generate_case_report_sync(db: Session, case_id: str, user_id: str) -> CaseReport:
    """Synchronous wrapper to trigger report generation and return the status row."""
    # Check if report already exists
    report = db.query(CaseReport).filter(CaseReport.case_id == case_id).first()
    if not report:
        report = CaseReport(case_id=case_id, user_id=user_id, status="GENERATING")
        db.add(report)
        db.commit()
        db.refresh(report)
    else:
        report.status = "GENERATING"
        db.commit()
        
    return report

async def process_report_async(case_id: str, report_id: str):
    """Background task that actually talks to the LLM and saves the result."""
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        report = db.query(CaseReport).filter(CaseReport.id == report_id).first()
        if not report:
            return

        # Fetch case data
        case = db.query(Case).filter(Case.id == case_id).first()
        documents = db.query(Document).filter(Document.case_id == case_id).all()
        document_ids = [d.id for d in documents]
        entities = db.query(ExtractedEntity).filter(ExtractedEntity.document_id.in_(document_ids)).all() if document_ids else []
        timeline = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(TimelineEvent.event_date).all()
        
        # Build prompt
        prompt = f"""
You are an expert legal assistant. Generate a comprehensive case report based on the following data.
Return ONLY a valid JSON object matching the requested schema. No markdown wrapping.

Case Title: {case.title if case else "Unknown"}
Summary: {case.summary if case else "None"}

Entities:
{', '.join([f"{e.entity_type.name}: {e.value}" for e in entities[:50]])}

Timeline:
{chr(10).join([f"{t.event_date.strftime('%Y-%m-%d') if t.event_date else 'Unknown'}: {t.description}" for t in timeline[:30]])}

Required JSON Schema:
{{
  "executiveSummary": "A concise summary of the case facts and current status",
  "keyFacts": ["Fact 1", "Fact 2"],
  "legalIssues": ["Issue 1", "Issue 2"],
  "risks": ["Risk 1", "Risk 2"],
  "contradictions": ["Contradiction 1 (if any)"]
}}
"""
        # Call LLM
        response_text = await generate_chat_response(prompt)
        
        # Parse JSON
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        try:
            if json_match:
                report_data = json.loads(json_match.group(0))
            else:
                report_data = json.loads(response_text)
        except Exception as parse_e:
            with open("failed_llm_response.txt", "w", encoding="utf-8") as f:
                f.write(response_text)
            raise parse_e
            
        report.report_json = report_data
        report.status = "COMPLETED"
        db.commit()
    except Exception as e:
        report.status = "FAILED"
        report.report_json = {"error": str(e)}
        db.commit()
    finally:
        db.close()
