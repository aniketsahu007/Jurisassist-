import { useParallax } from "./useParallax";

const labels = [
  { text: "OCR ANALYSIS", x: "4%", y: "16%", depth: 90 },
  { text: "CASE TIMELINE", x: "68%", y: "8%", depth: 130 },
  { text: "SIMILAR CASES", x: "74%", y: "62%", depth: 110 },
  { text: "AI RESEARCH", x: "2%", y: "68%", depth: 150 },
  { text: "PATTERN DETECTION", x: "34%", y: "90%", depth: 70 },
];

const nodes = [
  { x: 18, y: 30 },
  { x: 30, y: 18 },
  { x: 78, y: 26 },
  { x: 86, y: 52 },
  { x: 22, y: 74 },
  { x: 62, y: 84 },
  { x: 50, y: 12 },
  { x: 12, y: 50 },
];

function DocCard({
  title,
  meta,
  className,
  depth,
  tilt,
}: {
  title: string;
  meta: string;
  className?: string;
  depth: number;
  tilt: number;
}) {
  return (
    <div
      className={`group absolute w-40 rounded-xl glass-panel p-3 transition-transform duration-500 ease-out hover:z-20 ${className ?? ""}`}
      style={{
        transform: `translateZ(${depth}px) rotateY(${tilt}deg)`,
        animation: `float-y ${8 + depth / 40}s ease-in-out ${depth / 90}s infinite`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold tracking-[0.18em] text-primary-glow">
          {title}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
      </div>
      <div className="mt-2 space-y-1.5">
        {[100, 82, 64, 90, 48].map((w, i) => (
          <span
            key={i}
            className="block h-[3px] rounded-full bg-foreground/20 transition-colors duration-500 group-hover:bg-primary/50"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-[9px] tracking-wide text-muted-foreground">{meta}</p>
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <span
          className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
          style={{ animation: "sweep 5s linear infinite" }}
        />
      </span>
    </div>
  );
}

export function Scene({ compact = false }: { compact?: boolean }) {
  const { ref, pos } = useParallax<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative mx-auto w-full ${compact ? "h-[420px] max-w-xl" : "h-[560px] max-w-4xl"}`}
      style={{ perspective: "1400px" }}
      aria-hidden
    >
      <div
        className="absolute inset-0 scene-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${-pos.y * 8}deg) rotateY(${pos.x * 12}deg) translate3d(${pos.x * -14}px, ${pos.y * -10}px, 0)`,
        }}
      >
        {/* connective intelligence lines */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lex-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--primary-glow)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {nodes.map((n, i) => (
            <line
              key={i}
              x1={n.x}
              y1={n.y}
              x2="50"
              y2="50"
              stroke="url(#lex-line)"
              strokeWidth="0.25"
              strokeDasharray="3 4"
              style={{ animation: `dash-flow ${7 + i}s linear infinite` }}
            />
          ))}
        </svg>

        {/* neural nodes */}
        {nodes.map((n, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary-glow shadow-[0_0_14px_var(--primary-glow)]"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: `translateZ(${40 + i * 12}px)`,
              animation: `pulse-node ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}

        {/* court building silhouette */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-25"
          style={{ transform: "translate3d(-50%, 8%, -220px)" }}
        >
          <svg width="380" height="180" viewBox="0 0 380 180" fill="none">
            <path d="M190 6 L360 62 H20 Z" fill="var(--primary)" opacity="0.5" />
            <rect x="20" y="66" width="340" height="10" rx="2" fill="var(--primary)" opacity="0.4" />
            {Array.from({ length: 7 }).map((_, i) => (
              <rect
                key={i}
                x={38 + i * 46}
                y="80"
                width="18"
                height="78"
                rx="4"
                fill="var(--primary)"
                opacity="0.32"
              />
            ))}
            <rect x="8" y="160" width="364" height="14" rx="4" fill="var(--primary)" opacity="0.4" />
          </svg>
        </div>

        {/* legal scales */}
        <div
          className="absolute left-[8%] top-[38%]"
          style={{ transform: "translateZ(60px)", animation: "float-y 9s ease-in-out infinite" }}
        >
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <path d="M48 12v66" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M18 30h60" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M30 80h36" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M8 52l10-22 10 22a10 10 0 01-20 0z" stroke="var(--gold)" strokeWidth="2" opacity="0.7" />
            <path d="M68 52l10-22 10 22a10 10 0 01-20 0z" stroke="var(--gold)" strokeWidth="2" opacity="0.7" />
            <circle cx="48" cy="12" r="4" fill="var(--gold)" opacity="0.9" />
          </svg>
        </div>

        {/* orbit ring */}
        <div
          className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          style={{ transform: "translate(-50%, -50%) rotateX(74deg)", animation: "spin-slow 34s linear infinite" }}
        >
          <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_var(--accent)]" />
        </div>

        {/* central case file */}
        <div
          className="absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl glass-panel p-5 animate-float"
          style={{ transform: "translate(-50%, -50%) translateZ(170px)", boxShadow: "var(--shadow-glow), var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.24em] text-muted-foreground">CASE FILE</p>
              <p className="font-display text-lg font-semibold text-gradient">CRL/2291/2024</p>
            </div>
            <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[9px] font-semibold tracking-widest text-primary-glow">
              AI READ
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {["FIR extracted", "Chargesheet parsed", "Judgment linked"].map((t, i) => (
              <div key={t} className="flex items-center gap-2 text-[11px] text-foreground/80">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ animation: `pulse-node ${2 + i}s ease-in-out infinite` }}
                />
                {t}
              </div>
            ))}
          </div>
          {/* glowing timeline */}
          <div className="mt-5">
            <p className="text-[9px] tracking-[0.2em] text-muted-foreground">CASE TIMELINE</p>
            <div className="relative mt-2 h-[3px] w-full rounded-full bg-foreground/10">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-[0_0_14px_var(--primary)]" />
              {[0, 28, 52, 78, 100].map((l) => (
                <span
                  key={l}
                  className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/60 bg-background"
                  style={{ left: `${l}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* surrounding documents */}
        <DocCard title="FIR" meta="Sec. 420 · IPC" className="left-[2%] top-[8%]" depth={110} tilt={16} />
        <DocCard title="JUDGMENT" meta="SC · 2019" className="right-[2%] top-[18%]" depth={130} tilt={-18} />
        <DocCard title="CHARGESHEET" meta="Dist. Court" className="right-[6%] bottom-[10%]" depth={80} tilt={-12} />
        <DocCard title="CASE FILE" meta="Linked · 12 docs" className="left-[6%] bottom-[6%]" depth={95} tilt={14} />

        {/* floating labels */}
        {labels.map((l) => (
          <span
            key={l.text}
            className="absolute rounded-full glass-chip px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-primary-glow"
            style={{
              left: l.x,
              top: l.y,
              transform: `translateZ(${l.depth}px)`,
              animation: `float-y ${9 + l.depth / 50}s ease-in-out ${l.depth / 120}s infinite`,
            }}
          >
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}
