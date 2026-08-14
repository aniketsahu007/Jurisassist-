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
import { useCases } from "@/hooks/useCases";
import { caseStatuses, caseTypes, courts } from "@/data/cases";
import { CaseCard, CaseCardSkeleton } from "@/components/cases/CaseCard";
import { EmptyState } from "@/components/dashboard/ActivityPanel";

const PAGE_SIZE = 6;

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [caseType, setCaseType] = useState("all");
  const [court, setCourt] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const { items, total, pageCount, loading } = useCases({
    search,
    status,
    caseType,
    court,
    sort: sort as "recent",
    page,
    pageSize: PAGE_SIZE,
  });

  const reset = () => {
    setSearch("");
    setStatus("all");
    setCaseType("all");
    setCourt("all");
    setPage(1);
  };

  const filtersActive =
    search !== "" || status !== "all" || caseType !== "all" || court !== "all";

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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New case
        </Button>
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
          <FilterSelect
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            placeholder="Status"
            options={caseStatuses}
            allLabel="All statuses"
          />
          <FilterSelect
            value={caseType}
            onChange={(v) => {
              setCaseType(v);
              setPage(1);
            }}
            placeholder="Type"
            options={caseTypes}
            allLabel="All types"
          />
          <FilterSelect
            value={court}
            onChange={(v) => {
              setCourt(v);
              setPage(1);
            }}
            placeholder="Court"
            options={courts}
            allLabel="All courts"
            wide
          />
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

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  allLabel,
  wide,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  allLabel: string;
  wide?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={wide ? "h-9 w-[200px] text-xs" : "h-9 w-[150px] text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
