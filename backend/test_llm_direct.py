"""Quick test: call qwen directly to verify it works for timeline enhancement."""
import asyncio
import os
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from openai import AsyncOpenAI
from dotenv import load_dotenv
load_dotenv("../.env")

async def test():
    key = os.getenv("GROQ_API_KEY")
    print(f"Key present: {bool(key)}")
    
    client = AsyncOpenAI(base_url="https://api.groq.com/openai/v1", api_key=key)
    
    prompt = (
        "You are a legal assistant. Rewrite the following raw text extracted from a legal document "
        "into a single clear, concise, human-readable sentence describing what happened on this date. "
        "Output ONLY the rewritten sentence.\n\n"
        "Date: 2013-05-28\n"
        "Raw text: A in the case of Sujit Biswas vs. State of Assam decided on 28th May, 2013 held as under:- 6. Suspicion, however grave it may be, cann\n\n"
        "Rewritten description:"
    )
    
    # Test with qwen
    print("Testing qwen/qwen3.8-27b...")
    try:
        response = await asyncio.wait_for(client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": "You are a helpful legal AI assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        ), timeout=15.0)
        content = (response.choices[0].message.content or "").strip()
        print(f"Content: '{content}'")
        print(f"Content length: {len(content)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test with gpt-oss-120b 
    print("\nTesting openai/gpt-oss-120b...")
    try:
        response = await asyncio.wait_for(client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a helpful legal AI assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        ), timeout=15.0)
        content = (response.choices[0].message.content or "").strip()
        print(f"Content: '{content}'")
        print(f"Content length: {len(content)}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
