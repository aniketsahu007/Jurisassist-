import sys

with open('app/routers/cases.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        formatted_events.append({
            "id": ev.id,
            "date": ev.event_date.isoformat(),
            "stage": stage_mapping.get(ev.event_type, "Incident"),
            "status": status,
            "title": ev.event_type.name.replace("_", " ").title(),"""

replacement = """        # Smart dynamic headline generation based on description context
        desc_lower = ev.description.lower()
        dynamic_title = ev.event_type.name.replace("_", " ").title()
        
        if "extortion" in desc_lower: dynamic_title = "Extortion Allegations"
        elif "police service" in desc_lower: dynamic_title = "Police Service Record"
        elif "written complaint" in desc_lower: dynamic_title = "Written Complaint Filed"
        elif "fir" in desc_lower: dynamic_title = "FIR Registration"
        elif "arrest" in desc_lower: dynamic_title = "Arrest Executed"
        elif "bail" in desc_lower: dynamic_title = "Bail Proceedings"
        elif "charge sheet" in desc_lower: dynamic_title = "Charge Sheet Filed"
        elif "judgment" in desc_lower: dynamic_title = "Final Judgment"
        else:
            words = ev.description.split()
            if len(words) > 4 and ev.event_type.name == "INCIDENT":
                first_few = " ".join(words[:4]).strip(".,;:!'\\\"")
                dynamic_title = first_few.title() + "..."

        formatted_events.append({
            "id": ev.id,
            "date": ev.event_date.isoformat(),
            "stage": stage_mapping.get(ev.event_type, "Incident"),
            "status": status,
            "title": dynamic_title,"""

content = content.replace('\r\n', '\n')
target = target.replace('\r\n', '\n')

new_content = content.replace(target, replacement)
if new_content == content:
    print('Failed to replace.')
    sys.exit(1)
else:
    with open('app/routers/cases.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully updated cases.py')
