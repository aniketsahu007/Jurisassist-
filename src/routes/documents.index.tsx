import { createFileRoute } from "@tanstack/react-router";
import DocumentUploadPage from "@/features/documents/DocumentUploadPage";

const description =
  "Drag and drop pleadings, exhibits, hearing recordings and site footage for OCR, entity extraction and timeline detection.";

export const Route = createFileRoute("/documents/")({
  head: () => ({
    meta: [
      { title: "Document Upload — jurisAssist" },
      { name: "description", content: description },
      { property: "og:title", content: "Document Upload — jurisAssist" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentUploadPage,
});
