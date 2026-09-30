from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from .models import CaseStatus, CasePriority, DocumentStatus, EntityType, CitationStatus

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
    case_number: Optional[str] = None
    client_name: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    fir_number: Optional[str] = None
    case_type: Optional[str] = None
    priority: Optional[CasePriority] = CasePriority.MEDIUM
    summary: Optional[str] = None
    lead_counsel: Optional[str] = None
    statutes: Optional[List[str]] = None
    filed_on: Optional[datetime] = None

class CaseDetailResponse(BaseSchema):
    id: str
    title: str
    case_number: Optional[str] = None
    client_name: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    fir_number: Optional[str] = None
    case_type: Optional[str] = None
    status: CaseStatus
    priority: CasePriority
    summary: Optional[str] = None
    lead_counsel: Optional[str] = None
    statutes: Optional[List[str]] = None
    filed_on: Optional[datetime] = None
    documents_count: int = 0
    next_hearing_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None

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

class PrecedentSearchRequest(BaseSchema):
    query: str
    case_id: Optional[str] = None
    top_k: int = 10

class PrecedentSearchResultItem(BaseSchema):
    docid: str
    title: str
    headline: str
    vector_sim: float
    citation_status: str
    court: Optional[str] = None
    date: Optional[str] = None

class PrecedentSearchResponse(BaseSchema):
    query: str
    results: List[PrecedentSearchResultItem]
    
class PrecedentSummaryRequest(BaseSchema):
    docid: str
    query: str
    
class PrecedentSummaryResponse(BaseSchema):
    ai_summary: str
    provider: str

class SavePrecedentRequest(BaseSchema):
    precedent_id: str
    source_judgment_url: str
    source_title: str
    court_name: Optional[str] = None
    ai_summary: str
    relevance_score: Optional[float] = None
    citation_status: CitationStatus
    query_context: Optional[str] = None
