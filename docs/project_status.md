# jurisAssist — Project Status

_Last updated: 14 September 2026_

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

---

## Pending (requires manual action from you)

> [!IMPORTANT]
> Auth won't work until you do these 3 things:
> 1. **Google Cloud Console** → Create OAuth 2.0 Client ID → add redirect URI: `https://mfogdggfobjrmljkplbl.supabase.co/auth/v1/callback`
> 2. **Supabase Dashboard** → Authentication → Providers → Google → paste Client ID + Secret → Enable; set Site URL to `http://localhost:5173`
> 3. **`.env`** → replace `PASTE_YOUR_ANON_KEY_HERE` with your real Supabase anon key (Project Settings → API)

---

## Still on mock data (expected — future phases)

| Feature | Hook | Phase |
|---|---|---|
| Dashboard metrics & charts | `useDashboard.ts` | 4 |
| Case timeline | `useTimeline.ts` | 4 |
| Precedent search | `usePrecedents.ts` | 5 |
| AI Assistant | `useAssistant.ts` | 7 |
| Memory bank | `useMemoryBank.ts` | 8 |
| Pattern analysis | `usePatterns.ts` | 8 |
| Profile, Settings, Notifications, Reports | — | future |

---

## What's Next

See the **Next Steps** section below.
