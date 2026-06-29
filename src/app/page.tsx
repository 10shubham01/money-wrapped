"use client";

import {
  ArrowRightIcon,
  Cross1Icon,
  FileTextIcon,
  GitHubLogoIcon,
  HeartFilledIcon,
  LockClosedIcon,
  QuestionMarkCircledIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useCallback, useRef, useState } from "react";
import {
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { formatCompactINR, type WrappedData } from "../lib/analytics";
import { Main } from "../remotion/MoneyWrapped/Main";

type Status =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "ready"; data: WrappedData }
  | { kind: "error"; message: string };

// --- editorial palette ------------------------------------------------------
const INK = "#0A0B0D"; // page canvas
const PANEL = "#101216"; // raised surface
const LINE = "#23262E"; // hairline rule
const AMBER = "#FFC93C";

const Home: NextPage = () => {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [help, setHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = status.kind === "ready";
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
    <div
      className="flex min-h-screen flex-col antialiased"
      style={{ background: INK, color: "#fff" }}
    >
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

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <Masthead onReset={() => setStatus({ kind: "idle" })} ready={ready} />

        <main className="flex flex-1 flex-col justify-center py-10 lg:py-14">
          {ready ? (
            <Result data={status.data} />
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

        <Footer />
      </div>

      {help && <HelpModal onClose={() => setHelp(false)} />}
    </div>
  );
};

// ===========================================================================
// MASTHEAD
// ===========================================================================
const Masthead: React.FC<{ onReset: () => void; ready: boolean }> = ({
  onReset,
  ready,
}) => (
  <header
    className="flex shrink-0 items-center justify-between border-b py-5"
    style={{ borderColor: LINE }}
  >
    <button onClick={onReset} className="flex items-center gap-3 text-left">
      <span
        className="grid h-9 w-9 place-items-center rounded-md text-sm font-black"
        style={{ background: AMBER, color: INK }}
      >
        M
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight">
          Money Wrapped
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
          Payments, in review
        </span>
      </span>
    </button>

    {ready ? (
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-white/40 hover:text-white"
        style={{ borderColor: LINE, background: PANEL }}
      >
        <ReloadIcon /> Make another
      </button>
    ) : (
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30 sm:block">
        Edition · 2026
      </span>
    )}
  </header>
);

// ===========================================================================
// FOOTER
// ===========================================================================
const Footer: React.FC = () => (
  <footer
    className="flex shrink-0 items-center justify-center gap-1.5 border-t py-5 text-xs text-white/40"
    style={{ borderColor: LINE }}
  >
    <span>Made with</span>
    <HeartFilledIcon className="text-[#FF5C46]" />
    <span>by</span>
    <a
      href="https://github.com/10shubham01"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-white/60 transition-colors hover:text-white"
    >
      <GitHubLogoIcon /> github/10shubham01
    </a>
  </footer>
);

// shared editorial eyebrow: a hairline + small tracked label
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
    <span className="h-px w-9" style={{ background: AMBER }} />
    {children}
  </div>
);

// ===========================================================================
// LANDING — editorial two-column hero
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
    <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
      {/* ---- left: editorial copy + upload ---- */}
      <div className="flex flex-col">
        <div className="mw-fade-up" style={{ animationDelay: "40ms" }}>
          <Eyebrow>01 — Bring your statement</Eyebrow>
        </div>

        <h1
          className="mw-fade-up mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl"
          style={{ animationDelay: "100ms" }}
        >
          Your{" "}
          <span className="bg-gradient-to-r from-[#FFC93C] to-[#FF5C46] bg-clip-text text-transparent">
            money
          </span>
          , wrapped.
        </h1>

        <p
          className="mw-fade-up mt-5 max-w-md text-[15px] leading-relaxed text-white/55 sm:text-base"
          style={{ animationDelay: "160ms" }}
        >
          Drop in your payment statement and we turn a year of taps into a
          cinematic, share-ready recap — composed entirely on your device.
        </p>

        {/* upload field */}
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
          className="mw-fade-up group mt-8 flex w-full max-w-md cursor-pointer items-center gap-4 rounded-xl border p-2.5 pl-5 transition-colors"
          style={{
            background: dragging ? "#15171C" : PANEL,
            borderColor: dragging ? AMBER : LINE,
            animationDelay: "220ms",
          }}
        >
          <FileTextIcon className="h-5 w-5 shrink-0 text-white/45" />
          <span className="flex-1 truncate text-left text-[15px] text-white/70">
            {parsing
              ? "Reading your statement…"
              : "Drop your PDF, or click to browse"}
          </span>
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg transition-transform group-hover:translate-x-0.5"
            style={{ background: AMBER, color: INK }}
          >
            {parsing ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
            ) : (
              <ArrowRightIcon className="h-5 w-5" />
            )}
          </span>
        </div>

        {/* supported statement + accepted range */}
        <div
          className="mw-fade-up mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
          style={{ animationDelay: "260ms" }}
        >
          <span className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Supported
            </span>
            <GPayLogo />
          </span>
          <span className="h-3.5 w-px" style={{ background: LINE }} />
          <span className="text-xs text-white/45">
            Statements covering{" "}
            <span className="font-semibold text-white/70">1–6 months</span>
          </span>
        </div>

        {status.kind === "error" ? (
          <p
            className="mt-4 w-full max-w-md rounded-lg border px-4 py-2.5 text-sm font-medium text-[#FF9E80]"
            style={{ background: "#1E1311", borderColor: "#43201A" }}
          >
            {status.message}
          </p>
        ) : (
          <div
            className="mw-fade-up mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"
            style={{ animationDelay: "280ms" }}
          >
            <button
              onClick={onHelp}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFD66B] transition-colors hover:text-[#FFC93C]"
            >
              <QuestionMarkCircledIcon /> How to get your statement
            </button>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <LockClosedIcon /> Never uploaded · no sign-up
            </span>
          </div>
        )}

        {/* editorial trust figures */}
        <dl
          className="mw-fade-up mt-10 grid max-w-md grid-cols-3 border-t pt-6"
          style={{ borderColor: LINE, animationDelay: "340ms" }}
        >
          <Figure value="100%" label="On-device" />
          <Figure value="0" label="Uploads" divider />
          <Figure value="60 sec" label="Recap reel" divider />
        </dl>
      </div>

      {/* ---- right: reel preview plate ---- */}
      <div
        className="mw-fade-up flex flex-col items-center lg:items-end"
        style={{ animationDelay: "240ms" }}
      >
        <div
          className="w-[clamp(180px,30vh,236px)] overflow-hidden rounded-2xl border"
          style={{ borderColor: LINE, background: "#000" }}
        >
          <Cover busy={parsing} />
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/30">
          Preview · the opening title
        </p>
      </div>
    </div>
  );
};

