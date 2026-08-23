import { useMemo } from "react";

/** Cinematic background: gradient wash, grid veil, drifting particles. */
export function Backdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 61) % 100,
        size: 1 + ((i * 7) % 3),
        delay: (i % 11) * 0.8,
        duration: 9 + ((i * 3) % 9),
        opacity: 0.15 + ((i % 5) * 0.12),
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 surface-hero" />
      <div className="absolute inset-0 grid-veil opacity-60" />
      <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="absolute bottom-[-14rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-accent/15 blur-[150px]" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-primary-glow"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float-y ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,transparent_40%,oklch(0.08_0.02_265)_100%)]" />
    </div>
  );
}
