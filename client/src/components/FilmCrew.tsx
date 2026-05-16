import { useCallback, useEffect, useRef } from "react";

type CrewRole = "camera" | "boom" | "light";

interface CrewState {
  role: CrewRole;
  x: number;
  y: number;
  tx: number;
  ty: number;
  pause: number;
  dir: 1 | -1;
  phase: number;
}

const ROLES: { role: CrewRole; label: string; icon: string }[] = [
  { role: "camera", label: "Camera", icon: "🎥" },
  { role: "boom", label: "Sound", icon: "🎙" },
  { role: "light", label: "Light", icon: "💡" },
];

const PAD = 60;

function randomTarget(vw: number, vh: number, cx: number, cy: number): [number, number] {
  let x: number, y: number;
  do {
    x = PAD + Math.random() * (vw - PAD * 2);
    y = PAD + Math.random() * (vh - PAD * 2);
  } while (Math.hypot(x - cx, y - cy) < 100);
  return [x, y];
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export function FilmCrew() {
  const crewRef = useRef<CrewState[]>([]);
  const rafRef = useRef(0);

  const init = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    crewRef.current = ROLES.map((r, i) => {
      const x = vw * (0.25 + i * 0.25);
      const y = vh * (0.25 + i * 0.2);
      const [tx, ty] = randomTarget(vw, vh, x, y);
      return {
        role: r.role,
        x, y, tx, ty,
        pause: 0,
        dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
        phase: i * 2.1,
      };
    });
  }, []);

  useEffect(() => {
    init();

    const SPEED = 0.35;
    const dims = { vw: window.innerWidth, vh: window.innerHeight };
    const onResize = () => { dims.vw = window.innerWidth; dims.vh = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const tick = () => {
      const dt = 0.016;
      const crew = crewRef.current;
      const { vw, vh } = dims;
      const cx = crew.reduce((s, c) => s + c.x, 0) / crew.length;
      const cy = crew.reduce((s, c) => s + c.y, 0) / crew.length;

      for (const c of crew) {
        if (c.pause > 0) { c.pause -= dt; continue; }

        const dx = c.tx - c.x;
        const dy = c.ty - c.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
          c.dir = Math.random() > 0.5 ? 1 : -1;
          c.pause = 0.4 + Math.random() * 2;
          const [tx, ty] = randomTarget(vw, vh, cx, cy);
          c.tx = tx;
          c.ty = ty;
        } else {
          c.x = lerp(c.x, c.tx, SPEED * dt * 8);
          c.y = lerp(c.y, c.ty, SPEED * dt * 8);
        }
        c.phase += dt * 8;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [init]);

  return (
    <div className="film-crew" aria-hidden>
      {ROLES.map((r, i) => (
        <CrewSprite key={r.role} index={i} crewRef={crewRef} />
      ))}
    </div>
  );
}

function CrewSprite({ index, crewRef }: { index: number; crewRef: React.MutableRefObject<CrewState[]> }) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = crewRef.current[index];
      if (c && elRef.current) {
        elRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scaleX(${c.dir})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, crewRef]);

  return (
    <div ref={elRef} className={`crew-sprite crew-sprite--${ROLES[index].role}`}>
      <div className="crew-sprite__body">
        <div className="crew-sprite__head" />
        <div className="crew-sprite__torso" />
        <div className="crew-sprite__legs">
          <div className="crew-sprite__leg crew-sprite__leg--l" />
          <div className="crew-sprite__leg crew-sprite__leg--r" />
        </div>
        <div className="crew-sprite__arm crew-sprite__arm--l" />
        <div className="crew-sprite__arm crew-sprite__arm--r" />
      </div>
      <div className="crew-sprite__prop">
        {index === 0 && <CameraProp />}
        {index === 1 && <BoomProp />}
        {index === 2 && <LightProp />}
      </div>
      <div className="crew-sprite__glow" />
    </div>
  );
}

function CameraProp() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="crew-prop">
      <rect x="0.5" y="2.5" width="13" height="7" rx="1" stroke="#c4b5fd" strokeWidth="0.6" />
      <circle cx="7" cy="6" r="2" stroke="#c4b5fd" strokeWidth="0.6" fill="rgba(196,181,253,0.12)" />
      <rect x="4" y="0.5" width="6" height="2.5" rx="0.5" stroke="#7dd3fc" strokeWidth="0.5" />
    </svg>
  );
}

function BoomProp() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="crew-prop">
      <line x1="1" y1="12" x2="14" y2="4" stroke="#c4b5fd" strokeWidth="0.6" />
      <circle cx="15" cy="3.5" r="2" stroke="#7dd3fc" strokeWidth="0.6" fill="rgba(125,211,252,0.1)" />
      <line x1="1" y1="10" x2="1" y2="13.5" stroke="#c4b5fd" strokeWidth="0.5" />
    </svg>
  );
}

function LightProp() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="crew-prop">
      <rect x="3" y="0.5" width="6" height="3" rx="0.5" stroke="#c4b5fd" strokeWidth="0.5" />
      <path d="M2 4h8l-1.5 9h-5L2 4Z" stroke="#fbbf24" strokeWidth="0.5" fill="rgba(251,191,36,0.08)" />
      <line x1="6" y1="4" x2="6" y2="12.5" stroke="#fbbf24" strokeWidth="0.3" opacity="0.4" />
    </svg>
  );
}
