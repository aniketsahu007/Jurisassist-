# jurisAssist — AI Legal Intelligence Platform

jurisAssist is a modern, professional, AI-powered Legal Intelligence Platform designed to help legal professionals manage cases, analyze documents with AI, find legal precedents, and uncover patterns in judicial rulings.

## Tech Stack
**Frontend:**
- Vite + React + TypeScript
- React Router & TanStack Query
- Tailwind CSS & shadcn/ui
- Recharts

**Backend:**
- Python 3.10+ & FastAPI
- PostgreSQL + SQLAlchemy + Alembic (Supabase hosted)
- Supabase Auth & Storage
- ChromaDB (Local Vector Store with ONNX `all-MiniLM-L6-v2`)
- LLM Integration (Groq API, Gemini, etc.)
- spaCy for NLP (Entity Extraction)
- Tesseract OCR (via PyMuPDF / pytesseract)

## Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Tesseract OCR**: Needs to be installed on your system for document processing.
- A **Supabase** project (for PostgreSQL database, Auth, and Storage).
- A **Groq / OpenAI API Key** for the LLM pipeline.

### 2. Environment Variables
Create a `.env` file in the root directory and populate it:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Settings
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Frontend Configuration
VITE_API_URL="http://localhost:8000"
FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# LLM Fallback Chain (Groq example)
GROQ_API_KEY="your-groq-api-key"
LLM_PROVIDER_1_NAME="Groq-Mixtral"
LLM_PROVIDER_1_BASE_URL="https://api.groq.com/openai/v1"
LLM_PROVIDER_1_API_KEY="your-groq-api-key"
LLM_PROVIDER_1_MODEL="mixtral-8x7b-32768"
```

### 3. Backend Setup

Navigate to the `backend` directory and set up your Python virtual environment:
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model required for entity extraction
python -m spacy download en_core_web_sm
```

Run database migrations to generate the schema:
```bash
alembic upgrade head
```

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```
The API will run at `http://localhost:8000`.

### 4. Frontend Setup

Open a new terminal in the root directory:
```bash
# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
The UI will run at `http://localhost:5173`.

## Architecture Features
- **Local ChromaDB:** We use local vector storage (`backend/chroma_data/`) for cost-efficiency. It leverages `all-MiniLM-L6-v2` via ONNX runtime for lightweight, fast embeddings without needing an external embedding API key.
- **LLM Fallback Chain:** The backend `llm_chain.py` automatically falls back through multiple LLM providers/models if rate limits or 503 errors occur.
- **Background Tasks:** Document OCR, vector ingestion, and long-running AI report generation are handed off to FastAPI `BackgroundTasks` to keep the UI responsive.
