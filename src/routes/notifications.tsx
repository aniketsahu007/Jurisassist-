import { createFileRoute } from "@tanstack/react-router";
import NotificationsPage from "@/pages/Notifications";

const title = "Notifications — jurisAssist";
const description =
  "Hearing reminders, filing deadlines, similar judgment alerts, document processing and AI report updates in one notification centre.";

export const Route = createFileRoute("/notifications")({
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
  component: NotificationsPage,
});
