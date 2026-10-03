import requests
headers = {
    "Origin": "http://172.25.217.30:5173",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "authorization,content-type"
}
resp = requests.options("http://localhost:8000/api/v1/cases", headers=headers)
print(f"Status: {resp.status_code}")
print(f"Headers: {resp.headers}")
print(f"Body: {resp.text}")
