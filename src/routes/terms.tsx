import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/lex/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — JurisAssist" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="JURISASSIST · TERMS"
      title="Clear terms for serious work."
      summary="These terms describe the responsibilities and expectations that apply when you use the JurisAssist legal intelligence workspace."
      updated="AUGUST 2026"
      sections={[
        {
          title: "The service",
          body: "JurisAssist provides document processing, organization, and research assistance tools. Features may change as the service evolves, and availability can vary by plan, maintenance, or third-party dependencies.",
        },
        {
          title: "Your workspace",
          body: "You are responsible for the accuracy of information you submit, keeping credentials secure, and ensuring that your use of the service complies with professional duties, court rules, and applicable law. Keep an independent copy of important records.",
        },
        {
          title: "Human judgment remains essential",
          body: "JurisAssist is an assistive technology, not a lawyer, legal opinion, or substitute for professional judgment. Review extracted text, citations, and suggested similarities before relying on them in a matter or filing.",
        },
        {
          title: "Acceptable use",
          body: "Do not misuse the service, attempt unauthorized access, upload malicious content, or use outputs to violate another person’s rights. We may suspend access when necessary to protect users, data, or the service.",
        },
      ]}
    />
  );
}
