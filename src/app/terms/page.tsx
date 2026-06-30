import type { Metadata } from "next";
import { PageShell } from "../../components/site";
import { PageHeader, Section, Updated } from "../../components/prose";
import {
  GITHUB_REPO_LABEL,
  GITHUB_REPO_URL,
} from "../../lib/site-config";

export const metadata: Metadata = {
  title: "Terms — MoneyUnwrapped",
  description:
    "Terms of use for MoneyUnwrapped — a free, personal, client-side tool. Provided as-is, not affiliated with Google.",
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Terms"
        title="The short version."
        lead="MoneyUnwrapped is a free, personal project. By using it you agree to the simple terms below."
      />

      <Section title="Personal use">
        <p>
          MoneyUnwrapped is provided for personal, non-commercial use — to turn
          your own payment statement into a fun recap. Please don&apos;t use it
          to process other people&apos;s financial data without their consent.
        </p>
      </Section>

      <Section title="Provided “as is”">
        <p>
          The tool is offered without warranties of any kind. Parsing is
          best-effort: statement formats change, and totals or categories may be
          approximate. Always treat the numbers as a playful summary and verify
          anything important against your official statement.
        </p>
      </Section>

      <Section title="Not affiliated with Google">
        <p>
          MoneyUnwrapped is an independent project. &ldquo;Google Pay&rdquo; and
          the Google Pay logo are trademarks of Google LLC. This project is not
          created, endorsed, sponsored by, or affiliated with Google.
        </p>
      </Section>

      <Section title="Your responsibility">
        <p>
          You are responsible for the files you choose to process and for
          keeping your device secure. Since everything runs locally, the safety
          of your data is, quite literally, in your hands.
        </p>
      </Section>

      <Section title="Open source">
        <p>
          The code is available at{" "}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: "var(--accent-text)" }}
          >
            {GITHUB_REPO_LABEL}
          </a>
          . Contributions and issues are welcome.
        </p>
      </Section>

      <Updated date="29 June 2026" />
    </PageShell>
  );
}
