"use client";

import {
  ArrowRightIcon,
  Cross1Icon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  FileTextIcon,
  LockClosedIcon,
  PauseIcon,
  PlayIcon,
  QuestionMarkCircledIcon,
  ReloadIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";
import { Player, type PlayerRef } from "@remotion/player";
import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { GPayLogo, SiteFooter, SiteHeader } from "../components/site";
import { formatCompactINR, type WrappedData } from "../lib/analytics";
import { Main, SECTIONS } from "../remotion/MoneyWrapped/Main";

type Status =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "ready"; data: WrappedData }
  | { kind: "error"; message: string };

const Home: NextPage = () => {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [help, setHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = status.kind === "ready";
  const reset = useCallback(() => setStatus({ kind: "idle" }), []);
  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus({ kind: "error", message: "Please choose a PDF file." });
      return;
    }
    setStatus({ kind: "parsing" });
    try {
      const { parseStatement } = await import("../lib/parse-statement");
      const data = await parseStatement(file);
      setStatus({ kind: "ready", data });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not read that PDF.",
      });
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 sm:px-6">
        <SiteHeader onBrandClick={reset} />

        <main className="flex flex-1 flex-col justify-center py-8 sm:py-12">
          {ready ? (
            <Result data={status.data} onReset={reset} />
          ) : (
            <Landing
              status={status}
              dragging={dragging}
              setDragging={setDragging}
              openPicker={openPicker}
              onDrop={onDrop}
              onHelp={() => setHelp(true)}
            />
          )}
        </main>

        <SiteFooter />
      </div>

      {help && <HelpModal onClose={() => setHelp(false)} />}
    </>
  );
};

