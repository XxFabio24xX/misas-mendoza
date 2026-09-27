import type { Metadata } from "next";

// La página de eventos es un Client Component y no puede exportar metadata;
// este layout la aporta. /eventos/[slug] define su propia canónica.
export const metadata: Metadata = {
  title: "Eventos católicos en Mendoza",
  description:
    "Fiestas patronales, retiros, misas especiales y actividades de las parroquias y capillas de Mendoza.",
  alternates: { canonical: "/eventos" },
};

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