const Figure: React.FC<{ value: string; label: string; divider?: boolean }> = ({
  value,
  label,
  divider,
}) => (
  <div className={divider ? "border-l pl-4" : ""} style={divider ? { borderColor: LINE } : undefined}>
    <dt className="text-2xl font-extrabold tracking-tight">{value}</dt>
    <dd className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-white/40">
      {label}
    </dd>
  </div>
);

// Inline Google Pay mark — four-colour "G" + "Pay" (self-contained, no asset).
const GPayLogo: React.FC = () => (
  <span className="inline-flex items-center gap-1.5">
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
    <span className="text-sm font-semibold tracking-tight text-white/80">
      Google Pay
    </span>
  </span>
);

// ===========================================================================
// RESULT — editorial two-column: meta table + video
// ===========================================================================
const Result: React.FC<{ data: WrappedData }> = ({ data }) => {
  return (
    <div className="grid w-full items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ---- left: title + stat table + actions ---- */}
      <div className="mw-fade-up flex flex-col">
        <Eyebrow>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d98a]" /> Now playing
          </span>
        </Eyebrow>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
          @{data.handle}&apos;s
          <br />
          Money Wrapped
        </h1>
        <p className="mt-3 text-sm text-white/45">{data.periodLabel}</p>

        <dl className="mt-7 max-w-md border-t" style={{ borderColor: LINE }}>
          <Row label="Total spent" value={formatCompactINR(data.totalSent)} />
          <Row label="Transactions" value={data.txnCount.toLocaleString("en-IN")} />
          <Row label="People paid" value={data.uniquePayees.toLocaleString("en-IN")} />
          <Row label="Top person" value={data.topPayee.name} />
          <Row label="Your vibe" value={data.personality.title} />
        </dl>

        <p className="mt-7 flex items-center gap-1.5 text-xs text-white/40">
          <LockClosedIcon /> Plays right here · nothing leaves your device.
        </p>
      </div>

      {/* ---- right: the video ---- */}
      <div className="mw-fade-up flex justify-center lg:justify-start">
        <div
          className="w-[clamp(200px,46vh,320px)] overflow-hidden rounded-2xl border"
          style={{ borderColor: LINE, background: "#000" }}
        >
          <Player
            component={Main}
            inputProps={data}
            durationInFrames={DURATION_IN_FRAMES}
            fps={VIDEO_FPS}
            compositionHeight={VIDEO_HEIGHT}
            compositionWidth={VIDEO_WIDTH}
            style={{ width: "100%", display: "block" }}
            controls
            autoPlay
            loop
            initiallyMuted
          />
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className="flex items-baseline justify-between gap-6 border-b py-3"
    style={{ borderColor: LINE }}
  >
    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
      {label}
    </dt>
    <dd className="truncate text-right text-base font-bold">{value}</dd>
  </div>
);

// ===========================================================================
// REEL COVER — clean color-blocked title card (no grid, no scanline)
// ===========================================================================
const Cover: React.FC<{ busy: boolean }> = ({ busy }) => (
  <div
    className="relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden p-4"
    style={{ background: "linear-gradient(160deg,#16131F 0%,#0B0C12 60%)" }}
  >
    {/* masthead row */}
    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
      <span>Money Wrapped</span>
      <span>20:26</span>
    </div>

    {/* title block */}
    <div className="flex flex-col">
      <span
        className="text-3xl font-extrabold leading-[0.92] tracking-tight text-transparent"
        style={{ WebkitTextStroke: "1.4px #FFFDF5" }}
      >
        MONEY
      </span>
      <span
        className="text-3xl font-extrabold leading-[0.92] tracking-tight"
        style={{ color: AMBER }}
      >
        WRAPPED
      </span>
      <span className="mt-3 h-px w-10" style={{ background: "#FF5C46" }} />
    </div>

    {/* caption row */}
    <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
      <span>Your year</span>
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <span style={{ color: AMBER }}>45s reel</span>
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
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
    onClick={onClose}
  >
    <div
      className="mw-fade-up w-full max-w-lg rounded-2xl border p-7"
      style={{ background: PANEL, borderColor: LINE }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold">How to get your statement</h3>
          <p className="mt-1 text-sm text-white/45">From the Google Pay app</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-lg border text-white/70 transition-colors hover:text-white"
          style={{ borderColor: LINE }}
        >
          <Cross1Icon />
        </button>
      </div>

      <ol className="mt-6 flex flex-col gap-4">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
              style={{ background: AMBER, color: INK }}
            >
              {i + 1}
            </span>
            <span className="text-[15px] leading-relaxed text-white/75">{s}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={onClose}
        className="mt-7 w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: AMBER, color: INK }}
      >
        Got it
      </button>
    </div>
  </div>
);

export default Home;
