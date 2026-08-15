# Product Requirements Document: AI Legal Intelligence Platform (Codename: DSN2098)

**Version:** 1.1 (Draft for Review)
**Author:** Engineering
**Status:** Pre-development — pending validation items in Section 10

---

## 1. Overview

An AI-assisted workspace for lawyers (initial focus: Indian criminal/civil litigation practitioners) that converts unstructured case documents — FIRs, chargesheets, witness statements, judgments, contracts — into structured, searchable, actionable information. Delivered via a web dashboard and a WhatsApp channel.

**Positioning statement (must ship baked into the product, not just the docs):** _"A research and organization assistant — not a substitute for legal judgment, and not a source of legal advice."_

---

## 2. Problem Statement

Three distinct, validated pain points (do not conflate — each needs different engineering):

1. **No case narrative.** A case folder is a pile of dated files, not a timeline. Reconstructing case status before every hearing is manual, repeated work.
2. **Precedent research doesn't scale.** Finding similar past judgments depends on personal memory or manual portal search (Indian Kanoon); this breaks down as caseload grows and disadvantages junior lawyers without years of case memory.
3. **No institutional memory.** Nothing is learned across a lawyer's own case history — recurring mistakes, mis-cited sections, argument success/failure patterns exist only informally.

Underlying issue: legal case data is captured as unstructured documents and never converted into structured, queryable knowledge.

---

## 3. Goals

- Reduce manual document-reading time per case.
- Give lawyers a reliable, auto-generated case timeline.
- Surface relevant precedents with grounded citations (not hallucinated).
- Build per-lawyer pattern memory that improves with use.
- Support both legacy (IPC/CrPC/Evidence Act) and new (BNS/BNSS/BSA) frameworks.

### Non-goals (explicitly out of scope — must be stated in-product)

- Not legal advice.
- Not guaranteed-accurate clause/section interpretation.
- Not fully automated court-ready drafting — output is always a first draft for lawyer review.
- Does not replace lawyer judgment or predict case outcomes.

---

## 4. Target Users

- **Primary:** Individual litigators / small firm lawyers (criminal + civil), handling high document volume.
- **Secondary:** Paralegals/associates doing research and drafting support for senior lawyers.

_(No user interviews are documented yet beyond a planned conversation with one criminal-lawyer contact. This PRD should be revised after that conversation — see Section 10.)_

---

## 5. Scope: MVP vs. Later Phases

The source documents describe 13+ features and an 8-phase build. Building all of it in parallel is a recipe for shipping nothing well. Recommended cut:

### MVP (V1) — build first, demo-able end to end

| Feature                                 | Notes                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Document upload (PDF, image) — web only | WhatsApp comes after web is stable                                                               |
| OCR + text extraction                   | Tesseract baseline; flag accuracy limits, don't hide them                                        |
| Entity extraction (NER)                 | Dates, party names, court, FIR number, sections — rule-based + spaCy, not a fine-tuned model yet |
| Case timeline builder                   | Chronological list view; flowchart view is a stretch goal, not MVP                               |
| Document summarization                  | Plain-language summary of a single uploaded document                                             |
| Similar-case retrieval (RAG)            | **Blocked on Section 10.1 — see open question**                                                  |
| Basic per-user case history             | Storage only; pattern _detection_ is V2                                                          |

### V2 — after MVP is validated with a real user

- WhatsApp channel
- Contract clause explanation, risk flagging, contract comparison, redline suggestions
- Pattern recognition / recurring-mistake detection
- Deadline tracking & reminders
- Personalized AI memory (cross-case reasoning, not just storage)

### V3 / Not committed

- Evidence compliance checker (SHA-256 hashing, BSA §63 certificates) — legally sensitive, needs domain expert sign-off before building
- Multi-agent orchestration layer — add only once individual pipeline steps (OCR→NER→RAG→LLM) are each reliable standalone; don't build agent routing on top of unproven components

---

## 6. Functional Requirements

**FR1 — Upload:** User uploads PDF or image via web. System validates file type/size, stores original, queues for processing.

**FR2 — Text extraction:** Digital PDFs → PyMuPDF/pdfplumber. Scanned/image docs → Tesseract OCR. System must flag low-confidence OCR output to the user rather than silently presenting garbled text as ground truth.

**FR3 — Entity extraction:** Extract FIR number, case number, court name, judge name, party names, sections applied, dates, witness names. Store as structured metadata linked to source document.

