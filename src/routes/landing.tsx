import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/pages/Landing";

const title = "jurisAssist — AI Legal Intelligence for Indian Chambers";
const description =
  "jurisAssist reads chargesheets, builds case chronologies, finds precedent and drafts submissions so counsel can spend the morning arguing, not assembling the brief.";

export const Route = createFileRoute("/landing")({
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
  component: LandingPage,
});
