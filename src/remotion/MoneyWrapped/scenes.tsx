import {
  HeartFilledIcon,
  IdCardIcon,
  LightningBoltIcon,
  MixIcon,
  MoonIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";
import { formatCompactINR } from "../../lib/analytics";
import { ArrowDoodle, CoinDoodle, SparkleDoodle, StarDoodle } from "./Doodles";
import {
  C,
  CountUp,
  CoinShower,
  display,
  ease,
  Eyebrow,
  Pop,
  RevealUp,
  sans,
  Scene,
  useSpr,
} from "./kit";

type Data = z.infer<typeof CompositionProps>;

// shared bits ---------------------------------------------------------------
const Pill: React.FC<{
  children: React.ReactNode;
  delay: number;
  bg: string;
  fg: string;
}> = ({ children, delay, bg, fg }) => (
  <Pop delay={delay} damping={12}>
    <div
      style={{
        background: bg,
        color: fg,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 44,
        padding: "20px 40px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
      }}
    >
      {children}
    </div>
  </Pop>
);

// Picks a display font-size so a numeral string always fits a target width —
// guards crore-scale amounts from overflowing the fixed 1080px canvas. The
// 0.56 factor is the average glyph advance (digits/₹/commas) for the display
// face; the result is capped at the scene's intended size for normal values.
const fitDisplay = (text: string, maxWidth: number, maxFont: number) =>
  Math.min(maxFont, Math.floor(maxWidth / Math.max(text.length * 0.56, 1)));

// ---------------------------------------------------------------------------
// 1 — INTRO
// ---------------------------------------------------------------------------
export const SceneIntro: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const lineW = ease(frame, [46, 70], [0, 580]);
  const coin = useSpr(2, 9);
  return (
    <Scene bg={C.ink} a="#2A2EA0" b="#6E2EA0">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Pop delay={4} damping={13}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              border: `3px solid ${C.yellow}`,
              color: C.yellow,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 38,
              letterSpacing: 4,
              padding: "12px 30px",
              borderRadius: 999,
            }}
          >
            ✦ {data.periodLabel} ✦
          </div>
        </Pop>
        <RevealUp delay={12} style={{ marginTop: 44 }}>
          <div
            style={{
              fontFamily: display,
              fontSize: 184,
              lineHeight: 0.9,
              letterSpacing: -3,
              color: "transparent",
              WebkitTextStroke: `4px ${C.paper}`,
            }}
          >
            MONEY
          </div>
        </RevealUp>
        <RevealUp delay={22}>
          <div style={{ fontFamily: display, fontSize: 184, lineHeight: 0.9, letterSpacing: -3, color: C.yellow }}>
            WRAPPED
          </div>
        </RevealUp>
        <div style={{ height: 12, width: lineW, background: C.coral, borderRadius: 99, marginTop: 28 }} />
        <RevealUp delay={50} style={{ marginTop: 50 }}>
          <div style={{ fontFamily: sans, fontSize: 46, fontWeight: 500, opacity: 0.85 }}>
            @{data.handle} · your spending, unwrapped
          </div>
        </RevealUp>
      </div>
      <CoinDoodle
        size={130}
        style={{
          position: "absolute",
          top: 300,
          left: 150,
          rotate: `${interpolate(coin, [0, 1], [-40, -12])}deg`,
          scale: String(interpolate(coin, [0, 1], [0, 1])),
        }}
      />
      <SparkleDoodle size={70} color={C.yellow} style={{ position: "absolute", top: 360, right: 150, opacity: ease(frame, [30, 44], [0, 1]) }} />
      <SparkleDoodle size={48} color={C.blue} style={{ position: "absolute", bottom: 420, left: 180, opacity: ease(frame, [40, 54], [0, 1]) }} />
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 2 — TOTAL SPENT
// ---------------------------------------------------------------------------
export const SceneTotalSpent: React.FC<{ data: Data }> = ({ data }) => {
  const pop = useSpr(14, 10);
  const months = data.monthly.length || 3;
  const totalStr =
    "₹" + Math.round(data.totalSent).toLocaleString("en-IN");
  const totalFont = fitDisplay(totalStr, 900, 184);
  return (
    <Scene bg={C.blue} a="#6E96FF" b="#0A3AC9">
      <CoinShower count={22} seed="spent" delay={8} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Eyebrow color={C.yellow}>
          In {months} month{months === 1 ? "" : "s"} you spent
        </Eyebrow>
        <div
          style={{
            fontFamily: display,
            fontSize: totalFont,
            lineHeight: 1,
            marginTop: 24,
            scale: String(interpolate(pop, [0, 1], [0.4, 1])),
            textShadow: "0 18px 50px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          <CountUp value={data.totalSent} delay={14} dur={48} prefix="₹" />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 80, flexWrap: "wrap", justifyContent: "center" }}>
          <Pill delay={60} bg={C.ink} fg={C.paper}>
            ₹{Math.round(data.avgPerActiveDay).toLocaleString("en-IN")} / day
          </Pill>
          <Pill delay={68} bg={C.yellow} fg={C.ink}>
            {data.activeDays} active days
          </Pill>
        </div>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 3 — TRANSACTIONS
// ---------------------------------------------------------------------------
export const SceneTransactions: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const perDay = Math.round(data.txnCount / Math.max(1, data.activeDays));
  const countFont = fitDisplay(data.txnCount.toLocaleString("en-IN"), 900, 300);
  const ring = (i: number) => {
    const t = (frame - i * 8) % 60;
    const s = interpolate(t, [0, 60], [0.3, 2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const o = interpolate(t, [0, 60], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { scale: String(s), opacity: o };
  };
  return (
    <Scene bg={C.yellow} a="#FFE08A" b="#FF9E2C" fg={C.ink}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* tap-pulse rings behind the number */}
        <div style={{ position: "relative", marginBottom: -40 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 360,
                height: 360,
                marginLeft: -180,
                marginTop: -180,
                borderRadius: "50%",
                border: `8px solid ${C.ink}`,
                ...ring(i),
              }}
            />
          ))}
        </div>
        <Eyebrow color={C.coral}>You tapped “Pay”</Eyebrow>
        <div style={{ fontFamily: display, fontSize: countFont, lineHeight: 0.9, marginTop: 8, whiteSpace: "nowrap" }}>
          <CountUp value={data.txnCount} delay={12} dur={46} />
        </div>
        <RevealUp delay={34}>
          <div style={{ fontFamily: display, fontSize: 88, letterSpacing: 6, color: C.coral }}>TIMES</div>
        </RevealUp>
        <div style={{ display: "flex", gap: 24, marginTop: 64 }}>
          <Pill delay={56} bg={C.ink} fg={C.paper}>~{perDay} taps a day</Pill>
          <Pill delay={64} bg={C.paper} fg={C.ink}>{data.smallTxnPct}% under ₹100</Pill>
        </div>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 4 — THE RECEIPT (showpiece)
// ---------------------------------------------------------------------------
const TornEdge: React.FC<{ flip?: boolean; color: string }> = ({ flip, color }) => (
  <svg viewBox="0 0 700 24" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 24, rotate: flip ? "180deg" : "0deg" }}>
    <path
      d="M0 0 L0 24 L20 6 L40 24 L60 6 L80 24 L100 6 L120 24 L140 6 L160 24 L180 6 L200 24 L220 6 L240 24 L260 6 L280 24 L300 6 L320 24 L340 6 L360 24 L380 6 L400 24 L420 6 L440 24 L460 6 L480 24 L500 6 L520 24 L540 6 L560 24 L580 6 L600 24 L620 6 L640 24 L660 6 L680 24 L700 6 L700 0 Z"
      fill={color}
    />
  </svg>
);

const ReceiptLine: React.FC<{ name: string; amount: number; delay: number }> = ({
  name,
  amount,
  delay,
}) => {
  const s = useSpr(delay, 18);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        fontFamily: sans,
        fontSize: 40,
        color: C.ink,
        opacity: interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        translate: `0px ${interpolate(s, [0, 1], [18, 0])}px`,
      }}
    >
      <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 380 }}>
        {name}
      </span>
      <span style={{ flex: 1, borderBottom: `4px dotted ${C.ink}`, opacity: 0.4, marginBottom: 10 }} />
      <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        {formatCompactINR(amount)}
      </span>
    </div>
  );
};

