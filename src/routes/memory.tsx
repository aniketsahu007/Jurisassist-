import { createFileRoute } from "@tanstack/react-router";
import AIMemoryPage from "@/pages/AIMemory";

const title = "AI Memory — Lexora";
const description =
  "Institutional legal memory: past cases, previous strategies, successful arguments, frequently used sections, saved notes and similarity-scored vector search.";

export const Route = createFileRoute("/memory")({
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
  component: AIMemoryPage,
});
