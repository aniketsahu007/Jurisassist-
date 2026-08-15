import { useState } from "react";
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCases, useCreateCase } from "@/hooks/useCases";
import { CaseCard, CaseCardSkeleton } from "@/components/cases/CaseCard";
import { EmptyState } from "@/components/dashboard/ActivityPanel";

const PAGE_SIZE = 6;

/** Backend CaseStatus enum values mapped to display labels */
const caseStatusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "UNDER_TRIAL", label: "Under Trial" },
  { value: "RESERVED_FOR_JUDGMENT", label: "Reserved for Judgment" },
  { value: "DISPOSED", label: "Disposed" },
  { value: "STAYED", label: "Stayed" },
  { value: "APPEAL_FILED", label: "Appeal Filed" },
];

const caseTypeOptions = [
  "Criminal",
  "Civil",
  "Corporate",
  "Family",
  "Constitutional",
  "Tax",
  "Labour",
  "Property",
];

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [newCaseOpen, setNewCaseOpen] = useState(false);

  const { items, total, pageCount, loading } = useCases({
    search,
    status,
    sort: sort as "recent",
    page,
    pageSize: PAGE_SIZE,
  });

  const createCase = useCreateCase();

  const reset = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const filtersActive = search !== "" || status !== "all";

  const handleCreateCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCase.mutate(
      {
        title: formData.get("title") as string,
        caseNumber: (formData.get("caseNumber") as string) || undefined,
        clientName: (formData.get("clientName") as string) || undefined,
        courtName: (formData.get("courtName") as string) || undefined,
        caseType: (formData.get("caseType") as string) || undefined,
      },
      {
        onSuccess: () => setNewCaseOpen(false),
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">Case management</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Matters</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {total} {total === 1 ? "matter" : "matters"} matching your view
          </p>
        </div>

        <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> New case
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create a new case</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCase} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Case title *</Label>
                <Input id="title" name="title" required placeholder="e.g. State v. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="caseNumber">Case number</Label>
                  <Input id="caseNumber" name="caseNumber" placeholder="CRL.A. 482/2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client name</Label>
                  <Input id="clientName" name="clientName" placeholder="Client name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="courtName">Court</Label>
                  <Input id="courtName" name="courtName" placeholder="Bombay High Court" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseType">Case type</Label>
                  <select
                    id="caseType"
                    name="caseType"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select type</option>
                    {caseTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" size="sm" disabled={createCase.isPending}>
                  {createCase.isPending ? "Creating…" : "Create case"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by case name, client, judge, FIR or case number…"
            className="h-9 bg-surface-2 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground lg:block" />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[180px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {caseStatusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[168px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Sort: Last updated</SelectItem>
              <SelectItem value="hearing">Sort: Next hearing</SelectItem>
              <SelectItem value="name">Sort: Case name</SelectItem>
              <SelectItem value="priority">Sort: Priority</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
              <X className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <CaseCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="panel p-4">
          <EmptyState
            title="No matters found"
            detail="Try a different search term or clear the active filters."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((c, i) => (
            <CaseCard key={c.id} item={c} index={i} />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {pageCount} · showing {items.length} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
