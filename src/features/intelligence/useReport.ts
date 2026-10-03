import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export function useCaseReport(caseId: string | undefined) {
  const { data: rawReport, isLoading: loading, isError } = useQuery({
    queryKey: ["case-report", caseId],
    queryFn: () => reportsApi.getCaseReport(caseId!),
    enabled: !!caseId,
    refetchInterval: (data: any) => (data?.status === "GENERATING" ? 3000 : false),
  });

  const queryClient = useQueryClient();

  const generateReport = useMutation({
    mutationFn: () => reportsApi.generateCaseReport(caseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-report", caseId] });
    },
  });

  const parsedJson = rawReport?.report_json || {};

  const report = {
    status: rawReport?.status || "NONE",
    caseTitle: "Pending Report",
    caseNumber: caseId || "N/A",
    court: "N/A",
    documentsAnalysed: 0,
    pagesAnalysed: 0,
    model: "jurisAssist",
    generatedAt: rawReport?.generated_at || new Date().toISOString(),
    confidence: parsedJson.confidence || 0,
    executiveSummary: parsedJson.executiveSummary ? (Array.isArray(parsedJson.executiveSummary) ? parsedJson.executiveSummary : [parsedJson.executiveSummary]) : ["Report is not yet generated for this case."],
    timeline: parsedJson.timeline || [],
    facts: parsedJson.facts || [],
    issues: parsedJson.legalIssues?.map((i: string, idx: number) => ({ id: String(idx), issue: i, strength: "Arguable", position: "Identified via AI analysis" })) || [],
    missingEvidence: parsedJson.missingEvidence || [],
    contradictions: parsedJson.contradictions?.map((c: string, idx: number) => ({ id: String(idx), severity: "Medium", statementA: c, sourceA: "AI Analysis", statementB: "Contradictory statement", sourceB: "AI Analysis" })) || [],
    precedents: parsedJson.precedents || [],
    drafts: parsedJson.drafts || [],
    risks: parsedJson.risks?.map((r: string, idx: number) => ({ id: String(idx), label: r, score: 50, note: "AI Risk Assessment" })) || [],
  };

  return {
    report,
    loading,
    isError,
    generate: generateReport.mutate,
    isGenerating: generateReport.isPending || report.status === "GENERATING",
  };
}
