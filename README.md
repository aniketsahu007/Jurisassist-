# Legal Insight Hub

Build a modern, professional, AI-powered Legal Intelligence Platform — frontend only.

TECH STACK:

- Vite + React + TypeScript

- React Router for routing (NOT Next.js — no server actions, no API routes)

- Tailwind CSS

- shadcn/ui + Radix UI

- lucide-react icons

- Recharts for charts

HARD CONSTRAINTS:

- Frontend only. Do NOT create authentication, backend APIs, database schemas, or server-side logic.

- Do NOT enable or configure Supabase — this app will connect to a separate FastAPI backend later. Leave that as a future integration point, not a live one.

- All data must be realistic dummy legal data (real-sounding case names, statutes, judges, courts, FIR numbers) — never lorem ipsum.

- Put all mock data in typed files under src/data/ (e.g. cases.ts, documents.ts), and access it through hooks like useCases() so it can be swapped for real API calls later with minimal refactor.

PROJECT STRUCTURE:

src/pages, src/components, src/data, src/hooks, src/lib

DESIGN:

Enterprise SaaS feel — comparable density and polish to Notion, Linear, Cursor, Vercel Dashboard. Full responsive design, dark mode + light mode toggle, purposeful animations, loading skeletons, empty states, professional spacing. Give it a distinct visual identity, not generic shadcn defaults.

BUILD THIS PHASE — App Shell + Dashboard + Case Management:

1. App Shell

   - Sidebar navigation (Dashboard, Cases, Documents, Timeline, AI Assistant, Reports, Precedent Search, AI Memory, Pattern Analysis, Notifications, Profile, Settings)

   - Top navbar with search, notifications bell, theme toggle, profile menu

   - Responsive layout with collapsible sidebar

2. Dashboard page

   - Cards: Active Cases, Cases Uploaded Today, Upcoming Hearings, AI Reports Generated

   - Recent Activity feed

   - Notifications preview panel

   - At least 2 charts with mock data (e.g. cases by status, hearings over time)

3. Case Management page

   - Case cards showing: Case Name, Client, Court, Judge, FIR Number, Case Type, Current Status, Next Hearing, Last Updated

   - Search bar, filter dropdowns, sort control, pagination

   - At least 12 realistic mock cases

Do not build any other pages yet — I'll continue in follow-up messages.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
