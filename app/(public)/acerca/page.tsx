import type { Metadata } from "next";
import Link from "next/link";
import { Church, HandHeart, MapPin, Users } from "lucide-react";
import { AnimatedCounter } from "@/app/components/animated-counter";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Acerca de Misas Mendoza",
  description:
    "Conocé el proyecto detrás de Misas Mendoza — una plataforma gratuita para encontrar horarios de misas y celebraciones católicas en Mendoza, Argentina.",
  openGraph: {
    title: "Acerca de Misas Mendoza",
    description: "Una plataforma gratuita al servicio de la comunidad católica de Mendoza.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default async function AcercaPage() {
  const [{ count: totalCapillas }, { count: totalHorarios }] = await Promise.all([
    supabaseAdmin
      .from("lugares")
      .select("*", { count: "exact", head: true })
      .eq("activo", true),
    supabaseAdmin.from("horarios").select("*", { count: "exact", head: true }),
  ]);

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
          <h2 className="mt-3 font-semibold text-on-surface">Al servicio de las capillas de Mendoza</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
            Gratuito y sin fines de lucro, este proyecto está al servicio de
            los voluntarios que sostienen cada capilla y parroquia de la
            provincia — con la idea de sumar cada vez más manos para cuidar
            los datos de su zona.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-on-surface">En números</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5 text-center">
            <p className="text-2xl font-bold text-primary md:text-3xl">
              <AnimatedCounter target={totalCapillas ?? 84} suffix="+" />
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Capillas</p>
          </div>
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5 text-center">
            <p className="text-2xl font-bold text-primary md:text-3xl">
              <AnimatedCounter target={9} suffix="+" />
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Departamentos</p>
          </div>
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5 text-center">
            <p className="text-2xl font-bold text-primary md:text-3xl">
              <AnimatedCounter target={totalHorarios ?? 500} suffix="+" duration={2200} />
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Horarios de misa</p>
          </div>
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5 text-center">
            <p className="text-2xl font-bold text-primary md:text-3xl">
              <AnimatedCounter target={100} suffix="%" />
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">Gratuito</p>
          </div>
        </div>
      </section>

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
