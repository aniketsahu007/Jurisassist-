from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import webhooks, cases, documents

# Load env variables
load_dotenv()

app = FastAPI(
    title="jurisAssist API",
    description="Backend API for jurisAssist AI Legal Intelligence Platform",
    version="1.0.0"
)

# Configure CORS so the Vite React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "jurisAssist API is running"}

app.include_router(webhooks.router, tags=["Webhooks"])
app.include_router(cases.router)
app.include_router(documents.router)
