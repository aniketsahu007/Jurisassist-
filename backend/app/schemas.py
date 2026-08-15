from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from .models import CaseStatus, DocumentStatus, EntityType, CitationStatus

def to_camel(string: str) -> str:
    parts = iter(string.split('_'))
    return next(parts) + ''.join(word.title() for word in parts)

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# --- Errors ---
class ErrorResponse(BaseSchema):
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None

# --- Case Schemas ---
class CaseCreateRequest(BaseSchema):
    title: str
    client_name: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    fir_number: Optional[str] = None
    case_type: Optional[str] = None

class CaseDetailResponse(BaseSchema):
    id: str
    title: str
    client_name: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    fir_number: Optional[str] = None
    status: CaseStatus
    next_hearing_date: Optional[datetime] = None

class PaginatedCaseResponse(BaseSchema):
    items: List[CaseDetailResponse]
    total: int
    page: int
    limit: int

# --- Document Schemas ---
class DocumentUploadRequest(BaseSchema):
    filename: str
    mime_type: str

class DocumentUploadResponse(BaseSchema):
    doc_id: str
    presigned_url: str

class DocumentStatusResponse(BaseSchema):
    id: str
    filename: str
    status: DocumentStatus
    ocr_confidence: Optional[float] = None
    error_message: Optional[str] = None

class DocumentSummary(BaseSchema):
    id: str
    filename: str
    status: DocumentStatus
    created_at: datetime

class PaginatedDocumentResponse(BaseSchema):
    items: List[DocumentSummary]
    total: int
    page: int
    limit: int

# --- Timeline & Precedent Schemas ---
class TimelineEventResponse(BaseSchema):
    id: str
    event_date: datetime
    event_type: str
    description: str
    is_ai_generated: bool
    confidence: Optional[float] = None
    is_user_corrected: bool

class PaginatedTimelineResponse(BaseSchema):
    items: List[TimelineEventResponse]
    total: int
    page: int
    limit: int

class PrecedentSummary(BaseSchema):
    id: str
    source_judgment_url: str
    source_title: str
    court_name: Optional[str] = None
    judgment_date: Optional[datetime] = None
    ai_summary: str
    relevance_score: Optional[float] = None
    citation_status: CitationStatus

class PaginatedPrecedentResponse(BaseSchema):
    items: List[PrecedentSummary]
    total: int
    page: int
    limit: int

# --- Correction Schemas ---
class EntityCorrectionRequest(BaseSchema):
    new_value: Optional[str] = None
    new_type: Optional[EntityType] = None

class TimelineCorrectionRequest(BaseSchema):
    new_description: Optional[str] = None
    new_event_date: Optional[datetime] = None