// ===========================================================================
// LANDING — centered "cinema" hero with a ticket-stub upload
// ===========================================================================
const Landing: React.FC<{
  status: Status;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  openPicker: () => void;
  onDrop: (e: React.DragEvent) => void;
  onHelp: () => void;
}> = ({ status, dragging, setDragging, openPicker, onDrop, onHelp }) => {
  const parsing = status.kind === "parsing";

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div
        className="mw-fade-up flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px]"
        style={{ color: "var(--fg-3)", animationDelay: "40ms" }}
      >
        <span className="h-px w-6 sm:w-8" style={{ background: "var(--accent)" }} />
        Money Wrapped · 2026 Edition
        <span className="h-px w-6 sm:w-8" style={{ background: "var(--accent)" }} />
      </div>

      <h1
        className="mw-fade-up mt-5 text-[2rem] font-extrabold leading-[1.02] tracking-tight sm:text-5xl"
        style={{ animationDelay: "100ms" }}
      >
        Your{" "}
        <span
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--accent), var(--coral))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          money
        </span>
        , wrapped.
      </h1>

      <p
        className="mw-fade-up mt-4 max-w-md text-[15px] leading-relaxed sm:text-base"
        style={{ color: "var(--fg-3)", animationDelay: "160ms" }}
      >
        A cinematic recap of your year in payments.
      </p>

      {/* reel preview — the hero */}
      <div
        className="mw-fade-up mt-7 flex flex-col items-center sm:mt-8"
        style={{ animationDelay: "220ms" }}
      >
        <div
          className="w-[clamp(188px,26vh,248px)] overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--line)", background: "#000" }}
        >
          <Cover busy={parsing} />
        </div>
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--fg-3)" }}
        >
          <PlayIcon className="h-3 w-3" /> 60-second recap
        </span>
      </div>

      {/* ticket-stub upload */}
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="mw-fade-up group relative mt-7 flex w-full max-w-xl cursor-pointer overflow-hidden rounded-2xl border transition-colors sm:mt-8"
        style={{
          borderColor: dragging ? "var(--accent)" : "var(--line)",
          background: dragging ? "var(--panel-2)" : "var(--panel)",
          animationDelay: "280ms",
        }}
      >
        {/* stub */}
        <div
          className="flex w-[54px] shrink-0 items-center justify-center sm:w-[64px]"
          style={{ background: "var(--accent)" }}
        >
          <span
            className="text-[10px] font-black uppercase tracking-[0.3em] sm:text-[11px]"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "var(--accent-ink)",
            }}
          >
            Admit One
          </span>
        </div>

        {/* perforation */}
        <div className="relative w-0">
          <div
            className="h-full border-l-2 border-dashed"
            style={{ borderColor: "var(--line)" }}
          />
          <span
            className="absolute -left-[7px] -top-2 h-3.5 w-3.5 rounded-full"
            style={{ background: "var(--bg)" }}
          />
          <span
            className="absolute -bottom-2 -left-[7px] h-3.5 w-3.5 rounded-full"
            style={{ background: "var(--bg)" }}
          />
        </div>

        {/* body */}
        <div className="flex flex-1 items-center gap-3 p-3 pl-4 sm:gap-4 sm:p-5">
          <FileTextIcon
            className="hidden h-5 w-5 shrink-0 sm:block"
            style={{ color: "var(--fg-3)" }}
          />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-semibold sm:text-[15px]">
              {parsing ? "Reading your statement…" : "Drop your statement PDF"}
            </div>
            <div
              className="mt-0.5 truncate text-xs"
              style={{ color: "var(--fg-3)" }}
            >
              tap to browse · 1–6 months
            </div>
          </div>
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:translate-x-0.5 sm:h-12 sm:w-12"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {parsing ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
            ) : (
              <ArrowRightIcon className="h-5 w-5" />
            )}
          </span>
        </div>
      </div>

      {status.kind === "error" ? (
        <p
          className="mt-4 w-full max-w-xl rounded-lg border px-4 py-2.5 text-sm font-medium"
          style={{
            background: "var(--err-bg)",
            borderColor: "var(--err-line)",
            color: "var(--err-fg)",
          }}
        >
          {status.message}
        </p>
      ) : (
        <>
          <div
            className="mw-fade-up mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs"
            style={{ color: "var(--fg-3)", animationDelay: "340ms" }}
          >
            <span className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--fg-4)" }}
              >
                Supported
              </span>
              <GPayLogo />
            </span>
            <Dot />
            <button
              onClick={onHelp}
              className="inline-flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--accent-text)" }}
            >
              <QuestionMarkCircledIcon /> How to get your statement
            </button>
          </div>
          <p
            className="mw-fade-up mt-3 text-[11px]"
            style={{ color: "var(--fg-4)", animationDelay: "380ms" }}
          >
            Support for more statements coming soon.
          </p>
        </>
      )}
    </div>
  );
};

const Dot: React.FC = () => (
  <span className="h-1 w-1 rounded-full" style={{ background: "var(--fg-4)" }} />
);

