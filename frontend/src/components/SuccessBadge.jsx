import React, { useMemo } from "react";
import { Blueprint } from "../ui.jsx";

const COLORS = ["var(--color-accent)", "var(--color-accent-700)", "var(--color-accent-300)", "var(--color-neutral-800)"];

export function Confetti({ count = 54 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.24;
        const dist = 150 + ((i * 37) % 190);
        return {
          key: i,
          style: {
            position: "absolute",
            left: "50%",
            top: "42%",
            width: i % 4 === 0 ? 3 : 6,
            height: i % 3 === 0 ? 12 : 6,
            background: COLORS[i % COLORS.length],
            "--dx": `${Math.cos(a) * dist}px`,
            "--dy": `${Math.sin(a) * dist * 0.8 + 210}px`,
            "--rot": `${((i * 53) % 720) - 360}deg`,
            animation: `conf ${1.5 + (i % 5) * 0.22}s cubic-bezier(.16,.72,.34,1) ${0.3 + (i % 7) * 0.045}s both`,
          },
        };
      }),
    [count]
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {bits.map((b) => <span key={b.key} style={b.style} />)}
    </div>
  );
}

export function CheckBadge() {
  return (
    <div style={{ position: "relative", width: 116, height: 116, margin: "0 auto 34px" }}>
      <div style={{ position: "absolute", inset: 0, border: "1px solid var(--color-accent)", animation: "ringPulse 1.6s ease-out .25s infinite" }} />
      <Blueprint
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--color-accent)",
          borderColor: "var(--color-accent)",
          display: "grid",
          placeItems: "center",
          animation: "badgeIn .55s cubic-bezier(.2,.9,.25,1) both",
        }}
      >
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="square">
          <path d="M14 29 L24 39 L43 18" strokeDasharray="44" style={{ animation: "checkDraw .5s ease-out .35s both" }} />
        </svg>
      </Blueprint>
    </div>
  );
}
