import React from "react";

type DoodleProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number, style?: React.CSSProperties): React.CSSProperties => ({
  width: size,
  height: size,
  display: "block",
  overflow: "visible",
  ...style,
});

const stroke = (color: string, w: number) => ({
  fill: "none",
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** A wobbly hand-drawn rupee coin. */
export const CoinDoodle: React.FC<DoodleProps> = ({
  size = 120,
  color = "#1A1A2E",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 100 100" style={base(size, style)} className={className}>
    <circle cx="50" cy="50" r="40" fill="#FBBC04" />
    <path
      d="M50 8C70 9 90 26 90 50c0 26-22 41-42 41C28 90 9 73 10 49 11 27 30 9 50 8Z"
      {...stroke(color, strokeWidth)}
    />
    <path
      d="M38 32h26M38 44h26M60 32c6 4 4 14-6 14h-12l18 18"
      {...stroke(color, strokeWidth)}
    />
  </svg>
);

/** A sparkly 4-point star / shine. */
export const SparkleDoodle: React.FC<DoodleProps> = ({
  size = 60,
  color = "#FBBC04",
  style,
  className,
  strokeWidth = 5,
}) => (
  <svg viewBox="0 0 100 100" style={base(size, style)} className={className}>
    <path
      d="M50 8c4 26 16 38 42 42-26 4-38 16-42 42-4-26-16-38-42-42 26-4 38-16 42-42Z"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** Hand-drawn 5-point star outline. */
export const StarDoodle: React.FC<DoodleProps> = ({
  size = 60,
  color = "#EA4335",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 100 100" style={base(size, style)} className={className}>
    <path
      d="M50 10l11 26 28 2-21 18 7 27-25-15-25 15 7-27-21-18 28-2Z"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** Squiggly underline to put under a word/number. */
export const SquiggleDoodle: React.FC<DoodleProps> = ({
  size = 300,
  color = "#4285F4",
  style,
  className,
  strokeWidth = 8,
}) => (
  <svg
    viewBox="0 0 300 30"
    style={{ width: size, height: (size / 300) * 30, overflow: "visible", display: "block", ...style }}
    className={className}
  >
    <path
      d="M4 18C40 6 60 26 96 14s56 14 92 2 56 8 104-4"
      {...stroke(color, strokeWidth)}
    />
  </svg>
);

/** Circle-scribble to ring a number, like a marker. */
export const CircleScribbleDoodle: React.FC<DoodleProps> = ({
  size = 300,
  color = "#EA4335",
  style,
  className,
  strokeWidth = 7,
}) => (
  <svg viewBox="0 0 200 120" style={base(size, style)} className={className}>
    <path
      d="M100 12C152 10 190 34 188 62c-3 33-63 50-110 46C40 104 10 84 12 56 14 28 56 16 104 14c40-2 76 12 78 38"
      {...stroke(color, strokeWidth)}
    />
  </svg>
);

/** Curvy hand-drawn arrow. */
export const ArrowDoodle: React.FC<DoodleProps> = ({
  size = 120,
  color = "#34A853",
  style,
  className,
  strokeWidth = 7,
}) => (
  <svg viewBox="0 0 120 120" style={base(size, style)} className={className}>
    <path d="M12 30c30-8 70 0 84 40" {...stroke(color, strokeWidth)} />
    <path d="M70 64l28 6 2-30" {...stroke(color, strokeWidth)} />
  </svg>
);

/** Confetti rectangle (single piece). */
export const ConfettiPiece: React.FC<DoodleProps & { rotation?: number }> = ({
  size = 26,
  color = "#4285F4",
  style,
  rotation = 0,
}) => (
  <svg
    viewBox="0 0 20 30"
    style={{ width: size * 0.66, height: size, rotate: `${rotation}deg`, display: "block", ...style }}
  >
    <rect x="2" y="2" width="16" height="26" rx="4" fill={color} />
  </svg>
);

/** A bouncy chat / speech bubble. */
export const SpeechBubbleDoodle: React.FC<DoodleProps> = ({
  size = 120,
  color = "#34A853",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 120 110" style={base(size, style)} className={className}>
    <path
      d="M20 16h80c8 0 14 6 14 14v34c0 8-6 14-14 14H54l-20 18 2-18H20c-8 0-14-6-14-14V30c0-8 6-14 14-14Z"
      fill="#fff"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** A heart doodle. */
export const HeartDoodle: React.FC<DoodleProps> = ({
  size = 60,
  color = "#EA4335",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 100 100" style={base(size, style)} className={className}>
    <path
      d="M50 84C20 64 12 44 18 30c6-15 26-15 32 2 6-17 26-17 32-2 6 14-2 34-32 54Z"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** A simple crown (for the #1 payee). */
export const CrownDoodle: React.FC<DoodleProps> = ({
  size = 120,
  color = "#FBBC04",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 120 90" style={base(size, style)} className={className}>
    <path
      d="M16 76l-6-44 28 20 22-36 22 36 28-20-6 44Z"
      fill={color}
      stroke="#1A1A2E"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M16 76h88" {...stroke("#1A1A2E", strokeWidth)} />
  </svg>
);

/** A lightning bolt. */
export const BoltDoodle: React.FC<DoodleProps> = ({
  size = 80,
  color = "#FBBC04",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 60 100" style={base(size, style)} className={className}>
    <path
      d="M34 6L12 54h18l-8 40 30-56H32l8-32Z"
      fill={color}
      stroke="#1A1A2E"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** A fluffy doodle cloud. */
export const CloudDoodle: React.FC<DoodleProps> = ({
  size = 160,
  color = "#9AA7FF",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 160 90" style={base(size, style)} className={className}>
    <path
      d="M40 78c-18 0-30-12-30-26 0-13 11-23 24-23 4-16 19-23 33-19 8-12 28-12 35 4 16 0 26 11 26 24 0 18-14 30-32 30Z"
      fill={color}
      stroke="#1A1A2E"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** Phone with a tap ripple (the UPI tap). */
export const TapPhoneDoodle: React.FC<DoodleProps> = ({
  size = 140,
  color = "#1A1A2E",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 120 140" style={base(size, style)} className={className}>
    <rect x="30" y="14" width="60" height="100" rx="12" fill="#fff" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="60" cy="58" r="14" fill="#34A853" />
    <path d="M54 58l5 5 9-11" {...stroke("#fff", 4)} />
    <path d="M60 96h0" {...stroke(color, 8)} />
    <path d="M86 118c10 8 20 8 28 0M92 128c6 5 12 5 18 0" {...stroke("#FBBC04", 5)} />
  </svg>
);

/** Dotted motion path used as a decorative accent. */
export const DottedPathDoodle: React.FC<DoodleProps> = ({
  size = 300,
  color = "#1A1A2E",
  style,
  className,
  strokeWidth = 6,
}) => (
  <svg viewBox="0 0 300 80" style={{ width: size, height: (size / 300) * 80, display: "block", overflow: "visible", ...style }} className={className}>
    <path
      d="M6 60C60 4 120 4 160 40s90 30 134-20"
      {...stroke(color, strokeWidth)}
      strokeDasharray="2 18"
    />
  </svg>
);
