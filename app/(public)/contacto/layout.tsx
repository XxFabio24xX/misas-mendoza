import type { Metadata } from "next";

// La página de contacto es un Client Component y no puede exportar metadata;
// este layout la aporta.
export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Mandanos una sugerencia o avisanos si encontraste un horario de misa desactualizado en Misas Mendoza.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
