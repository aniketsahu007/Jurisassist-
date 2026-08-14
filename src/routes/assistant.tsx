import { createFileRoute } from "@tanstack/react-router";
import AIAssistantPage from "@/pages/AIAssistant";

const description =
  "Chat with Lexora's legal assistant over the indexed case record — summaries, contradictions, drafts, precedents and extracted timelines with citations.";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Legal Assistant — Lexora" },
      { name: "description", content: description },
      { property: "og:title", content: "AI Legal Assistant — Lexora" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIAssistantPage,
});
