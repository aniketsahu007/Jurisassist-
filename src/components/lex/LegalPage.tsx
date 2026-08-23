import { Link } from "@tanstack/react-router";
import { Backdrop } from "@/components/lex/Backdrop";
import { Logo } from "@/components/lex/Nav";

type LegalSection = {
  title: string;
  body: string;
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Backdrop />
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <Link
          to="/"
          className="rounded-full border border-glass-border glass-chip px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-primary/50 hover:text-primary-glow"
        >
          Back to home
        </Link>
      </header>

      <article className="relative mx-auto max-w-4xl px-6 pb-20 pt-14">
        <header className="animate-rise max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-primary-glow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="text-gradient">{title}</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{summary}</p>
          <p className="mt-4 text-xs tracking-[0.12em] text-muted-foreground/75">
            LAST UPDATED {updated}
          </p>
        </header>

        <div className="mt-12 space-y-4">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="animate-rise glass-panel rounded-2xl p-6 sm:p-8"
              style={{ animationDelay: `${120 + index * 60}ms` }}
            >
              <h2 className="font-display text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Questions about this policy? Contact the JurisAssist team through your account support
          channel.
        </p>
      </article>
    </main>
  );
}
