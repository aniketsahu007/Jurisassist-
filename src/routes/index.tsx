import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lexora Legal Intelligence" },
      {
        name: "description",
        content:
          "Track active matters, upcoming hearings and AI-generated legal reports from one practice dashboard.",
      },
      { property: "og:title", content: "Dashboard — Lexora Legal Intelligence" },
      {
        property: "og:description",
        content:
          "Track active matters, upcoming hearings and AI-generated legal reports from one practice dashboard.",
      },
    ],
  }),
  component: DashboardPage,
});
