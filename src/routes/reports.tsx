import { createFileRoute } from "@tanstack/react-router";
import AIReportPage from "@/pages/AIReport";

const description =
  "AI-generated case report: executive summary, chronology, key facts, legal issues, missing evidence, contradictions, precedents, drafts, risk analysis and confidence score.";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "AI Case Report — Lexora" },
      { name: "description", content: description },
      { property: "og:title", content: "AI Case Report — Lexora" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIReportPage,
});
