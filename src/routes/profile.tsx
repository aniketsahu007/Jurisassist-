import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/pages/Profile";

const title = "Profile — jurisAssist";
const description =
  "Advocate and firm profile, appearance and notification preferences, API keys and billing overview for the jurisAssist workspace.";

export const Route = createFileRoute("/profile")({
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
  component: ProfilePage,
});
