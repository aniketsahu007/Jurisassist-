import { createFileRoute } from "@tanstack/react-router";
import CasesPage from "@/pages/Cases";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Case Management — jurisAssist" },
      {
        name: "description",
        content:
          "Search, filter and sort every matter with court, judge, FIR number, status and next hearing at a glance.",
      },
      { property: "og:title", content: "Case Management — jurisAssist" },
      {
        property: "og:description",
        content:
          "Search, filter and sort every matter with court, judge, FIR number, status and next hearing at a glance.",
      },
    ],
  }),
  component: CasesPage,
});
