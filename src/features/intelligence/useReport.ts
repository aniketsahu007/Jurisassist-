import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export function useCaseReport(caseId: string | undefined) {
  const { data: rawReport, isLoading: loading, isError } = useQuery({
    queryKey: ["case-report", caseId],
    queryFn: () => reportsApi.getCaseReport(caseId!),
    enabled: !!caseId,
  });

  const report = rawReport || {
    caseTitle: "Pending Report",
    caseNumber: caseId || "N/A",
    court: "N/A",
    documentsAnalysed: 0,
    pagesAnalysed: 0,
    model: "jurisAssist",
    generatedAt: new Date().toISOString(),
    confidence: 0,
    executiveSummary: ["Report is not yet generated for this case."],
    timeline: [],
    facts: [],
    issues: [],
    missingEvidence: [],
    contradictions: [],
    precedents: [],
    drafts: [],
    risks: [],
  };

  return {
    report,
    loading,
    isError,
  };
}
