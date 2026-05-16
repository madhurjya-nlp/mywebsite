const BITMAP_TILES = [
  { left: "5%", top: "14%", glyph: "⬡", rotate: "0deg" },
  { left: "5%", top: "14%", glyph: "⬢", rotate: "0deg", opacity: 0.25 },
  { right: "4%", top: "16%", glyph: "◇", rotate: "0deg" },
  { right: "4%", top: "16%", glyph: "◆", rotate: "0deg", opacity: 0.2 },
  { left: "6%", bottom: "18%", glyph: "▣", rotate: "0deg" },
  { right: "3%", bottom: "14%", glyph: "▤", rotate: "12deg" },
  { left: "50%", bottom: "8%", glyph: "⊞", rotate: "0deg", opacity: 0.15 },
  { left: "12%", top: "48%", glyph: "▦", rotate: "0deg", opacity: 0.12 },
  { right: "2%", top: "50%", glyph: "▥", rotate: "-8deg", opacity: 0.1 },
  { left: "3%", top: "76%", glyph: "⊕", rotate: "0deg", opacity: 0.18 },
  { right: "6%", top: "72%", glyph: "⊗", rotate: "0deg", opacity: 0.08 },
  { left: "48%", top: "10%", glyph: "⊡", rotate: "0deg", opacity: 0.1 },
];

const BITS = [
  { top: "8%", left: "3%", bits: "01" },
  { top: "8%", right: "3%", bits: "10" },
  { bottom: "10%", left: "4%", bits: "01" },
  { bottom: "10%", right: "3%", bits: "10" },
];

export function BitmapExpressions() {
  return (
    <>
      {BITMAP_TILES.map((t, i) => (
        <span
          key={`tile-${i}`}
          className="bitmap-tile"
          style={{
            position: "fixed",
            left: "left" in t ? t.left : undefined,
            right: "right" in t ? t.right : undefined,
            top: t.top,
            bottom: t.bottom,
            transform: `rotate(${t.rotate})`,
            opacity: t.opacity ?? 0.15,
            pointerEvents: "none",
            zIndex: 0,
            fontSize: "clamp(0.8rem, 1.2vw, 1.1rem)",
            color: "#c4b5fd",
            userSelect: "none",
          }}
          aria-hidden
        >
          {t.glyph}
        </span>
      ))}
      {BITS.map((b, i) => (
        <span
          key={`bit-${i}`}
          className="bitmap-bits"
          style={{
            position: "fixed",
            top: b.top,
            left: "left" in b ? b.left : undefined,
            right: "right" in b ? b.right : undefined,
            bottom: "bottom" in b ? b.bottom : undefined,
            pointerEvents: "none",
            zIndex: 0,
            fontFamily: "monospace",
            fontSize: "clamp(0.55rem, 0.7vw, 0.7rem)",
            color: "rgba(196, 181, 253, 0.18)",
            lineHeight: 1.3,
            letterSpacing: "0.15em",
            userSelect: "none",
            writingMode: "vertical-lr",
          }}
          aria-hidden
        >
          {b.bits}
        </span>
      ))}
    </>
  );
}
