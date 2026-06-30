import type { Metadata } from "next";
import { PageShell } from "../../components/site";
import { PageHeader, Section, Updated } from "../../components/prose";

export const metadata: Metadata = {
  title: "How it works — MoneyUnwrapped",
  description:
    "The architecture behind MoneyUnwrapped: a 100% client-side pipeline from PDF to a rendered recap video, with no server involved.",
};

const STEPS = [
  {
    n: "01",
    title: "You pick a PDF",
    body: "Your Google Pay statement is selected from your device. The file handle stays in the browser — the upload control never posts it anywhere.",
  },
  {
    n: "02",
    title: "Text extraction (pdf.js)",
    body: "Mozilla's pdf.js reads the PDF inside a Web Worker and pulls out the raw text of every page. Runs fully in the tab.",
  },
  {
    n: "03",
    title: "Parsing → transactions",
    body: "A regex-based parser walks the text, splitting it into individual transactions: date, time, payee, amount, direction, and the funding account printed on each line.",
  },
  {
    n: "04",
    title: "Analytics → your story",
    body: "Pure functions aggregate the transactions into totals, top people, an account split, time-of-day patterns, a money personality, and more.",
  },
  {
    n: "05",
    title: "Render (Remotion Player)",
    body: "That data drives a Remotion composition — a sequence of animated scenes — rendered live in the browser as a 60-second vertical reel.",
  },
];

// Mirrors derivePersonality() in src/lib/analytics.ts — evaluated top to
// bottom, first match wins.
const PERSONAS = [
  {
    title: "The Tap-Tap Champion",
    rule: "8 or more payments per active day",
    blurb: "Your thumb deserves its own bank account.",
  },
  {
    title: "The Points Hunter",
    rule: "50%+ of spend on a credit card",
    blurb: "Why pay with cash when rewards exist?",
  },
  {
    title: "The Chai Economist",
    rule: "60%+ of payments are under ₹100",
    blurb: "Tiny payments, mighty habit — a few rupees at a time.",
  },
  {
    title: "The Midnight Spender",
    rule: "30%+ of activity between 9 PM and 4 AM",
    blurb: "The best deals happen after dark, apparently.",
  },
  {
    title: "The Loyal Regular",
    rule: "40%+ of spend goes to one favourite payee",
    blurb: "You found your people and you pay them. Often.",
  },
  {
    title: "The Balanced Baller",
    rule: "Everyone else — no single trait dominates",
    blurb: "A little here, a little there. Smooth operator.",
  },
];

const STACK = [
  ["Next.js + React", "App shell, routing, UI"],
  ["pdf.js", "In-browser PDF text extraction"],
  ["Remotion", "Programmatic video, played client-side"],
  ["Tailwind CSS", "Styling + the light/dark theme"],
  ["Zod", "Schema for the video's input props"],
  ["TypeScript", "End-to-end type safety"],
];

export default function ArchitecturePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="How it works"
        title="A recap video, built entirely in your browser."
        lead="MoneyUnwrapped has no backend. From the moment you pick a PDF to the final rendered reel, every step runs locally on your device."
      />

      <Section title="The pipeline">
        <div className="mt-2 flex flex-col">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex gap-4">
              {/* rail */}
              <div className="flex flex-col items-center">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-black"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                  }}
                >
                  {s.n}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className="my-1 w-px flex-1"
                    style={{ background: "var(--line)" }}
                  />
                )}
              </div>
              <div className="pb-7">
                <h3 className="text-base font-bold tracking-tight">{s.title}</h3>
                <p
                  className="mt-1 text-[15px] leading-relaxed"
                  style={{ color: "var(--fg-3)" }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How your money personality is decided">
        <p>
          The recap ends by naming your spending archetype. There&apos;s no AI
          and no guesswork — just a handful of transparent rules checked in
          order. The <strong>first one that matches wins</strong>, so the list
          below runs top to bottom.
        </p>
        <div className="mt-4 flex flex-col">
          {PERSONAS.map((p, i) => (
            <div
              key={p.title}
              className="flex items-start gap-4 border-b py-3.5 last:border-b-0"
              style={{ borderColor: "var(--line)" }}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black"
                style={{
                  background: "var(--panel-2)",
                  color: "var(--fg-2)",
                }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-[15px] font-bold">{p.title}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-text)" }}
                  >
                    {p.rule}
                  </span>
                </div>
                <p
                  className="mt-0.5 text-sm leading-relaxed"
                  style={{ color: "var(--fg-3)" }}
                >
                  {p.blurb}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Why no server?">
        <p>
          Bank statements are sensitive. The simplest way to guarantee your data
          is safe is to never transmit it. Because the whole pipeline is
          client-side, there is no database to breach, no logs to leak, and
          nothing for us to see. Privacy isn&apos;t a policy here — it&apos;s the
          architecture.
        </p>
      </Section>

      <Section title="The stack">
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {STACK.map(([name, what]) => (
            <div
              key={name}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--line)", background: "var(--panel)" }}
            >
              <div className="text-sm font-bold">{name}</div>
              <div className="mt-0.5 text-xs" style={{ color: "var(--fg-3)" }}>
                {what}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Updated date="29 June 2026" />
    </PageShell>
  );
}