**FR4 — Timeline generation:** Order extracted dated events chronologically per case; render as a list view. User can manually correct/reorder if extraction is wrong (this is required — auto-extraction will make mistakes, and there must be a correction path).

**FR5 — Summarization:** Given a document, produce: short summary, key facts, key arguments, outcome (if applicable). Must not fabricate content not present in the source.

**FR6 — Similar-case retrieval:** Given a case's extracted facts/sections, embed the query and search the vector database for similar judgments, return top-N results with an LLM-generated summary of each, **each summary linked to the source judgment URL**. No summary may be shown without a source link.

**FR7 — Case storage & auth:** Each lawyer's cases are private to their account. Standard auth (JWT), role-based access if firm accounts are supported later.

**FR8 — Disclaimer surfacing:** Every AI-generated output (summary, similar-case result, draft) must carry a visible "AI-generated, verify independently" indicator. This is a requirement, not a UI nicety.

---

## 7. Non-Functional Requirements

- **Data sensitivity:** Case files are confidential client legal data. Encryption at rest and in transit is a Day 1 requirement, not deferred to "before production." Access control per user account from the start.
- **Grounding / hallucination control:** No similar-case or citation output may be presented without a retrievable source. RAG grounding via the vector DB is mandatory for any output that references case law.
- **Accuracy transparency:** OCR and NER confidence should be surfaced to the user, not hidden behind a clean-looking UI that overstates reliability.
- **Latency:** Document processing (OCR → NER → timeline) should complete within a few minutes per document — matches the "insights within minutes" goal in the source docs; not a hard real-time requirement.
- **Availability:** Demo/MVP-grade (single-region cloud, free-tier acceptable). Not production SLA at this stage.

---

## 8. Proposed Architecture

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** FastAPI (Python) — keeps AI pipeline and API in one language

- **Database / Storage layer:**
  - **PostgreSQL** — users, case metadata, document records
  - **Redis** — cache repeated precedent queries, avoid redundant paid API calls
  - **Chroma (vector database)** — stores embeddings of judgments and case documents for semantic similarity search; this is what FR6's retrieval step queries against

- **OCR / Document Parsing:**
  - Tesseract OCR (free baseline)
  - Google Vision / AWS Textract (paid fallback for poor scans/handwriting)
  - PyMuPDF / pdfplumber for digitally-typed PDFs, bypassing OCR where not needed

- **NLP:** spaCy or custom-trained NER model — extracts dates, section numbers, party names, court names; feeds the timeline builder

- **AI Core:**
  - LLM (Claude/GPT-class) — summarization, clause explanation, plain-language rewriting
  - RAG pipeline — queries the Chroma vector DB for relevant judgments _before_ the LLM generates a similar-case response, so output is grounded in retrieved text rather than model memory

- **Orchestration (V2+, not MVP):** LangChain/LangGraph to chain OCR → NLP → retrieval (vector DB) → LLM into a single pipeline; agent layer to route between extraction/retrieval/drafting tasks once each step is independently reliable

- **Deployment:** Docker containers; AWS/GCP free tier sufficient for MVP demo scale

---

## 9. Success Metrics

- % of uploaded documents where OCR + NER extraction requires no manual correction
- Time from upload to usable timeline (target: under 5 minutes)
- % of similar-case results with a valid, working source link (target: 100% — non-negotiable)
- Qualitative: does the lawyer contact confirm this saves real time vs. their current workflow (this is the actual validation gate before V2)

---

## 10. Open Questions / Blocking Risks

**10.1 — IndianKanoon API access (BLOCKING for FR6).** Source concept docs list "no official public API, scraping is fragile and may violate ToS" as the single biggest risk. The project summary separately describes a real IndianKanoon API product with a free non-commercial tier (₹10,000/month, subject to use-case verification). **These need to be reconciled before Phase 5/FR6 work starts** — confirm actual API access and verification status directly with IndianKanoon before building the retrieval pipeline on an assumption either way.

**10.2 — Lawyer validation not yet done.** Scope in this PRD is based on assumed pain points, not confirmed ones. The planned conversation with a practicing criminal lawyer should happen before MVP feature list is finalized.

**10.3 — NER on Indian legal text.** Mixed English/Hindi/regional language, inconsistent court formatting, and dual legacy/new statute frameworks (IPC vs. BNS etc.) make this harder than generic NER. Budget for underperformance initially; don't commit to accuracy numbers until tested on real documents.

**10.4 — Liability framing.** Legal and ethical review of disclaimer language and data handling should happen before any real client data touches the system, even in demo form.

---
