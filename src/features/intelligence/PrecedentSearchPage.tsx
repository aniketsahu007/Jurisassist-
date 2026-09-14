import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, GitCompare, Eye, Scale, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  precedentCourts,
  precedentJudges,
  precedentSections,
  precedentTypes,
  precedentYears,
} from "@/data/precedents";
import { usePrecedentSearch, useSavedPrecedents } from "./usePrecedents";

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full text-sm sm:w-[190px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function relevanceTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  return "text-muted-foreground";
}

export default function PrecedentSearchPage() {
  const [search, setSearch] = useState("");
  const [court, setCourt] = useState("all");
  const [judge, setJudge] = useState("all");
  const [year, setYear] = useState("all");
  const [section, setSection] = useState("all");
  const [caseType, setCaseType] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);

  const { results, total, loading } = usePrecedentSearch({
    search,
    court,
    judge,
    year,
    section,
    caseType,
  });
  const { saved, toggle } = useSavedPrecedents();

  const activeFilters = useMemo(
    () => [court, judge, year, section, caseType].filter((v) => v !== "all").length,
    [court, judge, year, section, caseType],
  );

  const reset = () => {
    setCourt("all");
    setJudge("all");
    setYear("all");
    setSection("all");
    setCaseType("all");
    setSearch("");
  };

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <p className="text-eyebrow">Research</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Legal precedent search</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Semantic search across reported judgments, ranked by relevance to the active matter.
        </p>
      </div>

      <div className="panel space-y-4 p-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by proposition, citation, judge or statute — e.g. “65B certificate call records”"
            className="h-11 pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Filter label="Court" value={court} onChange={setCourt} options={precedentCourts} />
          <Filter label="Judge" value={judge} onChange={setJudge} options={precedentJudges} />
          <Filter
            label="Year"
            value={year}
            onChange={setYear}
            options={precedentYears.map(String)}
          />
          <Filter
            label="Section"
            value={section}
            onChange={setSection}
            options={precedentSections}
          />
          <Filter
            label="Case type"
            value={caseType}
            onChange={setCaseType}
            options={precedentTypes}
          />
          {(activeFilters > 0 || search) && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-9">
              <X className="mr-1.5 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>
            {loading ? "Searching…" : `${total} judgment${total === 1 ? "" : "s"} matched`}
            {activeFilters > 0 && ` · ${activeFilters} filter${activeFilters === 1 ? "" : "s"}`}
          </span>
          {compare.length > 0 && (
            <span className="flex items-center gap-2">
              <Badge variant="secondary">{compare.length} selected to compare</Badge>
              <Button size="sm" variant="outline" className="h-7" disabled={compare.length < 2}>
                <GitCompare className="mr-1.5 h-3.5 w-3.5" /> Compare
              </Button>
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="panel flex flex-col items-center gap-2 p-12 text-center">
          <Scale className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No judgments matched</p>
          <p className="text-xs text-muted-foreground">
            Try widening the year or removing the section filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((p) => {
            const isSaved = saved.includes(p.id);
            const inCompare = compare.includes(p.id);
            return (
              <article
                key={p.id}
                className={cn("panel p-5 transition-colors", inCompare && "ring-1 ring-primary/40")}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg leading-snug font-semibold">{p.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.citation} · {p.court} · {p.judge} ·{" "}
                      {new Date(p.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-display text-2xl font-semibold",
                        relevanceTone(p.relevance),
                      )}
                    >
                      {p.relevance}%
                    </p>
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      relevance
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{p.caseType}</Badge>
                  <Badge variant="outline">{p.outcome}</Badge>
                  {p.sections.map((s) => (
                    <Badge key={s} variant="outline" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  <Button size="sm" variant="default">
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(p.id)}>
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="mr-1.5 h-3.5 w-3.5 text-primary" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={inCompare ? "secondary" : "ghost"}
                    onClick={() => toggleCompare(p.id)}
                  >
                    <GitCompare className="mr-1.5 h-3.5 w-3.5" />
                    {inCompare ? "In comparison" : "Compare"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
