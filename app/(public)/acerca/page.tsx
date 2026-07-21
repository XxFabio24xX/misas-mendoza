import type { Metadata } from "next";
import Link from "next/link";
import { Church, HandHeart, MapPin, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Acerca del proyecto",
  description:
    "Qué es Misas Mendoza, quiénes lo mantienen y cómo colaborar para que los horarios de misa estén siempre al día.",
};

export default function AcercaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
        Acerca de Misas Mendoza
      </h1>
      <p className="mt-3 text-on-surface-variant leading-relaxed">
        Misas Mendoza nació para responder una pregunta simple: <em>¿a qué hora
        hay misa cerca mío?</em> Reunimos en un solo lugar los horarios de
        misas, parroquias, capillas y eventos católicos de Mendoza, para que
        cualquier persona los encuentre en segundos desde el celular.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-6">
          <Church className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold text-on-surface">Datos reales y al día</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            Los horarios los cargan y mantienen voluntarios de cada
            departamento, en contacto directo con las parroquias.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-6">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold text-on-surface">Pensado para encontrar</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            Buscá por cercanía, día y horario, guardá tus capillas favoritas y
            compartí los horarios por WhatsApp.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-6">
          <HandHeart className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold text-on-surface">Comunidad</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            Señalamos qué capillas reciben donaciones para Cáritas y difundimos
            los eventos de la comunidad católica mendocina.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-semibold text-on-surface">Hecho a pulmón</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            El proyecto es gratuito y sin fines de lucro. Fue creado y es
            mantenido por un voluntario, con la esperanza de sumar más
            manos para cuidar los datos de cada zona.
          </p>
        </div>
      </div>

      <section className="mt-12 rounded-xl bg-secondary-container p-6 md:p-8">
        <h2 className="text-lg font-semibold text-on-surface">¿Querés colaborar?</h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Si encontraste un horario desactualizado, conocés una capilla que no
          está en el sitio, o querés sumarte como voluntario para mantener los
          datos de tu departamento, escribinos. Toda ayuda suma: cargar
          horarios lleva minutos y le ahorra la búsqueda a mucha gente.
        </p>
        <Link href="/contacto" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Escribinos →
        </Link>
      </section>

      <p className="mt-10 text-center text-sm text-on-surface-variant">
        <Link href="/" className="font-medium text-primary hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
