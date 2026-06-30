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
  SpeakerLoudIcon,
  SpeakerOffIcon,
  UploadIcon,
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
import { DEMO_WRAPPED } from "../lib/demo-data";
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
  // global count of recaps unwrapped (from the JSON-db API)
  const [views, setViews] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = status.kind === "ready";
  const reset = useCallback(() => setStatus({ kind: "idle" }), []);
  const openPicker = useCallback(() => inputRef.current?.click(), []);

  // fetch the current count on load
  useEffect(() => {
    let cancelled = false;
    fetch("/api/views")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d?.count === "number") setViews(d.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
      // a recap was just unwrapped — bump the global counter
      fetch("/api/views", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (typeof d?.count === "number") setViews(d.count);
        })
        .catch(() => {});
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
              views={views}
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
  views: number | null;
}> = ({ status, dragging, setDragging, openPicker, onDrop, onHelp, views }) => {
  const parsing = status.kind === "parsing";

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div
        className="mw-fade-up flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px]"
        style={{ color: "var(--fg-3)", animationDelay: "40ms" }}
      >
        <span className="h-px w-6 sm:w-8" style={{ background: "var(--accent)" }} />
        MoneyUnwrapped · 2026 Edition
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
        , unwrapped.
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
        <PreviewPlayer busy={parsing} />
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--fg-3)" }}
        >
          <PlayIcon className="h-3 w-3" /> Demo recap · 60 seconds
        </span>

        {views !== null && views > 0 && (
          <span
            className="mt-2.5 inline-flex items-center gap-2 text-[11px] font-semibold tabular-nums"
            style={{ color: "var(--fg-3)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#34d98a" }}
            />
            {views.toLocaleString("en-IN")} recaps unwrapped so far
          </span>
        )}
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

