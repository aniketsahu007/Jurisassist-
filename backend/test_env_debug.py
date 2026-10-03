import os
from dotenv import load_dotenv
load_dotenv("../.env")

# Check what the LLM chain actually sees
for i in range(1, 4):
    name = os.getenv(f"LLM_PROVIDER_{i}_NAME")
    key = os.getenv(f"LLM_PROVIDER_{i}_API_KEY")
    model = os.getenv(f"LLM_PROVIDER_{i}_MODEL")
    # Show first/last 6 chars of key for privacy
    key_preview = f"{key[:6]}...{key[-6:]}" if key and len(key) > 12 else key
    print(f"Provider {i}: name={name}, model={model}, key={key_preview}")
