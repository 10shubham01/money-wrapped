import type { Metadata } from "next";
import { PageShell } from "../../components/site";
import { PageHeader, Section, Updated } from "../../components/prose";
import { CONTACT_EMAIL } from "../../lib/site-config";

export const metadata: Metadata = {
  title: "Privacy — Money Wrapped",
  description:
    "Money Wrapped runs entirely in your browser. Your statement is never uploaded, stored, or tracked.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        title="Your data never leaves your device."
        lead="Money Wrapped is built privacy-first. There is no server that sees your statement — everything happens locally, in the browser tab in front of you."
      />

      <Section title="No upload, ever">
        <p>
          When you pick a PDF, the file is read directly in your browser&apos;s
          memory. The text is extracted and analysed on your machine. Your
          statement is <strong>never sent to any server</strong> — there is no
          backend to receive it.
        </p>
      </Section>

      <Section title="No accounts, no tracking">
        <p>
          There&apos;s no sign-up and no login. We don&apos;t use cookies,
          analytics, advertising pixels, or any third-party trackers. We
          don&apos;t know who you are, and we&apos;d like to keep it that way.
        </p>
      </Section>

      <Section title="Nothing is stored">
        <p>
          Your transactions live only in the page&apos;s memory for the current
          session. Refresh or close the tab and they&apos;re gone. The only
          thing saved on your device is your theme choice (a single{" "}
          <code>localStorage</code> value, <code>mw-theme</code>) — never any
          financial data.
        </p>
      </Section>

      <Section title="The recap video">
        <p>
          The video is generated and played locally using Remotion, right inside
          the browser. The preview is never uploaded anywhere. Cloud rendering
          and downloads are currently disabled.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Money Wrapped is open and built in the open. If something here
          isn&apos;t clear, reach out at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold underline"
            style={{ color: "var(--accent-text)" }}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Updated date="29 June 2026" />
    </PageShell>
  );
}
