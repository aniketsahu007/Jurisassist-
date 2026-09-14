import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileType2,
  AudioLines,
  Video,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RotateCw,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRecentUploads, useUploadDocument } from "./useDocuments";
import { useCases } from "@/features/cases/useCases";
import {
  acceptedFormats,
  kindFromFileName,
  supportedExtensions,
  type DocumentKind,
  type UploadStatus,
} from "@/data/documents";

const kindIcon: Record<DocumentKind, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  docx: FileType2,
  audio: AudioLines,
  video: Video,
};

const kindTint: Record<DocumentKind, string> = {
  pdf: "bg-destructive/12 text-destructive",
  image: "bg-chart-3/12 text-chart-3",
  docx: "bg-chart-1/12 text-chart-1",
  audio: "bg-accent/15 text-accent",
  video: "bg-success/12 text-success",
};

const docStatusTint: Record<string, string> = {
  COMPLETED: "border-success/25 bg-success/12 text-success",
  FAILED: "border-destructive/25 bg-destructive/12 text-destructive",
  UPLOADED: "border-accent/25 bg-accent/12 text-accent",
  PROCESSING_OCR: "border-accent/25 bg-accent/12 text-accent",
  PROCESSING_AI: "border-accent/25 bg-accent/12 text-accent",
};

const docStatusLabel: Record<string, string> = {
  COMPLETED: "Ingested",
  FAILED: "Failed",
  UPLOADED: "Uploaded",
  PROCESSING_OCR: "Processing",
  PROCESSING_AI: "Processing",
};

interface QueuedUpload {
  id: string;
  name: string;
  kind: DocumentKind;
  sizeLabel: string;
  progress: number;
  status: UploadStatus;
  message?: string | undefined;
  thumbnail?: string | undefined;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DocumentUploadPage() {
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cases for the case selector
  const { items: cases, loading: casesLoading } = useCases({ pageSize: 100 });

  // Fetch recent uploads for the selected case
  const { items: recent, loading: recentLoading } = useRecentUploads(selectedCaseId || undefined);

  // Real upload mutation
  const uploadMutation = useUploadDocument(selectedCaseId || undefined);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      if (!selectedCaseId) {
        alert("Please select a case before uploading documents.");
        return;
      }

      list.forEach((file) => {
        const kind = kindFromFileName(file.name);
        const id = `${Date.now()}-${file.name}`;

        const entry: QueuedUpload = {
          id,
          name: file.name,
          kind,
          sizeLabel: formatBytes(file.size),
          progress: 0,
          status: "uploading",
          thumbnail:
            kind === "image" && typeof URL !== "undefined" ? URL.createObjectURL(file) : undefined,
        };

        setQueue((prev) => [entry, ...prev]);

        // Real upload via the mutation
        uploadMutation.mutate(file, {
          onSuccess: () => {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === id
                  ? {
                      ...q,
                      progress: 100,
                      status: "success" as UploadStatus,
                      message: "Uploaded · OCR queued · entities will be extracted shortly",
                    }
                  : q,
              ),
            );
          },
          onError: (error) => {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === id
                  ? {
                      ...q,
                      progress: 100,
                      status: "error" as UploadStatus,
                      message: error instanceof Error ? error.message : "Upload failed",
                    }
                  : q,
              ),
            );
          },
        });
      });
    },
    [selectedCaseId, uploadMutation],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const successCount = queue.filter((q) => q.status === "success").length;
  const errorCount = queue.filter((q) => q.status === "error").length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">Documents</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Upload &amp; ingestion</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Upload case documents for AI-powered extraction and analysis.
          </p>
        </div>
      </div>

      {/* Case selector */}
      <div className="panel p-4">
        <label className="text-sm font-medium">Select a case to upload documents to:</label>
        <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
          <SelectTrigger className="mt-2 h-9 w-full max-w-md text-sm">
            <SelectValue placeholder={casesLoading ? "Loading cases…" : "Choose a case"} />
          </SelectTrigger>
          <SelectContent>
            {cases.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.caseNumber ? `${c.caseNumber} — ` : ""}
                {c.title}
              </SelectItem>
            ))}
            {cases.length === 0 && !casesLoading && (
              <SelectItem value="__none" disabled>
                No cases found — create one first
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "panel flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-14 text-center transition-colors",
              !selectedCaseId && "opacity-50 pointer-events-none",
              dragging ? "border-accent bg-accent/8" : "border-border hover:border-accent/60",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-accent">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">
                {dragging ? "Release to queue these files" : "Drag and drop case files here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCaseId
                  ? "or click to browse — PDF, images, DOCX, audio and video up to 250 MB each"
                  : "Select a case above before uploading"}
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={supportedExtensions}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {acceptedFormats.map((f) => {
                const Icon = kindIcon[f.kind];
                return (
                  <Badge key={f.kind} variant="outline" className="gap-1 text-[11px]">
                    <Icon className="h-3 w-3" /> {f.extensions}
                  </Badge>
                );
              })}
            </div>
          </div>

          {(successCount > 0 || errorCount > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {successCount > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-success/25 bg-success/8 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium text-success">
                      {successCount} file{successCount > 1 ? "s" : ""} ingested
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      OCR, entity extraction and timeline detection have been queued.
                    </p>
                  </div>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/8 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      {errorCount} file{errorCount > 1 ? "s" : ""} failed
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Review the reason below and retry the upload.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {queue.length > 0 && (
            <div className="panel divide-y">
              <div className="flex items-center justify-between px-5 py-3">
                <p className="text-eyebrow">This session · {queue.length}</p>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setQueue([])}>
                  Clear
                </Button>
              </div>
              {queue.map((f) => {
                const Icon = kindIcon[f.kind];
                return (
                  <div key={f.id} className="flex items-start gap-3 px-5 py-4">
                    {f.thumbnail ? (
                      <img
                        src={f.thumbnail}
                        alt={`Preview of ${f.name}`}
                        className="h-11 w-11 shrink-0 rounded-md border object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
                          kindTint[f.kind],
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {f.sizeLabel}
                        </span>
                      </div>
                      {f.status === "success" ? (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {f.message}
                        </p>
                      ) : f.status === "error" ? (
                        <p className="mt-1 flex items-start gap-1.5 text-xs text-destructive">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {f.message}
                        </p>
                      ) : (
                        <>
                          <Progress value={f.progress} className="mt-2 h-1.5" />
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading…
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Remove from queue"
                        onClick={() => setQueue((prev) => prev.filter((x) => x.id !== f.id))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="panel h-fit">
          <div className="border-b px-5 py-3">
            <p className="text-eyebrow">
              {selectedCaseId ? "Documents in this case" : "Select a case to view documents"}
            </p>
          </div>
          <div className="divide-y">
            {!selectedCaseId ? (
              <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                Choose a case above to see its documents.
              </div>
            ) : recentLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 px-5 py-4">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              recent.map((f) => {
                const kind = kindFromFileName(f.filename);
                const Icon = kindIcon[kind];
                return (
                  <div key={f.id} className="flex gap-3 px-5 py-4">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                        kindTint[kind],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{f.filename}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", docStatusTint[f.status])}
                        >
                          {docStatusLabel[f.status] ?? f.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {fmtWhen(f.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
