import { createFileRoute } from "@tanstack/react-router";
import PrecedentSearchPage from "@/pages/PrecedentSearch";

const title = "Precedent Search — jurisAssist";
const description =
  "Search reported Indian judgments by proposition, court, judge, year and statutory section, with relevance-ranked results you can save and compare.";

export const Route = createFileRoute("/precedents")({
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
  component: PrecedentSearchPage,
});
