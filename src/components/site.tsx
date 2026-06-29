"use client";

import {
  GitHubLogoIcon,
  HeartFilledIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { GITHUB_PROFILE_URL, GITHUB_USER } from "../lib/site-config";
import { useTheme } from "../lib/theme";

export const NAV = [
  { href: "/architecture", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const BrandMark: React.FC = () => (
  <span className="flex items-center gap-3 text-left">
    <span
      className="grid h-9 w-9 place-items-center rounded-md text-sm font-black"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
    >
      M
    </span>
    <span className="flex flex-col leading-none">
      <span className="text-[15px] font-extrabold tracking-tight">
        Money Wrapped
      </span>
      <span
        className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.22em] sm:block"
        style={{ color: "var(--fg-4)" }}
      >
        Payments, in review
      </span>
    </span>
  </span>
);

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light / dark theme"
      title="Toggle theme"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors"
      style={{ borderColor: "var(--line)", color: "var(--fg-2)" }}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export const SiteHeader: React.FC<{
  onBrandClick?: () => void;
  extraRight?: React.ReactNode;
}> = ({ onBrandClick, extraRight }) => (
  <header
    className="flex shrink-0 items-center justify-between gap-3 border-b py-4 sm:py-5"
    style={{ borderColor: "var(--line)" }}
  >
    {onBrandClick ? (
      <button onClick={onBrandClick} className="shrink-0">
        <BrandMark />
      </button>
    ) : (
      <Link href="/" className="shrink-0">
        <BrandMark />
      </Link>
    )}

    <div className="flex items-center gap-2 sm:gap-4">
      <nav
        className="hidden items-center gap-5 text-xs font-semibold sm:flex"
        style={{ color: "var(--fg-3)" }}
      >
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="transition-opacity hover:opacity-70"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {extraRight}
      <ThemeToggle />
    </div>
  </header>
);

export const SiteFooter: React.FC = () => (
  <footer
    className="flex shrink-0 flex-col items-center gap-3 border-t py-5 text-xs"
    style={{ borderColor: "var(--line)", color: "var(--fg-3)" }}
  >
    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-medium">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className="transition-opacity hover:opacity-70"
        >
          {n.label}
        </Link>
      ))}
    </nav>
    <div className="flex items-center gap-1.5">
      <span>Made with</span>
      <HeartFilledIcon style={{ color: "var(--coral)" }} />
      <span>by</span>
      <a
        href={GITHUB_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--fg-2)" }}
      >
        <GitHubLogoIcon /> {GITHUB_USER}
      </a>
    </div>
  </footer>
);

// Wrapper for content pages (privacy / terms / architecture).
export const PageShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
    <SiteHeader />
    <main className="flex-1 py-10 sm:py-14">{children}</main>
    <SiteFooter />
  </div>
);

// Inline Google Pay mark — four-colour "G" + wordmark (self-contained).
export const GPayLogo: React.FC = () => (
  <span className="inline-flex items-center gap-1.5">
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
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
    <span
      className="text-sm font-semibold tracking-tight"
      style={{ color: "var(--fg-2)" }}
    >
      Google Pay
    </span>
  </span>
);
