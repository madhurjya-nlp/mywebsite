import { useEffect, useState } from "react";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "gone">(
    "enter",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("exit"), 2600);
    const t3 = setTimeout(() => {
      setPhase("gone");
      onFinish();
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  if (phase === "gone") return null;

  return (
    <div
      className={`splash-overlay splash-overlay--${phase}`}
      aria-hidden
    >
      <svg
        className="splash-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <mask id="splash-reveal-mask">
            <rect width="100" height="100" fill="white" />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontFamily="'Outfit', system-ui, sans-serif"
                fontWeight="700"
                letterSpacing="-0.02"
                className="splash-text"
              >
                msvisuals
              </text>
            </mask>
            <filter id="splash-glow-blur">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          <rect
            width="100"
            height="100"
            fill="#030303"
            mask="url(#splash-reveal-mask)"
          />

          <text
            x="50"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="0.5"
            fontFamily="'Outfit', system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="-0.02"
            filter="url(#splash-glow-blur)"
            opacity="0.9"
            className="splash-text splash-glow"
          >
            msvisuals
          </text>

          <text
            x="50"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fill="none"
            stroke="#e4d9ff"
            strokeWidth="0.2"
            fontFamily="'Outfit', system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="-0.02"
            opacity="0.5"
            className="splash-text splash-glow"
          >
            msvisuals
          </text>
      </svg>
    </div>
  );
}
