import { createFileRoute } from "@tanstack/react-router";
import PatternAnalysisPage from "@/pages/PatternAnalysis";

const title = "Pattern Analysis — jurisAssist";
const description =
  "Litigation analytics: judge preferences, success-rate trends, rejected arguments, section outcomes and a judge-by-argument receptivity heatmap.";

export const Route = createFileRoute("/patterns")({
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
  component: PatternAnalysisPage,
});
