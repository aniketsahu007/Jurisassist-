import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/features/settings/SettingsPage";

const title = "Settings — jurisAssist";
const description =
  "General workspace preferences, security controls and integration placeholders for WhatsApp, Indian Kanoon, OpenAI, Claude, ChromaDB, Redis, PostgreSQL and FastAPI.";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});
