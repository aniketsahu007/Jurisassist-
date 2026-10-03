import os
import requests
from dotenv import load_dotenv
load_dotenv("../.env")
api_key = os.getenv("GROQ_API_KEY")

for model in ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "allam-2-7b"]:
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, "messages": [{"role": "user", "content": "Return the JSON: [{'index': 0, 'description': 'hello'}]"}]}
    )
    print(f"Model: {model}")
    print(resp.status_code, resp.text)
