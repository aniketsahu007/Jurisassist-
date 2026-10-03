import os
import requests

api_key = "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"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
print(response.json())