export const SceneReceipt: React.FC<{ data: Data }> = ({ data }) => {
  const lines = data.topPayees.slice(0, 5);
  const stamp = useSpr(72, 8);
  return (
    <Scene bg={C.coral} a="#FF8A6E" b="#C82E5A">
      <div style={{ position: "relative", width: 720 }}>
        <Pop delay={4} damping={14}>
          <div style={{ position: "relative" }}>
            <TornEdge color={C.paper} />
            <div style={{ background: C.paper, padding: "20px 56px 30px" }}>
              <div style={{ textAlign: "center", fontFamily: display, fontSize: 54, color: C.ink, letterSpacing: 1 }}>
                MONEY WRAPPED
              </div>
              <div style={{ textAlign: "center", fontFamily: sans, fontSize: 26, fontWeight: 700, color: C.ink, opacity: 0.5, letterSpacing: 6, marginTop: 2 }}>
                — RECEIPT —
              </div>
              <div style={{ textAlign: "center", fontFamily: sans, fontSize: 30, color: C.ink, opacity: 0.55, marginBottom: 28 }}>
                @{data.handle} · {data.periodLabel}
              </div>
              <div style={{ borderTop: `4px dashed ${C.ink}`, opacity: 0.3, marginBottom: 28 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {lines.map((p, i) => (
                  <ReceiptLine key={p.name} name={p.name} amount={p.total} delay={18 + i * 8} />
                ))}
              </div>
              <div style={{ borderTop: `4px dashed ${C.ink}`, opacity: 0.3, margin: "30px 0 24px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: display, fontSize: 56, color: C.ink }}>
                <span>TOTAL</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCompactINR(data.totalSent)}</span>
              </div>
              <div style={{ textAlign: "center", fontFamily: sans, fontSize: 28, color: C.ink, opacity: 0.55, marginTop: 18 }}>
                {data.txnCount} transactions · thank you, come again
              </div>
            </div>
            <TornEdge flip color={C.paper} />
          </div>
        </Pop>
        {/* PAID stamp */}
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: 120,
            border: `8px solid ${C.green}`,
            color: C.green,
            fontFamily: display,
            fontSize: 64,
            padding: "8px 26px",
            borderRadius: 16,
            rotate: "-16deg",
            opacity: interpolate(stamp, [0, 1], [0, 0.92]),
            scale: String(interpolate(stamp, [0, 1], [2.4, 1])),
          }}
        >
          PAID
        </div>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 5 — LEADERBOARD (top payees, as ranked profile cards)
// ---------------------------------------------------------------------------
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const MEDALS = ["🥇", "🥈", "🥉"];

const LeaderRow: React.FC<{
  rank: number;
  name: string;
  count: number;
  total: number;
}> = ({ rank, name, count, total }) => {
  const s = useSpr(10 + rank * 7, 18);
  const top = rank === 0;
  // #1 is a solid "paper" hero card; the rest are dark glass so white text
  // stays crisp over the bright background.
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: top ? "30px 36px" : "20px 34px",
        borderRadius: 30,
        background: top ? C.paper : "rgba(12,13,22,0.30)",
        color: top ? C.ink : C.paper,
        boxShadow: top ? "0 22px 54px rgba(0,0,0,0.32)" : "none",
        opacity: interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        translate: `${interpolate(s, [0, 1], [-48, 0])}px 0px`,
      }}
    >
      {/* rank — medal for the podium, numeral after */}
      <div style={{ width: 72, textAlign: "center", flexShrink: 0 }}>
        {rank < 3 ? (
          <span style={{ fontSize: top ? 66 : 50, lineHeight: 1 }}>
            {MEDALS[rank]}
          </span>
        ) : (
          <span
            style={{
              fontFamily: display,
              fontSize: 48,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {rank + 1}
          </span>
        )}
      </div>
      {/* avatar */}
      <div
        style={{
          width: top ? 104 : 82,
          height: top ? 104 : 82,
          borderRadius: "50%",
          background: top ? C.pink : "rgba(255,255,255,0.16)",
          color: C.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: display,
          fontSize: top ? 44 : 34,
          flexShrink: 0,
        }}
      >
        {initials(name)}
      </div>
      {/* name + total */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 800,
            fontSize: top ? 56 : 46,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            opacity: top ? 0.55 : 0.78,
          }}
        >
          {formatCompactINR(total)} in total
        </div>
      </div>
      {/* count */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: display,
            fontSize: top ? 72 : 56,
            lineHeight: 1,
            color: top ? C.pink : C.yellow,
          }}
        >
          {count}×
        </div>
        <div style={{ fontFamily: sans, fontSize: 26, opacity: 0.7 }}>
          payments
        </div>
      </div>
    </div>
  );
};

