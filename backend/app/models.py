from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON, Index, Integer
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import enum
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

# --- Enums ---
class UserRole(enum.Enum):
    LAWYER = "LAWYER"
    PARALEGAL = "PARALEGAL"
    ADMIN = "ADMIN"

class DocumentStatus(enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING_OCR = "PROCESSING_OCR"
    PROCESSING_AI = "PROCESSING_AI"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class EntityType(enum.Enum):
    JUDGE = "JUDGE"
    WITNESS = "WITNESS"
    PARTY = "PARTY"
    ADVOCATE = "ADVOCATE"
    ACCUSED = "ACCUSED"
    LOCATION = "LOCATION"
    STATUTE = "STATUTE"
    DATE = "DATE"
    ORGANIZATION = "ORGANIZATION"
    COURT = "COURT"
    CASE_NUMBER = "CASE_NUMBER"

class EventType(enum.Enum):
    INCIDENT = "INCIDENT"
    ARREST = "ARREST"
    FILING = "FILING"
    HEARING = "HEARING"
    ORDER = "ORDER"
    JUDGMENT = "JUDGMENT"

class CaseStatus(enum.Enum):
    OPEN = "OPEN"
    PENDING_HEARING = "PENDING_HEARING"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class CitationStatus(enum.Enum):
    PARTY = "PARTY"
    NEUTRAL = "NEUTRAL"
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"

# --- Models ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LAWYER, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    cases = relationship("Case", back_populates="user")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    title = Column(String, nullable=False)
    client_name = Column(String)
    court_name = Column(String)
    judge_name = Column(String)
    fir_number = Column(String)
    case_type = Column(String)
    status = Column(Enum(CaseStatus), default=CaseStatus.OPEN, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    timeline = relationship("TimelineEvent", back_populates="case")
    precedents = relationship("PrecedentResult", back_populates="case")

    __table_args__ = (
        Index("ix_cases_user_id", "user_id"),
        Index("ix_cases_status", "status"),
        Index("ix_cases_court_name", "court_name"),
        Index("ix_cases_fir_number", "fir_number"),
    )

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="RESTRICT"), nullable=False)
    
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False)
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    case = relationship("Case", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")
    entities = relationship("ExtractedEntity", back_populates="document")
    timeline_events = relationship("TimelineEvent", back_populates="source_doc")

    __table_args__ = (
        Index("ix_documents_case_id", "case_id"),
    )

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    text_content = Column(Text, nullable=False)
    
    vector_id = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_doc_chunks_doc_id", "document_id"),
        Index("ix_doc_chunks_vector_id", "vector_id"),
    )

class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    entity_type = Column(Enum(EntityType), nullable=False)
    value = Column(String, nullable=False)
    statute_framework = Column(String, nullable=True)
    context = Column(Text, nullable=True)
    page_number = Column(Integer, nullable=True)
    bounding_box = Column(JSON, nullable=True)
    
    confidence = Column(Float, nullable=True) 
    
    is_user_corrected = Column(Boolean, default=False, nullable=False)
    original_value = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    document = relationship("Document", back_populates="entities")
    corrections = relationship("CorrectionLog", back_populates="extracted_entity")

    __table_args__ = (
        Index("ix_extracted_entities_doc_id", "document_id"),
    )

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    source_doc_id = Column(String, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    
    event_date = Column(DateTime(timezone=True), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    description = Column(Text, nullable=False)
    
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    confidence = Column(Float, nullable=True)
    
    is_user_corrected = Column(Boolean, default=False, nullable=False)
    original_desc = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    case = relationship("Case", back_populates="timeline")
    source_doc = relationship("Document", back_populates="timeline_events")
    corrections = relationship("CorrectionLog", back_populates="timeline_event")

    __table_args__ = (
        Index("ix_timeline_events_case_id", "case_id"),
    )

class PrecedentResult(Base):
    __tablename__ = "precedent_results"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)

    source_judgment_url = Column(String, nullable=False)
    source_title = Column(String, nullable=False)
    court_name = Column(String, nullable=True)
    judgment_date = Column(DateTime(timezone=True), nullable=True)

    ai_summary = Column(Text, nullable=False)
    relevance_score = Column(Float, nullable=True)
    citation_status = Column(Enum(CitationStatus), default=CitationStatus.PARTY, nullable=False)
    
    query_context = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    case = relationship("Case", back_populates="precedents")

    __table_args__ = (
        Index("ix_precedent_results_case_id", "case_id"),
    )

class CorrectionLog(Base):
    __tablename__ = "correction_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    extracted_entity_id = Column(String, ForeignKey("extracted_entities.id", ondelete="SET NULL"), nullable=True)
    timeline_event_id = Column(String, ForeignKey("timeline_events.id", ondelete="SET NULL"), nullable=True)
    
    old_value = Column(Text, nullable=False)
    new_value = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    extracted_entity = relationship("ExtractedEntity", back_populates="corrections")
    timeline_event = relationship("TimelineEvent", back_populates="corrections")
    
    __table_args__ = (
        Index("ix_corr_logs_extracted_entity_id", "extracted_entity_id"),
        Index("ix_corr_logs_timeline_event_id", "timeline_event_id"),
    )
