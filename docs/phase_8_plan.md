# Phase 8 — Final Integration, Polish & Wiring

> **Author**: Senior Engineering Lead  
> **Date**: 3 October 2026  
> **Goal**: Eliminate all mock data, wire every button to real logic, and ship a fully functional product.

---

## Executive Summary

Phase 8 is the **final delivery phase**. Every feature on the platform currently has a beautiful frontend UI but many pages still return empty arrays or static mock data from the backend. This phase wires every remaining hook to real database queries, LLM calls, or computed analytics — transforming the prototype into a production-grade application.

**Guiding Principles:**
1. **Zero mock data** — every `@/data/*.ts` import must be eliminated or replaced with backend API calls.
2. **Zero dead buttons** — every clickable element must perform a real action or be explicitly removed.
3. **No regressions** — each sub-task must be tested in isolation before merging.
4. **Graceful empty states** — when data genuinely doesn't exist yet, show helpful empty states instead of broken UIs.

---

## Sub-Phase 8.1 — Dashboard (Real Metrics & Activity Feed)

### Current State
- `dashboard.py` returns live `Active Cases` count from DB, but `activityFeed`, `hearingsOverTime`, `caseTypeMix` are hardcoded empty arrays.
- `useDashboard.ts` already fetches from the API — just needs real data.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.1.1 | Query real case status distribution from `cases` table (group by `status`) | `dashboard.py` | S |
| 8.1.2 | Query real case type distribution from `cases` table (group by `case_type`) | `dashboard.py` | S |
| 8.1.3 | Build activity feed from recent `documents`, `cases`, `conversations` (last 10 events, unioned and sorted by `created_at`) | `dashboard.py` | M |
| 8.1.4 | Count documents processed today for "Cases Uploaded Today" metric | `dashboard.py` | S |
| 8.1.5 | Count AI reports generated (once reports work) for "AI Reports Generated" metric | `dashboard.py` | S |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow queries on large datasets | Dashboard loads slowly | Add `.limit(10)` to activity feed, use `func.count()` aggregations instead of loading full objects |
| Empty dashboard for new users | Confusing first experience | Add "Getting Started" card when `total_cases == 0` with links to create a case and upload documents |

---

## Sub-Phase 8.2 — AI Reports (Full Generation Pipeline)

### Current State
- `reports.py` returns `None` — no logic at all.
- `useReport.ts` falls back to a "Pending Report" placeholder.
- `AIReportPage.tsx` has a rich UI ready to display report sections.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.2.1 | Create `CaseReport` DB model with fields: `case_id`, `user_id`, `status`, `report_json`, `generated_at` | `models.py` | S |
| 8.2.2 | Create DB table migration | CLI | S |
| 8.2.3 | Build `generate_case_report()` service that: (a) fetches all documents + entities + timeline for a case, (b) sends structured prompt to LLM asking for executive summary, key facts, legal issues, risks, contradictions, and (c) saves JSON result to `CaseReport` | `services/report_generator.py` (new) | L |
| 8.2.4 | Wire `GET /reports/{case_id}` to return saved report or trigger generation | `reports.py` | M |
| 8.2.5 | Add `POST /reports/{case_id}/generate` endpoint for explicit re-generation | `reports.py` | S |
| 8.2.6 | Update `useReport.ts` to handle loading/generating states | `useReport.ts` | S |
| 8.2.7 | Wire "Download PDF" button on AIReportPage (generate a simple HTML-to-PDF blob) | `AIReportPage.tsx` | M |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM timeout on large cases with many documents | Report generation fails | Set 30s timeout; chunk documents into batches of 3; generate report section-by-section |
| LLM hallucinating case facts | Inaccurate reports | Apply same grounding check from `llm_chain.py`; add disclaimer banner |
| Report re-generation overwrites old report | User loses previous version | Keep `generated_at` timestamp; optionally store version history (stretch goal) |
| No documents uploaded yet for a case | Empty report | Return specific error: "Upload documents first before generating a report" |

---

## Sub-Phase 8.3 — Pattern Analysis (Computed Analytics)

