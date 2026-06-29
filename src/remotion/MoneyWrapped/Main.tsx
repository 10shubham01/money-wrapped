import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
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

// scene durations (frames). Sum = 1920; minus 10×12 transitions = 1800 = 60s.
const SCENES: { dur: number; Comp: React.FC<{ data: Data }> }[] = [
  { dur: 150, Comp: SceneIntro },
  { dur: 190, Comp: SceneTotalSpent },
  { dur: 178, Comp: SceneTransactions },
  { dur: 210, Comp: SceneReceipt },
  { dur: 222, Comp: SceneLeaderboard },
  { dur: 182, Comp: SceneBiggestSplurge },
  { dur: 178, Comp: ScenePowerHour },
  { dur: 186, Comp: SceneMonthly },
  { dur: 168, Comp: SceneCircle },
  { dur: 172, Comp: ScenePersonality },
  { dur: 84, Comp: SceneOutro },
];

const transitions = [
  slide({ direction: "from-bottom" }),
  wipe({ direction: "from-right" }),
  fade(),
  slide({ direction: "from-right" }),
  fade(),
  wipe({ direction: "from-bottom" }),
  slide({ direction: "from-right" }),
  fade(),
  wipe({ direction: "from-right" }),
  slide({ direction: "from-bottom" }),
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
