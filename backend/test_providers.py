import os
import requests
from dotenv import load_dotenv
load_dotenv("../.env")

tests = [
    ("Provider 1", os.getenv("LLM_PROVIDER_1_API_KEY"), os.getenv("LLM_PROVIDER_1_MODEL")),
    ("Provider 2", os.getenv("LLM_PROVIDER_2_API_KEY"), os.getenv("LLM_PROVIDER_2_MODEL")),
    ("Provider 3", os.getenv("LLM_PROVIDER_3_API_KEY"), os.getenv("LLM_PROVIDER_3_MODEL")),
]

for name, key, model in tests:
    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={"model": model, "messages": [{"role": "user", "content": "Say hello"}], "max_tokens": 10},
            timeout=10
        )
        print(f"{name} ({model}): {resp.status_code} - {resp.text[:200]}")
    except Exception as e:
        print(f"{name} ({model}): ERROR - {e}")
