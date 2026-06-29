import type React from "react";

export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  lead: string;
}> = ({ eyebrow, title, lead }) => (
  <header className="border-b pb-8" style={{ borderColor: "var(--line)" }}>
    <div
      className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
      style={{ color: "var(--fg-3)" }}
    >
      <span className="h-px w-8" style={{ background: "var(--accent)" }} />
      {eyebrow}
    </div>
    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
      {title}
    </h1>
    <p
      className="mt-3 text-base leading-relaxed"
      style={{ color: "var(--fg-3)" }}
    >
      {lead}
    </p>
  </header>
);

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="mt-9">
    <h2 className="text-lg font-bold tracking-tight">{title}</h2>
    <div
      className="mt-2 space-y-3 text-[15px] leading-relaxed"
      style={{ color: "var(--fg-2)" }}
    >
      {children}
    </div>
  </section>
);

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="rounded-xl border p-5"
    style={{ borderColor: "var(--line)", background: "var(--panel)" }}
  >
    {children}
  </div>
);

export const Updated: React.FC<{ date: string }> = ({ date }) => (
  <p className="mt-10 text-xs" style={{ color: "var(--fg-4)" }}>
    Last updated · {date}
  </p>
);
