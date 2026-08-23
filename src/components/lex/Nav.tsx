import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v18M4 8h16" stroke="var(--primary-glow)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8l-2.5 6a4 4 0 008 0L7 8M20 8l-2.5 6a4 4 0 008 0L23 8" stroke="var(--primary)" strokeWidth="1.4" />
        </svg>
      </span>
      <span className="font-display text-base font-semibold tracking-tight">JurisAssist</span>
    </span>
  );
}

export function Nav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="transition-opacity hover:opacity-80">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#capabilities" className="transition-colors hover:text-foreground">
          Capabilities
        </a>
        <a href="#intelligence" className="transition-colors hover:text-foreground">
          Intelligence
        </a>
      </nav>
      <Link
        to="/login"
        className="rounded-full border border-glass-border glass-chip px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-primary/50 hover:text-primary-glow"
      >
        Login →
      </Link>
    </header>
  );
}
