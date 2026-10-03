import requests
import json

base_url = "http://localhost:8000/api/v1"
case_id = "5d2ee58e-5161-4ff7-8388-a39d5e5360f9"  # from earlier db check

res = requests.post(f"{base_url}/reports/{case_id}/generate")
print(res.status_code)
print(res.text)
