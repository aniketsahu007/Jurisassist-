import requests
resp = requests.options("http://localhost:8000/api/v1/cases?page=1&limit=6", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
print(resp.status_code, resp.text, resp.headers)