export const SceneLeaderboard: React.FC<{ data: Data }> = ({ data }) => {
  const rows = data.topPayeesByCount.slice(0, 5);
  return (
    <Scene bg={C.pink} a="#FF8AC4" b="#C81E6E" align="flex-start">
      <Eyebrow color={C.ink}>Who you paid most often</Eyebrow>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 56,
        }}
      >
        {rows.map((r, i) => (
          <LeaderRow
            key={r.name}
            rank={i}
            name={r.name}
            count={r.count}
            total={r.total}
          />
        ))}
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 6 — BIGGEST SPLURGE
// ---------------------------------------------------------------------------
export const SceneBiggestSplurge: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const pop = useSpr(12, 9);
  const shake = Math.sin(frame * 0.8) * ease(frame, [14, 34], [7, 0]);
  const amtStr =
    "₹" + Math.round(data.biggest.amount).toLocaleString("en-IN");
  const amtFont = fitDisplay(amtStr, 900, 220);
  return (
    <Scene bg={C.ink} a="#7A4DD6" b="#C82E5A">
      <CoinShower count={16} seed="splurge" delay={6} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Eyebrow color={C.yellow}>Biggest single splurge</Eyebrow>
        <div
          style={{
            fontFamily: display,
            fontSize: amtFont,
            lineHeight: 1,
            marginTop: 24,
            color: C.yellow,
            translate: `${shake}px 0px`,
            scale: String(interpolate(pop, [0, 1], [0.3, 1])),
            textShadow: "0 0 60px rgba(255,201,60,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          <CountUp value={data.biggest.amount} delay={12} dur={42} prefix="₹" />
        </div>
        <RevealUp delay={48} style={{ marginTop: 60 }}>
          <div
            style={{
              fontFamily: display,
              fontSize: 80,
              maxWidth: 900,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            to {data.biggest.name}
          </div>
        </RevealUp>
        <RevealUp delay={56}>
          <div style={{ fontFamily: sans, fontSize: 46, fontWeight: 500, opacity: 0.8 }}>
            on {data.biggest.dateLabel}
          </div>
        </RevealUp>
      </div>
      <StarDoodle size={84} color={C.yellow} style={{ position: "absolute", top: 380, left: 150, opacity: ease(frame, [28, 42], [0, 1]) }} />
      <SparkleDoodle size={64} color={C.paper} style={{ position: "absolute", bottom: 460, right: 150, opacity: ease(frame, [34, 48], [0, 1]) }} />
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 7 — MONTHLY CURVE
// ---------------------------------------------------------------------------
export const SceneMonthly: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const months = data.monthly.length ? data.monthly : [{ label: "—", total: 0 }];
  const max = Math.max(...months.map((m) => m.total), 1);
  const colors = [C.blue, C.violet, C.coral, C.green, C.pink, C.yellow, C.teal];
  const rising = months.length >= 2 && months[months.length - 1].total > months[0].total;
  // responsive sizing so any number of months fits the 900px content width
  const n = months.length;
  const gap = n <= 4 ? 64 : n <= 6 ? 40 : 26;
  const barW = Math.max(70, Math.min(190, Math.floor((900 - gap * (n - 1)) / n)));
  const valFont = n <= 4 ? 50 : n <= 6 ? 38 : 30;
  const labFont = n <= 4 ? 54 : n <= 6 ? 42 : 34;
  return (
    <Scene bg={C.teal} a="#7FE9EC" b="#008C90" fg={C.ink}>
      <Eyebrow color={C.ink}>Your spending curve</Eyebrow>
      <div style={{ position: "relative", width: "100%", height: 720, marginTop: 60 }}>
        {/* gridlines */}
        {[0, 0.5, 1].map((g) => (
          <div key={g} style={{ position: "absolute", left: 0, right: 0, bottom: 90 + g * 560, height: 3, background: "rgba(14,15,26,0.15)" }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap }}>
          {months.map((m, i) => {
            const grow = ease(frame, [16 + i * 8, 44 + i * 8], [0, 1]);
            const h = (m.total / max) * 560 * grow + 90;
            return (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontFamily: display, fontSize: valFont, opacity: grow, marginBottom: 14 }}>{formatCompactINR(m.total)}</div>
                <div style={{ width: barW, height: h, background: colors[i % colors.length], borderRadius: "20px 20px 0 0", boxShadow: "0 -10px 30px rgba(0,0,0,0.12)" }} />
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: labFont, marginTop: 16 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Pop delay={70} damping={13} style={{ marginTop: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: sans, fontSize: 52, fontWeight: 700 }}>
          {rising ? (
            <>
              <ArrowDoodle size={84} color={C.coral} style={{ rotate: "-22deg" }} />
              {months[months.length - 1].label} was your big month
            </>
          ) : (
            <>steady spender all season</>
          )}
        </div>
      </Pop>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 8 — PERSONALITY
// ---------------------------------------------------------------------------
const PERSONA_ICON: Record<
  string,
  React.FC<{ width?: number; height?: number; style?: React.CSSProperties }>
> = {
  bolt: LightningBoltIcon,
  card: IdCardIcon,
  coins: TokensIcon,
  moon: MoonIcon,
  heart: HeartFilledIcon,
  balance: MixIcon,
};

export const ScenePersonality: React.FC<{ data: Data }> = ({ data }) => {
  const badge = useSpr(8, 9);
  const Icon = PERSONA_ICON[data.personality.icon] ?? LightningBoltIcon;
  return (
    <Scene bg={C.green} a="#86F0BE" b="#009E55" fg={C.ink}>
      <CoinShower count={14} seed="pers" delay={4} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Eyebrow color={C.ink}>Your money personality</Eyebrow>
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: C.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 40,
            boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            scale: String(interpolate(badge, [0, 1], [0, 1])),
            rotate: `${interpolate(badge, [0, 1], [-30, 0])}deg`,
          }}
        >
          <Icon width={150} height={150} style={{ color: C.green }} />
        </div>
        <RevealUp delay={28} style={{ marginTop: 44 }}>
          <div style={{ fontFamily: display, fontSize: 104, lineHeight: 1, maxWidth: 900 }}>
            {data.personality.title}
          </div>
        </RevealUp>
        <RevealUp delay={40} style={{ marginTop: 28 }}>
          <div style={{ fontFamily: sans, fontSize: 50, fontWeight: 500, maxWidth: 800, opacity: 0.85 }}>
            {data.personality.blurb}
          </div>
        </RevealUp>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// 9 — OUTRO
// ---------------------------------------------------------------------------
export const SceneOutro: React.FC<{ data: Data }> = ({ data }) => {
  return (
    <Scene bg={C.ink} a="#2F6BFF" b="#00C46A">
      <CoinShower count={20} seed="outro" delay={2} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <RevealUp delay={4}>
          <div style={{ fontFamily: display, fontSize: 158, lineHeight: 0.92 }}>THAT&apos;S</div>
        </RevealUp>
        <RevealUp delay={12}>
          <div style={{ fontFamily: display, fontSize: 158, lineHeight: 0.92, color: C.yellow }}>A WRAP!</div>
        </RevealUp>
        <Pop delay={26} damping={12} style={{ marginTop: 40 }}>
          <div
            style={{
              display: "inline-flex",
              gap: 14,
              alignItems: "center",
              background: "rgba(255,255,255,0.1)",
              border: "3px solid rgba(255,255,255,0.25)",
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 42,
              padding: "16px 36px",
              borderRadius: 999,
            }}
          >
            @{data.handle} · {data.periodLabel}
          </div>
        </Pop>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// POWER HOUR (most active payment hour)
// ---------------------------------------------------------------------------
export const ScenePowerHour: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const hourly = data.hourly && data.hourly.length === 24 ? data.hourly : new Array(24).fill(0);
  const max = Math.max(...hourly, 1);
  let peak = 0;
  for (let h = 1; h < 24; h++) if (hourly[h] > hourly[peak]) peak = h;
  return (
    <Scene bg={C.blue} a="#6E96FF" b="#0A3AC9">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
        <Eyebrow color={C.yellow}>Your power hour</Eyebrow>
        <Pop delay={8} damping={10} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: display, fontSize: 220, lineHeight: 1, color: C.yellow }}>
            {data.mostActiveHourLabel}
          </div>
        </Pop>
        <RevealUp delay={34} style={{ marginTop: 14 }}>
          <div style={{ fontFamily: sans, fontSize: 50, fontWeight: 600, opacity: 0.9 }}>
            when you tap Pay the most
          </div>
        </RevealUp>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 240, width: "100%", maxWidth: 840, marginTop: 70 }}>
          {hourly.map((c, i) => {
            const grow = ease(frame, [26 + i * 1.4, 52 + i * 1.4], [0, 1]);
            const h = (c / max) * 224 * grow + 6;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: h,
                  background: i === peak ? C.yellow : "rgba(255,255,255,0.32)",
                  borderRadius: 6,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 840, marginTop: 14, fontFamily: sans, fontSize: 26, opacity: 0.6 }}>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// WEEKDAY vs WEEKEND (spending per day)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// MONEY CIRCLE (unique payees)
// ---------------------------------------------------------------------------
const CIRCLE_DOTS = [C.blue, C.coral, C.yellow, C.violet, C.pink, C.green, C.ink];

const Dot: React.FC<{ i: number }> = ({ i }) => {
  const s = useSpr(28 + i * 1.2, 12);
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: CIRCLE_DOTS[i % CIRCLE_DOTS.length],
        scale: String(interpolate(s, [0, 1], [0, 1])),
        opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
      }}
    />
  );
};

export const SceneCircle: React.FC<{ data: Data }> = ({ data }) => {
  const dots = Math.max(1, Math.min(data.uniquePayees, 48));
  return (
    <Scene bg={C.teal} a="#7FE9EC" b="#008C90" fg={C.ink}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Eyebrow color={C.ink}>Your money circle</Eyebrow>
        <div
          style={{
            fontFamily: display,
            fontSize: fitDisplay(data.uniquePayees.toLocaleString("en-IN"), 900, 216),
            lineHeight: 1,
            marginTop: 20,
            whiteSpace: "nowrap",
          }}
        >
          <CountUp value={data.uniquePayees} delay={12} dur={42} />
        </div>
        <RevealUp delay={36} style={{ marginTop: 2 }}>
          <div style={{ fontFamily: sans, fontSize: 50, fontWeight: 600, maxWidth: 780 }}>
            different people &amp; places got your money
          </div>
        </RevealUp>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            maxWidth: 720,
            marginTop: 54,
          }}
        >
          {new Array(dots).fill(0).map((_, i) => (
            <Dot key={i} i={i} />
          ))}
        </div>
      </div>
    </Scene>
  );
};

// ---------------------------------------------------------------------------
// WHERE IT CAME FROM (spend split by funding account) — donut + legend
// ---------------------------------------------------------------------------
// Editorial ranked card. The top source is filled with the warm accent so it
// reads as the headline; the rest are quiet glass panels — one cohesive
// family of tones over the violet, no clashing chart colours.
const AccountCard: React.FC<{
  label: string;
  total: number;
  pct: number;
  primary: boolean;
  delay: number;
}> = ({ label, total, pct, primary, delay }) => {
  const s = useSpr(delay, 18);
  const fg = primary ? C.ink : C.paper;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "30px 40px",
        borderRadius: 30,
        color: fg,
        background: primary ? C.yellow : "rgba(255,255,255,0.07)",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.16)",
        boxShadow: primary ? "0 22px 54px rgba(0,0,0,0.30)" : "none",
        opacity: interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        translate: `0px ${interpolate(s, [0, 1], [46, 0])}px`,
      }}
    >
      {/* rupee coin token — threads the amber accent through every row */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: display,
          fontSize: 46,
          lineHeight: 1,
          background: primary ? C.ink : C.yellow,
          color: primary ? C.yellow : C.ink,
        }}
      >
        ₹
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 28,
            marginTop: 4,
            opacity: primary ? 0.72 : 0.6,
          }}
        >
          {formatCompactINR(total)}
        </div>
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: 80,
          lineHeight: 0.9,
          flexShrink: 0,
        }}
      >
        {pct}
        <span style={{ fontSize: 40 }}>%</span>
      </div>
    </div>
  );
};

