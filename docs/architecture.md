# Architecture & Workflow Blueprinting

This document defines the high-level architecture and data flows for the jurisAssist platform (React + FastAPI + Redis/Celery + ChromaDB + Postgres).

## 1. High-Level Architecture
This represents the physical separation of concerns in our stack.

```mermaid
graph TD
    UI[Frontend: React/Vite SPA] -->|REST API + JWT| API[Backend: FastAPI]
    
    API -->|Reads/Writes| PG[(PostgreSQL)]
    API -->|Enqueues Tasks| REDIS[(Redis Queue)]
    API -->|Vector Searches| CHROMA[(ChromaDB)]
    
    WORKER[Celery AI Workers] -->|Pops Tasks| REDIS
    WORKER -->|Updates State| PG
    WORKER -->|Saves Embeddings| CHROMA
    
    UI -->|Direct Upload| S3[(S3 / Blob Storage)]
    API -->|Issues Presigned URL| S3
    WORKER -->|Downloads PDF| S3
```

## 2. Document Upload & Processing Workflow (Happy Path)
Because document OCR and AI extraction are slow, we use an asynchronous queueing pattern.

```mermaid
sequenceDiagram
    participant User
    participant React as Frontend
    participant API as FastAPI
    participant S3 as Storage
    participant Celery as AI Worker
    participant PG as PostgreSQL

    User->>React: Uploads 50-page PDF
    React->>API: POST /documents (Request Presigned URL)
    API->>PG: Create Document (Status=UPLOADED)
    API-->>React: Return Presigned URL & doc_id
    
    React->>S3: PUT binary data directly to S3
    S3-->>React: 200 OK
    
    React->>API: POST /documents/{doc_id}/confirm
    API->>Celery: Enqueue `process_document` task
    API-->>React: 202 Accepted
    
    par Async Processing
        Celery->>PG: Update Status=PROCESSING_OCR
        Celery->>S3: Download PDF
        Celery->>Celery: Run OCR & Layout extraction
        Celery->>PG: Update Status=PROCESSING_AI & Save ocr_text
        Celery->>Celery: Run LLM Extraction (Entities, Timeline)
        Celery->>PG: Save ExtractedEntities & TimelineEvents
        Celery->>PG: Update Status=COMPLETED
    and Frontend Polling
        loop Every 3 seconds
            React->>API: GET /documents/{doc_id}/status
            API-->>React: Return Status (PROCESSING_OCR, etc.)
        end
    end
    
    React->>User: Display "Document Ready!"
```

## 3. Precedent Retrieval Workflow (Phase 5/6)
How we implement grounded retrieval via vector search.

```mermaid
sequenceDiagram
    participant Lawyer
    participant API as FastAPI
    participant DB as Postgres
    participant Chroma as Vector DB
    participant LLM as OpenAI/Anthropic

    Lawyer->>API: POST /cases/{id}/precedents/search "Find similar bail arguments"
    API->>DB: Fetch Case context
    API->>LLM: Generate search embeddings for query
    LLM-->>API: Vector [0.1, 0.5, ...]
    
    API->>Chroma: KNN Search (limit=5)
    Chroma-->>API: Return top 5 chunk IDs (vector_id)
    
    API->>DB: Fetch DocumentChunks via vector_ids
    API->>LLM: Synthesize chunks + query into final summary
    LLM-->>API: "In State v. Sharma, the court held..."
    
    API->>DB: Save PrecedentResult
    API-->>Lawyer: Return synthesized answer + strict citations
```