// ===========================================================================
// VIDEO PLAYER — audio on by default, per-section playback, no looping
// ===========================================================================
const VideoPlayer: React.FC<{ data: WrappedData }> = ({ data }) => {
  const ref = useRef<PlayerRef>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  // CSS pseudo-fullscreen fallback for browsers without the Fullscreen API
  // (notably iOS Safari, which only supports it on native <video> elements)
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  // index of the section currently being scrubbed through (for highlighting)
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  // when playing a single section, the frame at which to auto-stop
  const stopAtRef = useRef<number | null>(null);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onFrame = (e: { detail: { frame: number } }) => {
      const f = e.detail.frame;
      if (stopAtRef.current !== null && f >= stopAtRef.current) {
        stopAtRef.current = null;
        p.pause();
      }
      const idx = SECTIONS.findIndex((s) => f >= s.start && f < s.end);
      setActiveIdx(idx === -1 ? null : idx);
    };
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    p.addEventListener("frameupdate", onFrame);
    return () => {
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("frameupdate", onFrame);
    };
  }, []);

  const unmuteOnce = useCallback((p: PlayerRef) => {
    if (p.isMuted()) {
      p.unmute();
      setMuted(false);
    }
  }, []);

  // big centre button: free play/pause of the whole recap (no auto-stop)
  const toggle = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    unmuteOnce(p);
    stopAtRef.current = null;
    p.toggle();
  }, [unmuteOnce]);

  // play one section from its start and stop when it ends
  const playSection = useCallback(
    (i: number) => {
      const p = ref.current;
      if (!p) return;
      const s = SECTIONS[i];
      unmuteOnce(p);
      p.seekTo(s.start);
      stopAtRef.current = s.end;
      p.play();
    },
    [unmuteOnce],
  );

  // combined CTA: play the whole thing from the top
  const playFull = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    unmuteOnce(p);
    stopAtRef.current = null;
    p.seekTo(0);
    p.play();
  }, [unmuteOnce]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const p = ref.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unmute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, []);

  const goFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Prefer the native Fullscreen API (desktop, Android Chrome).
    const nativeSupported =
      typeof document !== "undefined" &&
      (document.fullscreenEnabled ||
        // Safari desktop exposes the webkit-prefixed flag
        (document as unknown as { webkitFullscreenEnabled?: boolean })
          .webkitFullscreenEnabled);
    if (nativeSupported) {
      try {
        ref.current?.requestFullscreen();
        return;
      } catch {
        // fall through to the CSS fallback below
      }
    }
    // iOS Safari (and anything else without element fullscreen): expand
    // the player to fill the viewport with fixed positioning instead.
    setCssFullscreen((v) => !v);
  }, []);

  // Allow exiting the CSS fullscreen fallback with Escape, and stop the page
  // behind it from scrolling while it's open.
  useEffect(() => {
    if (!cssFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCssFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [cssFullscreen]);

  return (
    <div className="mx-auto flex w-[min(64vw,260px)] flex-col sm:w-[280px] lg:w-[clamp(260px,40vh,340px)]">
      <div
        ref={boxRef}
        className={
          cssFullscreen
            ? "fixed inset-0 z-[60] grid place-items-center"
            : "relative overflow-hidden rounded-2xl border"
        }
        style={{
          borderColor: cssFullscreen ? undefined : "var(--line)",
          background: "#000",
        }}
      >
        <Player
          ref={ref}
          component={Main}
          inputProps={data}
          durationInFrames={DURATION_IN_FRAMES}
          fps={VIDEO_FPS}
          compositionHeight={VIDEO_HEIGHT}
          compositionWidth={VIDEO_WIDTH}
          style={
            cssFullscreen
              ? { width: "100vw", height: "100dvh", display: "block" }
              : { width: "100%", display: "block" }
          }
          clickToPlay={false}
          controls={false}
          numberOfSharedAudioTags={0}
        />

        {/* tap layer + big centered play/pause */}
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="group absolute inset-0 grid place-items-center"
        >
          <span
            className={`grid place-items-center rounded-full shadow-lg transition-all duration-200 ${
              playing
                ? "h-14 w-14 opacity-0 group-hover:opacity-100 group-active:opacity-100"
                : "h-[72px] w-[72px] opacity-100"
            }`}
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {playing ? (
              <PauseIcon className="h-7 w-7" />
            ) : (
              <PlayIcon className="h-8 w-8 translate-x-[2px]" />
            )}
          </span>
        </button>

        {/* controls: fullscreen + mute */}
        <button
          onClick={goFullscreen}
          aria-label={cssFullscreen ? "Exit full screen" : "Full screen"}
          className="absolute bottom-3 left-3 z-10 grid h-10 w-10 place-items-center rounded-full text-white"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          {cssFullscreen ? (
            <ExitFullScreenIcon className="h-5 w-5" />
          ) : (
            <EnterFullScreenIcon className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full text-white"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          {muted ? (
            <SpeakerOffIcon className="h-5 w-5" />
          ) : (
            <SpeakerLoudIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* chapter grid — GitHub-style squares; number only, label on hover */}
      <div
        className="mt-4 grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
      >
        {SECTIONS.map((s, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={s.label}
              onClick={() => playSection(i)}
              aria-label={`Play ${s.label}`}
              className="group relative grid place-items-center rounded-[5px] border text-xs font-bold tabular-nums transition-colors"
              style={{
                aspectRatio: "1 / 1",
                borderColor: active ? "var(--accent)" : "var(--line)",
                background: active ? "var(--accent)" : "var(--panel)",
                color: active ? "var(--accent-ink)" : "var(--fg-2)",
              }}
            >
              {i + 1}
              {/* hover label (desktop only — needs a pointer) */}
              <span
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                style={{
                  background: "var(--panel-2)",
                  borderColor: "var(--line)",
                  color: "var(--fg)",
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* full-video bar — the combined CTA */}
      <button
        onClick={playFull}
        className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[5px] text-xs font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        <PlayIcon className="h-3.5 w-3.5" /> Full recap
      </button>
    </div>
  );
};

// ===========================================================================
// RESULT — video on top (mobile), rich highlights + account split
// ===========================================================================
const ACCOUNT_COLORS = ["#FFC93C", "#2F6BFF", "#00C2C7", "#FF4D9D"];

const Result: React.FC<{ data: WrappedData; onReset: () => void }> = ({
  data,
  onReset,
}) => {
  return (
    <div className="grid w-full items-start gap-9 lg:grid-cols-[1fr_minmax(260px,0.82fr)] lg:gap-12">
      {/* video — first in DOM (top on mobile), right column on desktop */}
      <div className="order-1 flex min-w-0 flex-col items-center lg:order-2">
        <VideoPlayer data={data} />
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            borderColor: "var(--line)",
            background: "var(--panel)",
            color: "var(--fg-2)",
          }}
        >
          <ReloadIcon /> Make another
        </button>
      </div>

      {/* meta */}
      <div className="order-2 flex min-w-0 flex-col lg:order-1">
        <div
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--fg-3)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#34d98a]" /> Now playing
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-4xl">
          @{data.handle}&apos;s Money Wrapped
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
          {data.periodLabel}
        </p>

        {/* highlights */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard label="Total spent" value={formatCompactINR(data.totalSent)} />
          <StatCard
            label="Transactions"
            value={data.txnCount.toLocaleString("en-IN")}
          />
          <StatCard
            label="People & places"
            value={data.uniquePayees.toLocaleString("en-IN")}
          />
          <StatCard
            label="Biggest"
            value={formatCompactINR(data.biggest.amount)}
            sub={`to ${data.biggest.name}`}
          />
        </div>

        {/* account split */}
        {data.accounts.length > 0 && (
          <div className="mt-7">
            <SectionLabel>Where it was spent from</SectionLabel>
            <div
              className="mt-3 flex h-3 w-full overflow-hidden rounded-full"
              style={{ background: "var(--panel-2)" }}
            >
              {data.accounts.map((a, i) => (
                <div
                  key={a.key}
                  style={{
                    width: `${a.pct}%`,
                    background: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
                  }}
                />
              ))}
            </div>
            <dl className="mt-4 space-y-2.5">
              {data.accounts.map((a, i) => (
                <div key={a.key} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
                    }}
                  />
                  <dt className="min-w-0 flex-1 truncate text-sm font-medium">
                    {a.label}
                  </dt>
                  <dd className="text-sm font-bold tabular-nums">
                    {formatCompactINR(a.total)}
                  </dd>
                  <dd
                    className="w-10 text-right text-xs tabular-nums"
                    style={{ color: "var(--fg-3)" }}
                  >
                    {a.pct}%
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* paid most often */}
        {data.topPayeesByCount.length > 0 && (
          <div className="mt-7">
            <SectionLabel>Paid most often</SectionLabel>
            <div className="mt-3 flex flex-col">
              {data.topPayeesByCount.slice(0, 3).map((p, i) => (
                <PersonRow
                  key={p.name}
                  rank={i + 1}
                  name={p.name}
                  count={p.count}
                  total={p.total}
                />
              ))}
            </div>
          </div>
        )}

        {/* personality */}
        <div
          className="mt-7 rounded-xl border p-4"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <SectionLabel>Your money personality</SectionLabel>
          <div className="mt-1 text-lg font-bold">{data.personality.title}</div>
          <div className="text-sm" style={{ color: "var(--fg-3)" }}>
            {data.personality.blurb}
          </div>
        </div>

        <p
          className="mt-6 flex items-center gap-1.5 text-xs"
          style={{ color: "var(--fg-3)" }}
        >
          <LockClosedIcon /> Plays right here · nothing leaves your device.
        </p>
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
    style={{ color: "var(--fg-3)" }}
  >
    {children}
  </div>
);

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div
    className="rounded-xl border p-3.5"
    style={{ borderColor: "var(--line)", background: "var(--panel)" }}
  >
    <div
      className="text-[10px] font-semibold uppercase tracking-[0.16em]"
      style={{ color: "var(--fg-3)" }}
    >
      {label}
    </div>
    <div className="mt-1 truncate text-2xl font-extrabold tracking-tight">
      {value}
    </div>
    {sub && (
      <div className="mt-0.5 truncate text-xs" style={{ color: "var(--fg-3)" }}>
        {sub}
      </div>
    )}
  </div>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const PersonRow: React.FC<{
  rank: number;
  name: string;
  count: number;
  total: number;
}> = ({ rank, name, count, total }) => (
  <div
    className="flex items-center gap-3 border-b py-2.5"
    style={{ borderColor: "var(--line)" }}
  >
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
      style={{
        background: rank === 1 ? "var(--accent)" : "var(--panel-2)",
        color: rank === 1 ? "var(--accent-ink)" : "var(--fg-2)",
      }}
    >
      {initials(name)}
    </span>
    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
    <span className="text-right text-sm font-bold tabular-nums">
      {count}×
    </span>
    <span
      className="w-16 text-right text-xs tabular-nums"
      style={{ color: "var(--fg-3)" }}
    >
      {formatCompactINR(total)}
    </span>
  </div>
);

// ===========================================================================
// REEL COVER — color-blocked title card (kept dark; it previews the video)
// ===========================================================================
const Cover: React.FC<{ busy: boolean }> = ({ busy }) => (
  <div
    className="relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden p-4"
    style={{ background: "linear-gradient(160deg,#16131F 0%,#0B0C12 60%)" }}
  >
    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
      <span>Money Wrapped</span>
      <span>20:26</span>
    </div>

    <div className="flex flex-col">
      <span
        className="font-extrabold leading-[0.92] tracking-tight text-transparent"
        style={{
          fontSize: "clamp(24px,4.6vh,32px)",
          WebkitTextStroke: "1.4px #FFFDF5",
        }}
      >
        MONEY
      </span>
      <span
        className="font-extrabold leading-[0.92] tracking-tight"
        style={{ fontSize: "clamp(24px,4.6vh,32px)", color: "#FFC93C" }}
      >
        WRAPPED
      </span>
      <span className="mt-3 h-px w-[18%]" style={{ background: "#FF5C46" }} />
    </div>

    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
      <span>Your year</span>
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <span style={{ color: "#FFC93C" }}>60s recap</span>
      )}
    </div>
  </div>
);

// ===========================================================================
// HELP MODAL — how to get your statement
// ===========================================================================
const STEPS = [
  'Open Google Pay and scroll down to locate "See transaction history".',
  "In the top-right corner (near the search bar), tap More, then select Get statement.",
  "Choose the statement period you need — anywhere from 1 to 6 months.",
  "Tap Continue to load the statement.",
];

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
    onClick={onClose}
  >
    <div
      className="mw-fade-up w-full max-w-lg rounded-2xl border p-6 sm:p-7"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold">How to get your statement</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
            From the Google Pay app
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--line)", color: "var(--fg-2)" }}
        >
          <Cross1Icon />
        </button>
      </div>

      <ol className="mt-6 flex flex-col gap-4">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {i + 1}
            </span>
            <span
              className="text-[15px] leading-relaxed"
              style={{ color: "var(--fg-2)" }}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>

      <button
        onClick={onClose}
        className="mt-7 w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Got it
      </button>
    </div>
  </div>
);

export default Home;
