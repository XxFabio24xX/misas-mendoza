import { describe, expect, it } from "vitest";
import {
  TIPO_EVENTO_OPTIONS,
  tipoEventoColor,
  tipoEventoLabel,
} from "./eventos-tipos";

describe("tipoEventoLabel", () => {
  it("mapea cada slug del enum a su etiqueta visible", () => {
    expect(tipoEventoLabel("jovenes")).toBe("Jóvenes");
    expect(tipoEventoLabel("aviso")).toBe("Aviso");
    expect(tipoEventoLabel("retiro")).toBe("Retiro");
    expect(tipoEventoLabel("especial")).toBe("Especial");
  });

  it("devuelve el valor crudo si el slug es desconocido", () => {
    expect(tipoEventoLabel("otro")).toBe("otro");
  });
});

describe("tipoEventoColor", () => {
  it("tiene un color definido para cada opción del enum", () => {
    for (const { value } of TIPO_EVENTO_OPTIONS) {
      expect(tipoEventoColor(value)).not.toBe("");
    }
  });

  it("cae al color por defecto ante un slug desconocido", () => {
    expect(tipoEventoColor("otro")).toContain("tertiary");
  });
});