export const SceneAccounts: React.FC<{ data: Data }> = ({ data }) => {
  const accounts = (
    data.accounts && data.accounts.length
      ? data.accounts
      : [
          {
            key: "x",
            label: "Your account",
            total: data.totalSent,
            count: data.paidCount,
            pct: 100,
          },
      ]
  ).slice(0, 4);

  const n = accounts.length;

  return (
    <Scene bg={C.violet} a="#A78CFF" b="#3D2199" align="flex-start">
      <Eyebrow color={C.yellow}>Where it spent from</Eyebrow>

      <div style={{ width: "100%", marginTop: 60 }}>
        <RevealUp delay={6}>
          <div style={{ fontFamily: display, fontSize: 92, lineHeight: 1 }}>
            <span style={{ color: C.yellow }}>{n}</span>{" "}
            {n === 1 ? "account" : "accounts"}
          </div>
        </RevealUp>
        <RevealUp delay={12}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 34,
              opacity: 0.72,
              marginTop: 12,
              maxWidth: 780,
            }}
          >
            {n === 1
              ? "Every rupee flowed in from a single account."
              : "Ranked by how much each one moved."}
          </div>
        </RevealUp>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          marginTop: 92,
        }}
      >
        {accounts.map((a, i) => (
          <AccountCard
            key={a.key}
            label={a.label}
            total={a.total}
            pct={a.pct}
            primary={i === 0}
            delay={26 + i * 8}
          />
        ))}
      </div>
    </Scene>
  );
};