### Current State
- `patterns.py` returns empty arrays.
- `PatternAnalysisPage.tsx` has charts for judge preferences, success trends, argument heatmaps — all empty.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.3.1 | Query `precedent_results` table grouped by `court_name` to compute judge ruling patterns | `patterns.py` | M |
| 8.3.2 | Query `extracted_entities` where `entity_type = STATUTE` to compute section outcome frequencies | `patterns.py` | M |
| 8.3.3 | Aggregate `precedent_results.relevance_score` and `citation_status` to derive strategy success rates | `patterns.py` | M |
| 8.3.4 | Build heatmap data: cross-reference `judge_name` from cases x `entity_type=STATUTE` from entities | `patterns.py` | L |
| 8.3.5 | Handle empty state gracefully — show "Analyze more cases to see patterns" when insufficient data | `PatternAnalysisPage.tsx` | S |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Insufficient data to show meaningful patterns | Charts look broken with 1-2 data points | Require minimum 3 cases before showing trends; show empty state card otherwise |
| N+1 queries on entities join | Slow response | Use eager loading with `joinedload` or raw SQL aggregations |

---

## Sub-Phase 8.4 — AI Memory Bank (Vector Search Integration)

### Current State
- `memory.py` returns empty `matches[]`.
- `useMemoryBank.ts` returns hardcoded empty arrays for `pastCases`, `strategies`, etc.
- `AIMemoryPage.tsx` has a search UI and category display ready.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.4.1 | Wire `GET /memory?query=` to perform ChromaDB vector search across all user's document chunks | `memory.py` | M |
| 8.4.2 | Return categorized results: group by source document type, case, and entity category | `memory.py` | M |
| 8.4.3 | Compute `pastCases` from user's case history, `strategies` from precedent results, `frequentSections` from entity aggregation | `memory.py` | M |
| 8.4.4 | Add "Save Note" functionality — `POST /memory/notes` with a simple text note stored in DB | `memory.py`, new `UserNote` model | M |
| 8.4.5 | Update `useMemoryBank.ts` to consume real API responses | `useMemoryBank.ts` | S |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| ChromaDB not initialized or empty | 500 error on search | Wrap in try/except; return empty matches with a helpful message |
| Vector search returns irrelevant chunks | Poor user experience | Apply relevance score threshold (>0.5); sort by score descending |

---

## Sub-Phase 8.5 — Notifications (Real Event System)

### Current State
- `useNotificationCenter.ts` initializes with empty `[]`.
- No backend notification model or API.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.5.1 | Create `Notification` DB model: `id`, `user_id`, `type`, `title`, `body`, `read`, `created_at` | `models.py` | S |
| 8.5.2 | Create DB table | CLI | S |
| 8.5.3 | Create `GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/{id}/dismiss` endpoints | `routers/notifications.py` (new) | M |
| 8.5.4 | Emit notifications on key events: document processing complete, report generated, new precedent found | Various services | M |
| 8.5.5 | Update `useNotificationCenter.ts` to fetch from API instead of local state | `useNotificationCenter.ts` | S |
| 8.5.6 | Wire bell icon in Topbar to show real unread count | `Topbar.tsx` | S |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Too many notifications generated | Notification fatigue | Rate-limit: max 1 notification per event type per case per hour |
| Topbar re-renders on every notification query | Performance hit | Use `staleTime: 30000` on the query; poll every 30s, not on every render |

---

## Sub-Phase 8.6 — Profile & Settings (Remove All Mock Data)

### Current State
- `useProfile.ts` imports from `@/data/profile` — mock firm info, billing, API keys.
- `useSettings.ts` imports from `@/data/settings` — mock integrations, security events.
- Profile page shows real name/email from Supabase Auth but mock data for everything else.

### Tasks
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8.6.1 | Create `UserProfile` DB model: `user_id`, `designation`, `bar_council_id`, `phone`, `bio`, `practice_areas`, `firm_name`, `firm_role` | `models.py` | S |
| 8.6.2 | Create `GET /profile` and `PUT /profile` endpoints | `routers/profile.py` (new) | M |
| 8.6.3 | Rewrite `useProfile.ts` to fetch from API; remove `@/data/profile` import | `useProfile.ts` | M |
| 8.6.4 | Make "Edit Profile" button open a modal/form that PUTs to `/profile` | `ProfilePage.tsx` | M |
| 8.6.5 | Replace mock billing section with a "Free Plan" static card (no real billing needed) | `ProfilePage.tsx` | S |
| 8.6.6 | Replace mock API keys section with "Coming Soon" card | `ProfilePage.tsx` | S |
| 8.6.7 | Replace mock integrations in Settings with theme toggle + notification preferences (already partially working) | `SettingsPage.tsx`, `useSettings.ts` | M |
| 8.6.8 | Remove all unused `@/data/profile.ts` and `@/data/settings.ts` files | Cleanup | S |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Profile doesn't exist for user on first login | 404 error | Auto-create profile row on first `GET /profile` (upsert pattern) |
| Removing `@/data/` files breaks imports elsewhere | Build errors | Grep for all imports from `@/data/profile` and `@/data/settings` before deleting; update all consumers |

