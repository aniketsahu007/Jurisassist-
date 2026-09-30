# jurisAssist — Project Status

_Last updated: 27 September 2026_

---

## Completed

### Phase 0 — Rebranding & Framework Migration ✅
- Renamed project from "Lexora" → **jurisAssist**
- Migrated from SSR (TanStack Start) to a pure Vite React SPA
- Set up TanStack Router (file-based), TanStack Query, Tailwind CSS v4, shadcn/ui

### Phase 1 — Architecture & Contracts ✅
- PostgreSQL schema (8 tables: users, cases, documents, chunks, entities, timeline_events, precedent_results, correction_logs) — `backend/app/models.py`
- Pydantic API schemas — `backend/app/schemas.py`
- Architecture documented — `docs/architecture.md`
- Alembic migrations applied to Supabase
- AI evaluation framework scaffolded — `backend/eval/ground_truth.json`

### Phase 2 — Core Platform (Non-AI) ✅
- FastAPI + SQLAlchemy connected to Supabase PostgreSQL
- Case CRUD API (`/api/v1/cases`) with ownership, pagination, search
- Document upload: presigned URL two-step flow (files go directly to Supabase Storage, never touch API server)
- Frontend hooks (`useCases`, `useDocuments`) wired to live FastAPI via TanStack Query

### Phase 2.5 — Authentication Migration ✅  _(completed today)_
> Previously used **Clerk** — migrated to **Supabase Auth + Google OAuth**

- `src/lib/supabase.ts` — Supabase browser client singleton
- `src/features/auth/AuthProvider.tsx` — session context, `signInWithGoogle()`, `signOut()`
- `src/features/auth/SignUpPage.tsx` — Google OAuth sign-in UI
- `src/routes/sign-up.tsx` — public route, `beforeLoad` redirects if already authenticated
- `src/routes/auth.callback.tsx` — PKCE code exchange after Google consent
- `src/components/layout/AppShell.tsx` — auth guard, redirects unauthenticated users to `/sign-up`
- `src/components/layout/Topbar.tsx` — shows real user avatar + name from Google; sign-out dropdown

### Phase 2.6 — Folder Restructure ✅  _(completed today)_
Dissolved the flat `src/pages/` and `src/hooks/` directories into a **feature-slice architecture**:

```
src/features/
├── auth/           AuthProvider, SignUpPage
├── assistant/      AIAssistantPage, useAssistant
├── cases/          CasesPage, useCases
├── dashboard/      DashboardPage, useDashboard
├── documents/      DocumentUploadPage, DocumentViewerPage, useDocuments
├── intelligence/   AIMemoryPage, AIReportPage, PatternAnalysisPage,
│                   PrecedentSearchPage, useMemoryBank, usePatterns,
│                   usePrecedents, useReport
├── landing/        LandingPage
├── notifications/  NotificationsPage, useNotificationCenter
├── settings/       ProfilePage, SettingsPage, useProfile, useSettings
└── timeline/       CaseTimelinePage, useTimeline
```

`src/lib/` now holds only pure utilities: `api.ts`, `supabase.ts`, `theme.tsx`, `utils.ts`, `use-mobile.tsx`  
Build: ✅ 0 errors, 2646 modules

### Phase 3 — Document Processing Pipeline (OCR) ✅
- Set up document download from Supabase Storage locally
- Set up background task queue for document processing (`app/tasks.py`)
- Extracted basic text and confidence scores

### Phase 4 & Phase 5 — AI Intelligence & Vector Ingestion ✅
- Implemented `EntityExtractor` with spaCy NLP and regex heuristics. Fixed OOM crashes by batching text via `nlp.pipe()`
- Implemented `TimelineBuilder` for classifying legal events and dates
- Implemented `DocumentChunker` to intelligently split text along sentence boundaries. Fixed infinite loop edge cases.
- Set up local ChromaDB vector store with ONNX `all-MiniLM-L6-v2` for highly efficient embeddings

---

### Phase 5 — Precedent Retrieval (Live Search) ✅
- Implemented live IndianKanoon pipeline + MiniLM reranker. Functional, pending human evaluation.

---

### Phase 6 — Grounded Generation (LLM Layer) ✅
- LLM Provider Fallback Chain (Groq: Llama3 -> Mixtral -> Gemma) implemented in `llm_chain.py`.
- PII Stripper implemented via spaCy/regex and unit tested.
- Lazy-loading TanStack queries integrated into UI (`usePrecedents.ts`).
- Strict code-level grounding check preventing hallucinated citations.
- Disclaimers ("Verify before citing") and provider attribution active on the frontend.
- API REST endpoints `POST /search`, `POST /generate-summary`, and `GET/POST/DELETE` for persistence built.

---

## Pending

> Phase 7: Agent Layer (AI Assistant / Orchestration) is the next immediate task.

---

## Still on mock data (expected — future phases)

| Feature | Hook | Phase |
|---|---|---|
| Dashboard metrics & charts | `useDashboard.ts` | 4 |
| Case timeline | `useTimeline.ts` | 4 |
| AI Assistant | `useAssistant.ts` | 7 |
| Memory bank | `useMemoryBank.ts` | 8 |
| Pattern analysis | `usePatterns.ts` | 8 |
| Profile, Settings, Notifications, Reports | — | future |

---

## What's Next

1. Start both the Vite frontend server and FastAPI backend server.
2. Go to the Precedents Search page in the UI and test the complete pipeline!
