# jurisAssist — Project Status

_Last updated: 3 October 2026_

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

### Phase 2.5 — Authentication Migration ✅
> Previously used **Clerk** — migrated to **Supabase Auth + Google OAuth**

- `src/lib/supabase.ts` — Supabase browser client singleton
- `src/features/auth/AuthProvider.tsx` — session context, `signInWithGoogle()`, `signOut()`
- `src/features/auth/SignUpPage.tsx` — Google OAuth sign-in UI
- `src/routes/sign-up.tsx` — public route, `beforeLoad` redirects if already authenticated
- `src/routes/auth.callback.tsx` — PKCE code exchange after Google consent
- `src/components/layout/AppShell.tsx` — auth guard, redirects unauthenticated users to `/sign-up`
- `src/components/layout/Topbar.tsx` — shows real user avatar + name from Google; sign-out dropdown

### Phase 2.6 — Folder Restructure ✅
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

### Phase 7 — Agent Layer & AI Assistant ✅  _(completed 3 October 2026)_
- **Agent Orchestrator** (`agent_orchestrator.py`): Two-step LLM pipeline — intent routing → tool dispatch → grounded final answer. Routes to `find_similar_cases` (precedent engine) and `extract_timeline` tools.
- **Conversation Persistence**: Full CRUD for `Conversation` + `ConversationMessage` models in PostgreSQL. Backend endpoints: `GET/POST /assistant/chat`, `GET /conversations`, `GET /conversations/{id}`, `DELETE /conversations/{id}`.
- **Chat History in UI**: `useAssistant.ts` refactored to save/load conversations from DB. Sidebar lists all past conversations; clicking restores full message history.
- **Chat Memory**: Last 5 messages injected into LLM context for multi-turn continuity. Duplicate message deduplication in orchestrator prevents empty responses.
- **Profile Page**: Shows real user data from Supabase Auth (name, email, avatar) instead of static mock data.
- **Theme Update**: Dark mode changed from violet tint to premium neutral black palette.

---

## Pending

> Phase 8: Final Integration, Polish & Wiring is the next immediate task.

---

## Still on mock data (to be addressed in Phase 8)

| Feature | Hook / File | What's mock |
|---|---|---|
| Dashboard charts | `useDashboard.ts` / `dashboard.py` | activityFeed, hearingsOverTime, caseTypeMix hardcoded |
| AI Reports | `useReport.ts` / `reports.py` | Backend returns `None` — no report generation logic |
| Pattern Analysis | `usePatterns.ts` / `patterns.py` | Backend returns empty arrays — no analysis logic |
| AI Memory Bank | `useMemoryBank.ts` / `memory.py` | Backend returns empty arrays — no search logic |
| Notifications | `useNotificationCenter.ts` | Initializes to empty `[]`, no backend integration |
| Profile details | `useProfile.ts` | Still imports from `@/data/profile` for firm, billing, API keys |
| Settings | `useSettings.ts` | Still imports from `@/data/settings` for integrations, security events |
| Case Timeline | `useTimeline.ts` | Fetches from API but backend may return empty |

---

## What's Next

1. Execute Phase 8 — see `docs/phase_8_plan.md`
