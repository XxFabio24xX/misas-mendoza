import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, toIcsDate } from "./ics";

describe("escapeIcsText", () => {
  it("escapa los caracteres reservados de RFC 5545", () => {
    expect(escapeIcsText("a;b,c\\d")).toBe("a\\;b\\,c\\\\d");
    expect(escapeIcsText("línea 1\nlínea 2")).toBe("línea 1\\nlínea 2");
    expect(escapeIcsText("línea 1\r\nlínea 2")).toBe("línea 1\\nlínea 2");
  });
});

describe("toIcsDate", () => {
  it("convierte ISO a formato básico UTC", () => {
    expect(toIcsDate("2026-07-18T22:00:00+00:00")).toBe("20260718T220000Z");
    expect(toIcsDate("2026-07-18T19:00:00-03:00")).toBe("20260718T220000Z");
  });
});

describe("buildIcs", () => {
  const base = {
    uid: "ejemplo@misas-mendoza",
    titulo: "Retiro de Cuaresma",
    inicio: "2026-07-18T22:00:00+00:00",
  };

  it("genera un VCALENDAR válido con los campos obligatorios", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:ejemplo@misas-mendoza");
    expect(ics).toContain("DTSTART:20260718T220000Z");
    expect(ics).toContain("SUMMARY:Retiro de Cuaresma");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics.split("\r\n").length).toBeGreaterThan(5);
  });

  it("asume una hora de duración si no hay fecha de fin", () => {
    expect(buildIcs(base)).toContain("DTEND:20260718T230000Z");
  });

  it("usa la fecha de fin cuando existe", () => {
    expect(buildIcs({ ...base, fin: "2026-07-19T02:00:00+00:00" })).toContain(
      "DTEND:20260719T020000Z",
    );
  });

  it("omite DESCRIPTION/LOCATION cuando no hay datos", () => {
    const ics = buildIcs(base);
    expect(ics).not.toContain("DESCRIPTION:");
    expect(ics).not.toContain("LOCATION:");
  });

  it("escapa el contenido de los campos de texto", () => {
    const ics = buildIcs({ ...base, ubicacion: "Parroquia X; Godoy Cruz, Mendoza" });
    expect(ics).toContain("LOCATION:Parroquia X\\; Godoy Cruz\\, Mendoza");
  });
});
