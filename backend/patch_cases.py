with open('app/routers/cases.py', 'a', encoding='utf-8') as f:
    f.write('''

@router.get("/{case_id}/timeline")
def get_case_timeline(
    case_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Get the chronologically sorted timeline for a specific case."""
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user_id,
        Case.deleted_at.is_(None),
    ).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    events = db.query(TimelineEvent).filter(
        TimelineEvent.case_id == case_id
    ).order_by(TimelineEvent.event_date.asc()).all()

    formatted_events = []
    for ev in events:
        stage_mapping = {
            EventType.INCIDENT: "Incident",
            EventType.ARREST: "Arrest",
            EventType.FILING: "FIR Registered",
            EventType.HEARING: "Hearing",
            EventType.ORDER: "Hearing",
            EventType.JUDGMENT: "Judgment"
        }
        
        now = datetime.utcnow()
        if ev.event_date.date() < now.date():
            status = "completed"
        elif ev.event_date.date() == now.date():
            status = "current"
        else:
            status = "upcoming"

        formatted_events.append({
            "id": ev.id,
            "date": ev.event_date.isoformat(),
            "stage": stage_mapping.get(ev.event_type, "Incident"),
            "status": status,
            "title": ev.event_type.name.replace("_", " ").title(),
            "description": ev.description,
            "details": {
                "location": "Extracted Document Entity",
                "officer": "N/A",
                "notes": ev.description,
                "documents": []
            }
        })

    return {"events": formatted_events}
''')
