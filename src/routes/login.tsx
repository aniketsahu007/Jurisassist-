import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Backdrop } from "@/components/lex/Backdrop";
import { Logo } from "@/components/lex/Nav";
import { Scene } from "@/components/lex/Scene";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — LexMind AI Legal Intelligence Workspace" },
      {
        name: "description",
        content:
          "Sign in to JurisAssist by LexMind AI and continue your legal intelligence workspace for case files, timelines and research.",
      },
      { property: "og:title", content: "Login — LexMind AI" },
      {
        property: "og:description",
        content: "Continue your legal intelligence workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function Field({
  label,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label className="block">
      <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`mt-2 flex items-center rounded-xl border bg-background/40 px-4 transition-all duration-300 ${
          focused ? "border-primary/60 shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]" : "border-glass-border"
        }`}
      >
        <input
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </span>
    </label>
  );
}

function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Backdrop />

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-2">
        <div className="order-2 hidden lg:order-1 lg:block">
          <Scene compact />
          <p className="mt-2 text-center text-[10px] tracking-[0.24em] text-muted-foreground">
            DOCUMENTS → AI → LEGAL INTELLIGENCE
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="animate-rise mx-auto w-full max-w-md rounded-3xl glass-panel p-8"
          >
            <Link to="/" className="inline-block transition-opacity hover:opacity-80">
              <Logo />
            </Link>

            <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
              <span className="text-gradient">Welcome back.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue your legal intelligence workspace.
            </p>

            <div className="mt-8 space-y-4">
              <Field label="EMAIL" type="email" placeholder="you@chambers.in" autoComplete="email" />
              <Field
                label="PASSWORD"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="mt-3 flex justify-end">
              <a href="#" className="text-xs text-primary-glow transition-opacity hover:opacity-75">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary to-primary-glow py-3 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Login →
            </button>

            <div className="my-6 flex items-center gap-3 text-[10px] tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-glass-border" />
              OR
              <span className="h-px flex-1 bg-glass-border" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl glass-chip py-3 text-sm font-medium transition-all duration-300 hover:border-primary/50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
                <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0012 24z" />
                <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 010-4.6v-3H1.8a12 12 0 000 10.6l3.8-3z" />
                <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0012 0 12 12 0 001.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8z" />
              </svg>
              Continue with Google
            </button>

            <p className="mt-7 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="#" className="font-medium text-primary-glow transition-opacity hover:opacity-75">
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
