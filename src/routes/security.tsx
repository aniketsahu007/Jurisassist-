import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/lex/LegalPage";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Security — JurisAssist" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <LegalPage
      eyebrow="JURISASSIST · SECURITY"
      title="Security built around confidentiality."
      summary="JurisAssist is designed for legal teams handling sensitive material, with layered controls around access, data handling, and operational resilience."
      updated="AUGUST 2026"
      sections={[
        {
          title: "Protected access",
          body: "Accounts are protected with authenticated access controls, secure session handling, and least-privilege principles. Organization administrators should review membership regularly and remove access when a team member changes role.",
        },
        {
          title: "Data protection",
          body: "Data is encrypted in transit and at rest using established industry practices. Production access is limited to authorized personnel with a business need, and access is monitored for unusual activity.",
        },
        {
          title: "Operational safeguards",
          body: "We maintain backups, logging, dependency reviews, and recovery procedures to help keep the workspace available and accountable. Security practices are reviewed as the product and threat landscape change.",
        },
        {
          title: "Report a concern",
          body: "Please report suspected vulnerabilities or unauthorized access promptly through your organization support channel. Include the affected area, relevant timestamps, and steps to reproduce without sharing confidential case material.",
        },
      ]}
    />
  );
}