---

## Sub-Phase 8.7 — Dead Button Audit & Fix

### Current State
Various buttons across the app trigger `alert()` or do nothing.

### Tasks
| # | Task | Location | Action |
|---|------|----------|--------|
| 8.7.1 | "Download PDF" on Reports page | `AIReportPage.tsx` | Wire to HTML-to-PDF generation |
| 8.7.2 | "Export" buttons on various pages | Multiple | Wire to CSV/JSON download |
| 8.7.3 | "Share" button on Precedent results | `PrecedentSearchPage.tsx` | Copy-to-clipboard with toast |
| 8.7.4 | "New Case" button on Dashboard | `DashboardPage.tsx` | Navigate to `/cases` with create dialog open |
| 8.7.5 | "Mark all read" on Notifications | `NotificationsPage.tsx` | Wire to bulk PATCH API |
| 8.7.6 | Quick action buttons on AI Assistant | `AIAssistantPage.tsx` | Wire to `send()` with pre-filled prompts |
| 8.7.7 | Search bar in Topbar | `Topbar.tsx` | Wire to global search API or navigate to relevant page |

### Side Effects & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Button wiring introduces new API calls that don't exist | 404 errors | Audit each button's target endpoint exists before wiring |
| PDF generation requires server-side library | Dependency bloat | Use client-side `html2canvas` + `jsPDF` or simple `window.print()` |

---

## Sub-Phase 8.8 — Data Cleanup and Build Verification

### Current State
`src/data/` contains 6 mock data files that are still imported by some hooks.

### Tasks
| # | Task | File | Consumers |
|---|------|------|-----------|
| 8.8.1 | Remove `@/data/profile.ts` | After 8.6.3 | `useProfile.ts` |
| 8.8.2 | Remove `@/data/settings.ts` | After 8.6.7 | `useSettings.ts` |
| 8.8.3 | Remove `@/data/notifications.ts` | After 8.5.5 | `useNotificationCenter.ts` |
| 8.8.4 | Audit `@/data/cases.ts` — verify no remaining consumers | After 8.1 | `useCases.ts` (should already be API-driven) |
| 8.8.5 | Audit `@/data/documents.ts` — verify no remaining consumers | After 8.1 | `useDocuments.ts` |
| 8.8.6 | Audit `@/data/timeline.ts` — only keep TypeScript type exports if needed | After 8.1 | `useTimeline.ts` |
| 8.8.7 | Final build verification: `npm run build` with 0 errors | — | — |

---

## Execution Order (Dependency-Aware)

### Recommended order:
1. **8.6** (Profile/Settings) — smallest scope, highest user visibility
2. **8.5** (Notifications) — enables event emission for later phases
3. **8.1** (Dashboard) — quick wins with real DB queries
4. **8.2** (Reports) — largest scope, most complex LLM integration
5. **8.3** (Patterns) — depends on having precedent data
6. **8.4** (Memory) — depends on ChromaDB being populated
7. **8.7** (Button audit) — sweep after all APIs exist
8. **8.8** (Cleanup) — final pass, build verification

---

## Definition of Done

- [ ] `npm run build` produces 0 errors
- [ ] `src/data/` directory contains only TypeScript type definitions (no mock data)
- [ ] Every sidebar nav link leads to a functional page
- [ ] Every button performs a real action (or is removed)
- [ ] Dashboard shows live metrics from the database
- [ ] AI Reports can be generated and downloaded
- [ ] Notifications appear when events occur
- [ ] Profile can be viewed and edited
- [ ] No `alert("Phase 8")` calls remain in the codebase
