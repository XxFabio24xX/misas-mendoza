import { afterEach, describe, expect, it, vi } from "vitest";
import {
  findNextMisa,
  formatDistancia,
  horaEnFranja,
  normalizeText,
} from "./misas-utils";

describe("horaEnFranja", () => {
  it("clasifica los límites exactos de cada franja", () => {
    expect(horaEnFranja("08:00:00", "manana")).toBe(true);
    expect(horaEnFranja("11:59:59", "manana")).toBe(true);
    expect(horaEnFranja("12:00:00", "manana")).toBe(false);
    expect(horaEnFranja("12:00:00", "tarde")).toBe(true);
    expect(horaEnFranja("18:59:00", "tarde")).toBe(true);
    expect(horaEnFranja("19:00:00", "tarde")).toBe(false);
    expect(horaEnFranja("19:00:00", "noche")).toBe(true);
    expect(horaEnFranja("23:59:59", "noche")).toBe(true);
    expect(horaEnFranja("00:00:00", "manana")).toBe(true);
  });
});

describe("normalizeText", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizeText("Señora")).toBe("senora");
    expect(normalizeText("Apóstol")).toBe("apostol");
    expect(normalizeText("GUAYMALLÉN")).toBe("guaymallen");
  });

  it("no altera texto sin diacríticos", () => {
    expect(normalizeText("loreto 123")).toBe("loreto 123");
  });
});

describe("formatDistancia", () => {
  it("usa metros bajo el kilómetro y km con un decimal arriba", () => {
    expect(formatDistancia(306)).toBe("306m");
    expect(formatDistancia(999)).toBe("999m");
    expect(formatDistancia(1000)).toBe("1.0km");
    expect(formatDistancia(1234)).toBe("1.2km");
  });
});

describe("findNextMisa", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const horarios = [
    { dia_semana: 0, hora: "10:00:00" }, // domingo
    { dia_semana: 3, hora: "19:15:00" }, // miércoles
    { dia_semana: null, hora: "17:00:00" }, // mensual: se ignora
  ];

  it("devuelve la misa de hoy si existe", () => {
    // 2026-07-15 es miércoles
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 8, 0, 0));
    expect(findNextMisa(horarios)).toBe("Hoy, 19:15");
  });

  it("salta al próximo día con misa en la misma semana", () => {
    // 2026-07-13 es lunes → próxima es miércoles
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 13, 8, 0, 0));
    expect(findNextMisa(horarios)).toBe("Mié, 19:15");
  });

  it("da la vuelta a la semana si no queda ninguna", () => {
    // 2026-07-16 es jueves → la próxima es el domingo (primer día ordenado)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16, 8, 0, 0));
    expect(findNextMisa(horarios)).toBe("Dom, 10:00");
  });

  it("devuelve el guion si no hay horarios semanales", () => {
    expect(findNextMisa([])).toBe("—");
    expect(findNextMisa([{ dia_semana: null, hora: "17:00:00" }])).toBe("—");
  });
});
