import { useEffect, useRef, useState } from "react";

/** Tracks normalized pointer position (-1..1) relative to an element. */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        setPos({
          x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)),
          y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)),
        });
      });
    };
    const onLeave = () => setPos({ x: 0, y: 0 });

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, pos };
}
