import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CoinDoodle } from "./Doodles";
import { display, sans } from "./fonts";

export { display, sans };

// Curated, bold, cohesive palette ------------------------------------------
export const C = {
  ink: "#0E0F1A",
  paper: "#FFFDF5",
  blue: "#2F6BFF",
  green: "#00C46A",
  yellow: "#FFC93C",
  coral: "#FF5C46",
  violet: "#7B5CFF",
  teal: "#00C2C7",
  pink: "#FF4D9D",
};

// --- motion primitives ------------------------------------------------------
export const useSpr = (delay = 0, damping = 16, stiffness = 120) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness, mass: 0.9 },
  });
};

export const ease = (
  frame: number,
  inRange: [number, number],
  outRange: [number, number],
) =>
  interpolate(frame, inRange, outRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

/** Masked slide-up reveal (kinetic typography). */
export const RevealUp: React.FC<{
  delay?: number;
  damping?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, damping = 18, children, style }) => {
  const s = useSpr(delay, damping);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", ...style }}>
      <div
        style={{
          translate: `0px ${interpolate(s, [0, 1], [115, 0])}%`,
          opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Overshooting scale pop. */
export const Pop: React.FC<{
  delay?: number;
  damping?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, damping = 11, children, style }) => {
  const s = useSpr(delay, damping);
  return (
    <div
      style={{
        scale: String(interpolate(s, [0, 1], [0, 1])),
        opacity: interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Number that rolls up to its value, monospaced tabular feel. */
export const CountUp: React.FC<{
  value: number;
  delay?: number;
  dur?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({ value, delay = 0, dur = 42, prefix = "", suffix = "", decimals = 0 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cur = value * t;
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {cur.toLocaleString("en-IN", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// --- atmosphere / depth -----------------------------------------------------

/** Inline SVG film grain, blended over everything for a premium texture. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundSize: "260px 260px",
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.4 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Two slowly drifting blurred blobs for a living gradient background. */
export const Blobs: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: a,
          filter: "blur(120px)",
          opacity: 0.55,
          left: -160,
          top: -120 + Math.sin(frame * 0.02) * 36,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: b,
          filter: "blur(120px)",
          opacity: 0.5,
          right: -160,
          bottom: -140 + Math.cos(frame * 0.02) * 36,
        }}
      />
    </>
  );
};

/** Coins raining with gravity + spin. */
export const CoinShower: React.FC<{ count?: number; seed?: string; delay?: number }> = ({
  count = 26,
  seed = "c",
  delay = 0,
}) => {
  const frame = useCurrentFrame() - delay;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const start = random(`${seed}d${i}`) * 30;
        const t = frame - start;
        if (t < 0) return null;
        const g = 0.55;
        const v0 = 5 + random(`${seed}v${i}`) * 5;
        const y = -120 + v0 * t + 0.5 * g * t * t;
        const size = 44 + random(`${seed}s${i}`) * 46;
        const spin = (t * (3 + (i % 4))) % 360;
        return (
          <CoinDoodle
            key={i}
            size={size}
            style={{
              position: "absolute",
              left: x,
              top: y,
              rotate: `${spin}deg`,
              opacity: 0.95,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// --- scene shell ------------------------------------------------------------
export const Scene: React.FC<{
  bg: string;
  a?: string;
  b?: string;
  fg?: string;
  children: React.ReactNode;
  grain?: boolean;
  vignette?: boolean;
  align?: "center" | "flex-start";
}> = ({
  bg,
  a,
  b,
  fg = C.paper,
  children,
  grain = true,
  vignette = true,
  align = "center",
}) => (
  <AbsoluteFill style={{ backgroundColor: bg, color: fg, fontFamily: sans, overflow: "hidden" }}>
    {a && b && <Blobs a={a} b={b} />}
    <AbsoluteFill
      style={{
        padding: "200px 90px",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {children}
    </AbsoluteFill>
    {vignette && <Vignette />}
    {grain && <Grain />}
  </AbsoluteFill>
);

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
}> = ({ children, color, delay = 2 }) => (
  <RevealUp delay={delay}>
    <div
      style={{
        fontFamily: sans,
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: color ?? "currentColor",
        opacity: 0.85,
      }}
    >
      {children}
    </div>
  </RevealUp>
);
