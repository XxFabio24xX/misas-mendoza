import { describe, expect, it } from "vitest";
import { displayToISO, isoToDisplay } from "./date-dmy";

describe("isoToDisplay", () => {
  it("convierte ISO a DD/MM/AAAA", () => {
    expect(isoToDisplay("2026-07-14")).toBe("14/07/2026");
    expect(isoToDisplay("2026-07-14T10:30:00")).toBe("14/07/2026");
  });

  it("devuelve vacío ante entradas inválidas", () => {
    expect(isoToDisplay("")).toBe("");
    expect(isoToDisplay("14/07/2026")).toBe("");
  });
});

describe("displayToISO", () => {
  it("convierte DD/MM/AAAA a ISO", () => {
    expect(displayToISO("14/07/2026")).toBe("2026-07-14");
    expect(displayToISO("01/01/2000")).toBe("2000-01-01");
  });

  it("rechaza fechas que no existen en el calendario", () => {
    expect(displayToISO("31/02/2026")).toBe("");
    expect(displayToISO("32/01/2026")).toBe("");
    expect(displayToISO("29/02/2027")).toBe(""); // no bisiesto
  });

  it("acepta el 29 de febrero en años bisiestos", () => {
    expect(displayToISO("29/02/2028")).toBe("2028-02-29");
  });

  it("devuelve vacío si el formato no es DD/MM/AAAA completo", () => {
    expect(displayToISO("14/07/26")).toBe("");
    expect(displayToISO("2026-07-14")).toBe("");
    expect(displayToISO("")).toBe("");
  });
});
