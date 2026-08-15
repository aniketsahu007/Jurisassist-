from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from ..database import get_db
from ..auth import get_current_user
from ..models import Case, Document, DocumentStatus
from ..schemas import DocumentSummary, DocumentStatusResponse, PaginatedDocumentResponse
from ..storage import create_signed_upload_url, create_signed_download_url

router = APIRouter(tags=["Documents"])


# --- Request/Response helpers ---

class DocumentUploadRequest(BaseModel):
    filename: str
    mime_type: str


class DocumentUploadResponse(BaseModel):
    doc_id: str
    presigned_url: str


class DocumentDetailResponse(BaseModel):
    id: str
    filename: str
    status: DocumentStatus
    mime_type: str
    ocr_confidence: Optional[float] = None
    download_url: Optional[str] = None  # Short-lived signed URL for reading the PDF
    created_at: datetime


# --- Helpers ---

def _assert_case_ownership(case_id: str, user_id: str, db: Session) -> Case:
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == user_id,
        Case.deleted_at.is_(None),
    ).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


def _assert_doc_ownership(doc_id: str, user_id: str, db: Session) -> Document:
    doc = (
        db.query(Document)
        .join(Case, Document.case_id == Case.id)
        .filter(
            Document.id == doc_id,
            Case.user_id == user_id,
            Document.deleted_at.is_(None),
        )
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


# --- Endpoints ---

@router.post("/api/v1/cases/{case_id}/documents", response_model=DocumentUploadResponse, status_code=201)
def initiate_upload(
    case_id: str,
    payload: DocumentUploadRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Step 1 of the upload flow.
    Creates a Document record (status=UPLOADED), generates a signed URL pointing
    directly to Supabase Storage, and returns it to the frontend.
    The frontend uploads the binary file directly to Supabase — no file bytes touch our API server.
    """
    _assert_case_ownership(case_id, current_user_id, db)

    new_doc = Document(
        case_id=case_id,
        filename=payload.filename,
        file_url="pending",  # Will be set after upload confirmation
        mime_type=payload.mime_type,
        status=DocumentStatus.UPLOADED,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    signed_url, file_path = create_signed_upload_url(new_doc.id, payload.filename)

    # Store the final storage path immediately so /confirm knows where to look
    new_doc.file_url = file_path
    db.commit()

    return DocumentUploadResponse(doc_id=new_doc.id, presigned_url=signed_url)


@router.post("/api/v1/documents/{doc_id}/confirm", status_code=202)
def confirm_upload(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Step 2 of the upload flow.
    Called by the frontend after the S3/Supabase direct upload is complete.
    Transitions status to PROCESSING_OCR and enqueues the AI extraction Celery task.
    """
    doc = _assert_doc_ownership(doc_id, current_user_id, db)

    doc.status = DocumentStatus.PROCESSING_OCR
    db.commit()

    # TODO Phase 3: Trigger Celery task here
    # process_document.delay(doc_id)

    return {"status": "queued", "doc_id": doc_id}


@router.get("/api/v1/documents/{doc_id}", response_model=DocumentDetailResponse)
def get_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Retrieve document metadata and a short-lived (1hr) signed download URL for the PDF."""
    doc = _assert_doc_ownership(doc_id, current_user_id, db)

    download_url = None
    if doc.status == DocumentStatus.COMPLETED:
        download_url = create_signed_download_url(doc.file_url)

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        status=doc.status,
        mime_type=doc.mime_type,
        ocr_confidence=doc.ocr_confidence,
        download_url=download_url,
        created_at=doc.created_at,
    )


@router.get("/api/v1/documents/{doc_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Polling endpoint for the frontend.
    Frontend polls every 3s while status is PROCESSING_OCR or PROCESSING_AI,
    backing off to every 10s after 30s of polling.
    Always returns 200 OK — status field communicates the state, never an exception.
    """
    doc = _assert_doc_ownership(doc_id, current_user_id, db)
    return DocumentStatusResponse(
        id=doc.id,
        filename=doc.filename,
        status=doc.status,
        ocr_confidence=doc.ocr_confidence,
        error_message=None,  # TODO: Add error tracking field in Phase 3
    )


@router.post("/api/v1/documents/{doc_id}/retry", status_code=202)
def retry_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Re-queue a FAILED document for AI processing."""
    doc = _assert_doc_ownership(doc_id, current_user_id, db)

    if doc.status != DocumentStatus.FAILED:
        raise HTTPException(status_code=400, detail="Only FAILED documents can be retried")

    doc.status = DocumentStatus.PROCESSING_OCR
    db.commit()

    # TODO Phase 3: Re-trigger Celery task
    # process_document.delay(doc_id)

    return {"status": "retrying", "doc_id": doc_id}


@router.delete("/api/v1/documents/{doc_id}", status_code=204)
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Soft-delete a document. The physical file and DB record are preserved for audit compliance."""
    doc = _assert_doc_ownership(doc_id, current_user_id, db)
    doc.deleted_at = datetime.utcnow()
    db.commit()
    return


@router.get("/api/v1/cases/{case_id}/documents", response_model=PaginatedDocumentResponse)
def list_case_documents(
    case_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Paginated list of documents belonging to a case."""
    _assert_case_ownership(case_id, current_user_id, db)

    query = db.query(Document).filter(
        Document.case_id == case_id,
        Document.deleted_at.is_(None),
    )
    total = query.count()
    docs = query.offset((page - 1) * limit).limit(limit).all()

    return PaginatedDocumentResponse(
        items=[
            DocumentSummary(
                id=d.id,
                filename=d.filename,
                status=d.status,
                created_at=d.created_at,
            )
            for d in docs
        ],
        total=total,
        page=page,
        limit=limit,
    )
