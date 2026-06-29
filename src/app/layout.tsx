import { Metadata, Viewport } from "next";
import "../../styles/global.css";

export const metadata: Metadata = {
  title: "Money Wrapped — your payments, wrapped",
  description:
    "Turn your payment-app statement into a fun, shareable 45-second recap video. Runs entirely in your browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0B0D" }}>{children}</body>
    </html>
  );
}
