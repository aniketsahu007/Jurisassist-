import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/lex/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — JurisAssist" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="JURISASSIST · PRIVACY"
      title="Privacy that respects the case file."
      summary="This policy explains what JurisAssist collects, why we use it, and the choices you have when working with sensitive legal information."
      updated="AUGUST 2026"
      sections={[
        {
          title: "Information you provide",
          body: "We collect account details, case documents, notes, and research queries that you choose to place in your workspace. We use this information to provide document extraction, timelines, search, and related product features.",
        },
        {
          title: "How we use information",
          body: "Workspace information is used to operate, secure, and improve JurisAssist for your organization. We do not sell case information or use confidential matter data for advertising. We retain information while your account is active or as needed to provide the service and meet legal obligations.",
        },
        {
          title: "Your control",
          body: "You can review, export, correct, or request deletion of workspace information through your organization administrator. You should only upload information that your organization is authorized to process.",
        },
        {
          title: "Service providers",
          body: "We may use vetted infrastructure and processing providers to host data, deliver OCR, and maintain the service. They receive only the access required for their role and are bound by confidentiality and security commitments.",
        },
      ]}
    />
  );
}
