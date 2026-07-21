import { ImageResponse } from "next/og";

export const alt = "Misas Mendoza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f2eee3",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Cruz dibujada con divs: el glyph ✝ cae a un emoji a color en
            satori/next-og e ignora el `color`, rompiendo la paleta. */}
        <div style={{ display: "flex", position: "relative", width: 90, height: 110 }}>
          <div
            style={{
              position: "absolute",
              left: 37,
              top: 0,
              width: 16,
              height: 110,
              background: "#476254",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 28,
              width: 70,
              height: 16,
              background: "#476254",
              borderRadius: 4,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 600,
            color: "#1c1c15",
            letterSpacing: "-0.02em",
          }}
        >
          Misas Mendoza
        </div>
        <div style={{ fontSize: 28, color: "#424844", marginTop: 8 }}>
          Horarios de misas y eventos católicos
        </div>
        <div style={{ fontSize: 20, color: "#727974", marginTop: 4 }}>
          Arquidiócesis de Mendoza · Argentina
        </div>
      </div>
    ),
    { ...size },
  );
}
