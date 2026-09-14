import { createFileRoute } from "@tanstack/react-router";
import DocumentViewerPage from "@/features/documents/DocumentViewerPage";

const description =
  "Read paginated case documents alongside extracted sections, timeline, metadata, entities, highlights and annotations.";

export const Route = createFileRoute("/documents/$documentId")({
  head: () => ({
    meta: [
      { title: "Document Viewer — jurisAssist" },
      { name: "description", content: description },
      { property: "og:title", content: "Document Viewer — jurisAssist" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentViewerPage,
});
