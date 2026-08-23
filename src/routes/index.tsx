import { createFileRoute, Link } from "@tanstack/react-router";
import { Backdrop } from "@/components/lex/Backdrop";
import { Nav } from "@/components/lex/Nav";
import { Scene } from "@/components/lex/Scene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JurisAssist — Legal Case Intelligence for Lawyers" },
      {
        name: "description",
        content:
          "JurisAssist turns FIRs, chargesheets and judgments into structured case intelligence with OCR, timelines and similar-case research for Indian law.",
      },
      { property: "og:title", content: "JurisAssist — Legal Case Intelligence" },
      {
        property: "og:description",
        content:
          "AI-powered case management, legal research and case intelligence — built for lawyers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const capabilities = [
  {
    tag: "OCR / NLP",
    title: "Read every document",
    body: "FIRs, chargesheets, affidavits and judgments are extracted into structured, searchable case data.",
  },
  {
    tag: "TIMELINES",
    title: "Case history, assembled",
    body: "Every filing, hearing and order placed on an automatic chronology you can defend in court.",
  },
  {
    tag: "RESEARCH",
    title: "Find similar cases",
    body: "Surface comparable matters from Indian legal sources with citations ranked by relevance.",
  },
  {
    tag: "PATTERNS",
    title: "Learn from your own record",
    body: "Detect recurring arguments, outcomes and judicial tendencies across your previous cases.",
  },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Backdrop />
      <Nav />

      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-8 text-center">
        <span className="animate-rise inline-flex items-center gap-2 rounded-full glass-chip px-4 py-1.5 text-[11px] font-medium tracking-[0.18em] text-primary-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
          JURISASSIST · LEGAL INTELLIGENCE ENGINE
        </span>

        <h1
          className="animate-rise mx-auto mt-7 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          <span className="text-gradient">Turn Legal Complexity Into Intelligence.</span>
        </h1>

        <p
          className="animate-rise mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          AI-powered case management, legal research, and case intelligence — built for lawyers.
        </p>

        <div
          className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            to="/login"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-primary-glow px-7 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.03]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Get Started →
          </Link>
          <Link
            to="/login"
            className="rounded-full glass-chip px-7 py-3 text-sm font-semibold transition-all duration-300 hover:border-primary/50 hover:text-primary-glow"
          >
            Login →
          </Link>
        </div>
      </section>

      <section id="intelligence" className="relative px-6">
        <Scene />
        <p className="mx-auto mt-2 text-center text-[11px] tracking-[0.24em] text-muted-foreground">
          DOCUMENTS → AI → LEGAL INTELLIGENCE
        </p>
      </section>

      <section id="capabilities" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c) => (
            <article
              key={c.tag}
              className="group rounded-2xl glass-panel p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40"
            >
              <p className="text-[10px] font-semibold tracking-[0.2em] text-primary-glow">
                {c.tag}
              </p>
              <h2 className="mt-3 font-display text-lg font-semibold tracking-tight">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              <span className="mt-4 block h-px w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl glass-panel px-8 py-12 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Your case files, finally <span className="text-gradient">thinking with you.</span>
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Built for practitioners handling hundreds of matters across Indian courts.
          </p>
          <Link
            to="/login"
            className="mt-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Get Started →
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-glass-border/60 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 JurisAssist</span>
          <nav aria-label="Legal" className="flex items-center gap-4 tracking-[0.16em]">
            <Link to="/privacy" className="transition-colors hover:text-primary-glow">
              PRIVACY
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary-glow">
              TERMS
            </Link>
            <Link to="/security" className="transition-colors hover:text-primary-glow">
              SECURITY
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
