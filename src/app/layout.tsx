import { Metadata, Viewport } from "next";
import "../../styles/global.css";
import { SITE_URL } from "../lib/site-config";
import { ThemeProvider } from "../lib/theme";

const TITLE = "MoneyUnwrapped — your payments, unwrapped";
const DESCRIPTION =
  "Turn your Google Pay statement into a cinematic 60-second recap video. Runs entirely in your browser — your statement never leaves your device.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — MoneyUnwrapped",
  },
  description: DESCRIPTION,
  applicationName: "MoneyUnwrapped",
  keywords: [
    "MoneyUnwrapped",
    "Money Unwrapped",
    "Google Pay statement",
    "spending recap",
    "year in payments",
    "UPI statement",
    "payments unwrapped",
    "spending unwrapped video",
    "GPay statement to video",
  ],
  authors: [{ name: "Shubham", url: "https://github.com/10shubham01" }],
  creator: "Shubham",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MoneyUnwrapped",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0D" },
    { media: "(prefers-color-scheme: light)", color: "#F6F4EE" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0B0D" }} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