// frames → m:ss, for the timeline counter
const fmtTime = (frames: number) => {
  const total = Math.round(frames / VIDEO_FPS);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ===========================================================================
// VIDEO PLAYER — audio on by default, per-section playback, no looping
// ===========================================================================
const VideoPlayer: React.FC<{ data: WrappedData }> = ({ data }) => {
  const ref = useRef<PlayerRef>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const movedRef = useRef(false);
  const downXRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  // current playhead position, in frames — drives the timeline fill
  const [frame, setFrame] = useState(0);
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
      setFrame(f);
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

  // map a pointer x-position on the timeline track to a frame
  const frameFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(pct * (DURATION_IN_FRAMES - 1));
  }, []);

  const seekToFrame = useCallback((f: number) => {
    const p = ref.current;
    if (!p) return;
    stopAtRef.current = null;
    p.seekTo(f);
    setFrame(f);
  }, []);

  // drag anywhere on the track to scrub frame-accurately
  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const p = ref.current;
      if (!p) return;
      scrubbingRef.current = true;
      movedRef.current = false;
      downXRef.current = e.clientX;
      e.currentTarget.setPointerCapture(e.pointerId);
      p.pause();
      seekToFrame(frameFromClientX(e.clientX));
    },
    [frameFromClientX, seekToFrame],
  );

  const onTrackPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!scrubbingRef.current) return;
      if (Math.abs(e.clientX - downXRef.current) > 5) movedRef.current = true;
      seekToFrame(frameFromClientX(e.clientX));
    },
    [frameFromClientX, seekToFrame],
  );

  const onTrackPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!scrubbingRef.current) return;
      scrubbingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
      // a tap (no real drag) jumps to — and plays — the scene under the cursor
      if (!movedRef.current) {
        const f = frameFromClientX(e.clientX);
        const idx = SECTIONS.findIndex((s) => f >= s.start && f < s.end);
        if (idx !== -1) playSection(idx);
      }
    },
    [frameFromClientX, playSection],
  );

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
            : "relative overflow-hidden border"
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

      {/* seekable timeline — every scene is a segment; drag to scrub, tap a
          segment to jump to that scene. Cuts are the gaps between segments. */}
      <div className="mt-4 select-none">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold">
          <span className="min-w-0 truncate" style={{ color: "var(--fg-2)" }}>
            {activeIdx !== null
              ? `${activeIdx + 1}. ${SECTIONS[activeIdx].label}`
              : "Drag to seek · tap a scene"}
          </span>
          <span className="shrink-0 tabular-nums" style={{ color: "var(--fg-3)" }}>
            {fmtTime(frame)} / {fmtTime(DURATION_IN_FRAMES)}
          </span>
        </div>

        <div
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          role="slider"
          aria-label="Seek video"
          aria-valuemin={0}
          aria-valuemax={DURATION_IN_FRAMES}
          aria-valuenow={frame}
          className="flex h-7 w-full cursor-pointer items-center gap-[3px]"
          style={{ touchAction: "none" }}
        >
          {SECTIONS.map((s, i) => {
            const span = s.end - s.start;
            const fill = Math.min(1, Math.max(0, (frame - s.start) / span));
            const active = i === activeIdx;
            return (
              <div
                key={s.label}
                title={`${i + 1}. ${s.label}`}
                className="relative overflow-hidden rounded-full transition-all duration-150"
                style={{
                  flexGrow: span,
                  flexBasis: 0,
                  height: active ? 10 : 6,
                  background: active ? "var(--accent)" : "var(--panel-2)",
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${fill * 100}%`, background: "var(--accent)" }}
                />
              </div>
            );
          })}
        </div>
      </div>
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
          <UploadIcon /> Wrap another statement
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
          @{data.handle}&apos;s MoneyUnwrapped
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
// PREVIEW PLAYER — a playable, 100% fictional demo recap shown on the hero
// so visitors can watch a full preview before uploading their own statement.
// ===========================================================================
const PreviewPlayer: React.FC<{ busy: boolean }> = ({ busy }) => {
  const ref = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    // loop the demo so the hero is never left on a frozen end frame
    const onEnded = () => {
      p.seekTo(0);
      p.play();
    };
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    p.addEventListener("ended", onEnded);
    return () => {
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    // first interaction unmutes — browsers allow audio after a user gesture
    if (!started) {
      p.unmute();
      setMuted(false);
      setStarted(true);
      // internal metric: count this as one demo play (fire-and-forget, never
      // surfaced on the page). One bump per session, on first play.
      fetch("/api/demo-plays", { method: "POST" }).catch(() => {});
    }
    p.toggle();
  }, [started]);

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

  return (
    <div
      className="relative w-[clamp(188px,26vh,248px)] overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--line)", background: "#000" }}
    >
      <Player
        ref={ref}
        component={Main}
        inputProps={DEMO_WRAPPED}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        compositionHeight={VIDEO_HEIGHT}
        compositionWidth={VIDEO_WIDTH}
        style={{ width: "100%", display: "block" }}
        clickToPlay={false}
        controls={false}
        initiallyMuted
        numberOfSharedAudioTags={0}
      />

      {/* tap layer + centered play/pause */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause demo" : "Play demo"}
        className="group absolute inset-0 grid place-items-center"
      >
        {busy ? (
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span
            className={`grid place-items-center rounded-full shadow-lg transition-all duration-200 ${
              playing
                ? "h-12 w-12 opacity-0 group-hover:opacity-100 group-active:opacity-100"
                : "h-[56px] w-[56px] opacity-100"
            }`}
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {playing ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-7 w-7 translate-x-[2px]" />
            )}
          </span>
        )}
      </button>

      {/* mute toggle */}
      {started && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full text-white"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          {muted ? (
            <SpeakerOffIcon className="h-4 w-4" />
          ) : (
            <SpeakerLoudIcon className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

// ===========================================================================
// HELP MODAL — how to get your statement
// ===========================================================================
const STEPS = [
  'Open Google Pay and scroll down to locate "See transaction history".',
  "In the top-right corner (near the search bar), tap More, then select Get statement.",
  "Choose the statement period you need — anywhere from 1 to 6 months.",
  "Tap Continue to load the statement.",
  "Once it loads, tap Share and select Save to device to download the PDF.",
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
