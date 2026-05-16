import { useEffect, useRef } from "react";

type AmbientBackgroundProps = {
  className?: string;
};

export function AmbientBackground({ className = "" }: AmbientBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pendingRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const flush = () => {
      rafRef.current = 0;
      const { x, y } = pendingRef.current;
      root.style.setProperty("--blob-px", x.toFixed(4));
      root.style.setProperty("--blob-py", y.toFixed(4));
    };

    const onMove = (e: PointerEvent) => {
      pendingRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pendingRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`ambient-bg-root ${className}`.trim()}
      aria-hidden
    >
      <div className="blob-scene">
        <div className="blob blob--a" />
        <div className="blob blob--b" />
        <div className="blob blob--c" />
        <div className="blob blob--d" />
      </div>
      <div className="blob-vignette" />
    </div>
  );
}
