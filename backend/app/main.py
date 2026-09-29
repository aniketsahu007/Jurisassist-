from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from .routers import cases, documents, search

# Load env variables
load_dotenv()


def _frontend_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS")
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app = FastAPI(
    title="jurisAssist API",
    description="Backend API for jurisAssist AI Legal Intelligence Platform",
    version="1.0.0"
)

# Configure CORS so the Vite React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=_frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "jurisAssist API is running"}

app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(search.router)
