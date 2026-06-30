import { ImageResponse } from "next/og";

export const alt = "MoneyUnwrapped — your payments, unwrapped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand-matched social card: dark canvas, amber "M" badge, kinetic wordmark.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0A0B0D",
          color: "#FFFDF5",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "#FFC93C",
              color: "#0A0B0D",
              fontSize: 60,
              fontWeight: 900,
            }}
          >
            M
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#8A8C94",
            }}
          >
            Payments, in review
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          <span>Your&nbsp;</span>
          <span style={{ color: "#FFC93C" }}>money</span>
          <span>,</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          unwrapped.
        </div>

        <div style={{ display: "flex", width: 110, height: 8, marginTop: 28, background: "#FF5C46" }} />

        <div style={{ display: "flex", marginTop: 26, fontSize: 32, color: "#C9CAD0", maxWidth: 880 }}>
          A cinematic 60-second recap of your year in payments — built right in your browser.
        </div>
      </div>
    ),
    { ...size },
  );
}
