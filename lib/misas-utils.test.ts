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
  ];

  it("devuelve la misa de hoy si todavía no pasó", () => {
    // 2026-07-15 es miércoles
    expect(findNextMisa(horarios, { ahora: new Date(2026, 6, 15, 8, 0) })).toBe("Hoy, 19:15");
  });

  it("saltea la misa de hoy si ya pasó la hora", () => {
    // miércoles 20:00 → la de las 19:15 ya fue → domingo
    expect(findNextMisa(horarios, { ahora: new Date(2026, 6, 15, 20, 0) })).toBe("Dom, 10:00");
  });

  it("salta al próximo día con misa en la misma semana", () => {
    // 2026-07-13 es lunes → próxima es miércoles
    expect(findNextMisa(horarios, { ahora: new Date(2026, 6, 13, 8, 0) })).toBe("Mié, 19:15");
  });

  it("da la vuelta a la semana si no queda ninguna", () => {
    // 2026-07-16 es jueves → la próxima es el domingo
    expect(findNextMisa(horarios, { ahora: new Date(2026, 6, 16, 8, 0) })).toBe("Dom, 10:00");
  });

  it("devuelve el guion si no hay horarios", () => {
    expect(findNextMisa([])).toBe("—");
    expect(findNextMisa([{ dia_semana: null, hora: "17:00:00" }])).toBe("—");
  });

  it("filtra por la temporada vigente de la capilla", () => {
    const estacionales = [
      { dia_semana: 0, hora: "19:00:00", temporada: "Invierno" },
      { dia_semana: 0, hora: "20:00:00", temporada: "Verano" },
      { dia_semana: 0, hora: "10:00:00", temporada: "Todo el año" },
    ];
    const domingo = new Date(2026, 6, 19, 15, 0); // domingo a la tarde
    expect(findNextMisa(estacionales, { ahora: domingo, temporadaActual: "Invierno" })).toBe(
      "Hoy, 19:00",
    );
    expect(findNextMisa(estacionales, { ahora: domingo, temporadaActual: "Verano" })).toBe(
      "Hoy, 20:00",
    );
    // Sin temporada definida no se oculta nada (la más próxima gana).
    expect(findNextMisa(estacionales, { ahora: domingo })).toBe("Hoy, 19:00");
  });

  it("incluye misas mensuales fijas en la fecha concreta", () => {
    const mensual = [{ dia_semana: null, dia_mes: 11, hora: "17:00:00" }];
    // 2026-07-08 → el 11 de julio cae sábado
    expect(findNextMisa(mensual, { ahora: new Date(2026, 6, 8, 9, 0) })).toBe("Sáb, 17:00");
  });

  it("la mensual con reemplaza_dia cancela las misas normales de ese día", () => {
    const conReemplazo = [
      { dia_semana: 6, hora: "10:00:00" }, // sábado normal
      { dia_semana: null, dia_mes: 11, hora: "17:00:00", reemplaza_dia: true },
    ];
    // Sábado 2026-07-11 a las 8: la de las 10 queda cancelada → 17:00
    expect(findNextMisa(conReemplazo, { ahora: new Date(2026, 6, 11, 8, 0) })).toBe("Hoy, 17:00");
    // El sábado siguiente (18) no hay reemplazo → 10:00
    expect(findNextMisa(conReemplazo, { ahora: new Date(2026, 6, 18, 8, 0) })).toBe("Hoy, 10:00");
  });

  it("la mensual sin reemplaza_dia convive con las misas del día", () => {
    const sinReemplazo = [
      { dia_semana: 6, hora: "10:00:00" },
      { dia_semana: null, dia_mes: 11, hora: "07:00:00", reemplaza_dia: false },
    ];
    // Sábado 11 a las 6: la mensual de las 7 es la más próxima
    expect(findNextMisa(sinReemplazo, { ahora: new Date(2026, 6, 11, 6, 0) })).toBe("Hoy, 07:00");
  });
});
