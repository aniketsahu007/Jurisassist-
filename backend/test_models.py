import os
import requests
from dotenv import load_dotenv

load_dotenv("../.env")
api_key = os.getenv("GROQ_API_KEY")
print(f"API Key present: {bool(api_key)}")
resp = requests.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {api_key}"})
data = resp.json()
print([m.get("id") for m in data.get("data", [])])
