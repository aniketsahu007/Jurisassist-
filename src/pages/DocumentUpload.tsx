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
import { cn } from "@/lib/utils";
import { useRecentUploads } from "@/hooks/useDocuments";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);
  const { items: recent, loading } = useRecentUploads();

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearInterval);
  }, []);

  const simulate = useCallback((id: string, willFail: boolean) => {
    const interval = setInterval(() => {
      setQueue((prev) =>
        prev.map((f) => {
          if (f.id !== id || f.status === "success" || f.status === "error") return f;
          const next = Math.min(100, f.progress + Math.random() * 18 + 6);
          if (next >= 100) {
            clearInterval(interval);
            return willFail
              ? {
                  ...f,
                  progress: 100,
                  status: "error",
                  message:
                    "Upload rejected — file exceeds the 250 MB ingestion limit. Split the exhibit and retry.",
                }
              : {
                  ...f,
                  progress: 100,
                  status: "success",
                  message: "Ingested · OCR queued · entities will be extracted shortly",
                };
          }
          return {
            ...f,
            progress: next,
            status: next > 82 ? "processing" : "uploading",
          };
        }),
      );
    }, 320);
    timers.current.push(interval);
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      const queued: QueuedUpload[] = list.map((file, i) => {
        const kind = kindFromFileName(file.name);
        return {
          id: `${Date.now()}-${i}-${file.name}`,
          name: file.name,
          kind,
          sizeLabel: formatBytes(file.size),
          progress: 0,
          status: "queued",
          thumbnail:
            kind === "image" && typeof URL !== "undefined"
              ? URL.createObjectURL(file)
              : undefined,
        };
      });
      setQueue((prev) => [...queued, ...prev]);
      queued.forEach((q, i) => simulate(q.id, i > 0 && files.length > 2 && i % 4 === 3));
    },
    [simulate],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const retry = (id: string) => {
    setQueue((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, progress: 0, status: "uploading", message: undefined } : f,
      ),
    );
    simulate(id, false);
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
            Pleadings, exhibits, hearing recordings and site footage — processed locally in this
            preview build.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/documents/$documentId" params={{ documentId: "d-9001" }}>
            Open document viewer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
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
                or click to browse — PDF, images, DOCX, audio and video up to 250 MB each
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
                            {f.status === "processing"
                              ? "Running OCR and entity extraction…"
                              : `Uploading · ${Math.round(f.progress)}%`}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {f.status === "error" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => retry(f.id)}
                          aria-label="Retry upload"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
            <p className="text-eyebrow">Recently uploaded files</p>
          </div>
          <div className="divide-y">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 px-5 py-4">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                ))
              : recent.map((f) => {
                  const Icon = kindIcon[f.kind];
                  return (
                    <div key={f.id} className="flex gap-3 px-5 py-4">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                          kindTint[f.kind],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{f.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {f.caseNumber} · {f.sizeLabel}
                          {f.pages > 0 ? ` · ${f.pages} pp.` : ""}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {f.note}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              f.status === "success"
                                ? "border-success/25 bg-success/12 text-success"
                                : f.status === "error"
                                  ? "border-destructive/25 bg-destructive/12 text-destructive"
                                  : "border-accent/25 bg-accent/12 text-accent",
                            )}
                          >
                            {f.status === "success"
                              ? "Ingested"
                              : f.status === "error"
                                ? "Failed"
                                : "Processing"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {fmtWhen(f.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </aside>
      </div>
    </div>
  );
}
