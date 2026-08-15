import { createFileRoute } from "@tanstack/react-router";
import CaseTimelinePage from "@/pages/CaseTimeline";

const description =
  "Interactive vertical case chronology from incident and FIR through arrest, chargesheet, hearings and judgment.";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Case Timeline — jurisAssist" },
      { name: "description", content: description },
      { property: "og:title", content: "Case Timeline — jurisAssist" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseTimelinePage,
});
