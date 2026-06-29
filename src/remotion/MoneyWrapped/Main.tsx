import {
  linearTiming,
  type TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { CompositionProps } from "../../../types/constants";
import { sans } from "./fonts";
import {
  SceneAccounts,
  SceneBiggestSplurge,
  SceneCircle,
  SceneIntro,
  SceneLeaderboard,
  SceneMonthly,
  SceneOutro,
  ScenePersonality,
  ScenePowerHour,
  SceneReceipt,
  SceneTotalSpent,
  SceneTransactions,
} from "./scenes";

type Data = z.infer<typeof CompositionProps>;

const TR = 12; // transition length (frames)

// scene durations (frames). Sum = 1932; minus 11×12 transitions = 1800 = 60s.
// Ordered as a short story: the scale → where it came from → the rhythm →
// the people → the verdict.
const SCENES: {
  dur: number;
  label: string;
  Comp: React.FC<{ data: Data }>;
}[] = [
  // — the scale —
  { dur: 150, label: "Intro", Comp: SceneIntro },
  { dur: 172, label: "Total spent", Comp: SceneTotalSpent },
  { dur: 160, label: "Transactions", Comp: SceneTransactions },
  // — where the money came from —
  { dur: 150, label: "Accounts", Comp: SceneAccounts },
  // — the rhythm (when, across time) —
  { dur: 178, label: "Power hour", Comp: ScenePowerHour },
  { dur: 168, label: "By month", Comp: SceneMonthly },
  // — the people (regulars → reach → the bill → the peak) —
  { dur: 196, label: "Top people", Comp: SceneLeaderboard },
  { dur: 152, label: "Your circle", Comp: SceneCircle },
  { dur: 186, label: "Receipt", Comp: SceneReceipt },
  { dur: 164, label: "Biggest splurge", Comp: SceneBiggestSplurge },
  // — the verdict —
  { dur: 172, label: "Personality", Comp: ScenePersonality },
  { dur: 84, label: "Outro", Comp: SceneOutro },
];

// Total timeline length: every transition overlaps its neighbours by TR.
const DURATION_FRAMES =
  SCENES.reduce((s, x) => s + x.dur, 0) - (SCENES.length - 1) * TR;

// Frame ranges of each scene on the *timeline* (transitions overlap by TR, so
// sequence k starts at Σdur[<k] − k·TR). Exposed so the landing page can offer
// per-section playback. end = next section's start (last = full duration).
export type Section = { label: string; start: number; end: number };
export const SECTIONS: Section[] = SCENES.map((s, k) => {
  const start = SCENES.slice(0, k).reduce((a, x) => a + x.dur, 0) - k * TR;
  return { label: s.label, start };
}).map((seg, k, arr) => ({
  ...seg,
  end: k < arr.length - 1 ? arr[k + 1].start : DURATION_FRAMES,
}));

// Forward-moving slides carry the story along; fades mark the act breaks.
// slide() and fade() yield differently-parameterised presentations, so the
// array is intentionally heterogeneous.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transitions: TransitionPresentation<any>[] = [
  slide({ direction: "from-bottom" }), // intro → total spent
  slide({ direction: "from-right" }), // total spent → transactions
  fade(), // transactions → accounts (where it came from)
  slide({ direction: "from-right" }), // accounts → power hour
  slide({ direction: "from-right" }), // power hour → monthly
  fade(), // monthly → leaderboard (the people begin)
  slide({ direction: "from-right" }), // leaderboard → circle
  slide({ direction: "from-right" }), // circle → receipt
  slide({ direction: "from-right" }), // receipt → biggest splurge
  fade(), // biggest splurge → personality (the verdict)
  slide({ direction: "from-bottom" }), // personality → outro
];

export const Main: React.FC<Data> = (data) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: sans, backgroundColor: "#0E0F1A" }}>
      <Audio
        src={staticFile("audio/wrapped-theme.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, durationInFrames - 45, durationInFrames],
            [0, 0.85, 0.85, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      <TransitionSeries>
        {SCENES.map(({ dur, Comp }, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={dur}>
              <Comp data={data} />
            </TransitionSeries.Sequence>
            {i < SCENES.length - 1 && (
              <TransitionSeries.Transition
                presentation={transitions[i]}
                timing={linearTiming({ durationInFrames: TR })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      <Hud data={data} />
    </AbsoluteFill>
  );
};

// Persistent Instagram-Stories-style HUD: segmented progress + wordmark.
// mixBlendMode:difference keeps it legible over every scene colour.
const Hud: React.FC<{ data: Data }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const total = SCENES.reduce((s, x) => s + x.dur, 0);
  let acc = 0;
  const bounds = SCENES.map(({ dur }) => {
    const start = (acc / total) * durationInFrames;
    acc += dur;
    const end = (acc / total) * durationInFrames;
    return { start, end };
  });

  return (
    <AbsoluteFill style={{ mixBlendMode: "difference", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 56, left: 60, right: 60 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {bounds.map((b, i) => {
            const p = interpolate(frame, [b.start, b.end], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div key={i} style={{ flex: 1, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
                <div style={{ width: `${p * 100}%`, height: "100%", background: "#fff" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 1 }}>
          <span>MONEY WRAPPED</span>
          <span style={{ opacity: 0.85 }}>@{data.handle}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
