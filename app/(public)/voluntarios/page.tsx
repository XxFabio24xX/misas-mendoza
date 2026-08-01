import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarHeart,
  Church,
  HandHeart,
  MapPinPlus,
  MessageCircleHeart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sumate como voluntario | Misas Mendoza",
  description:
    "Sumate como voluntario de Misas Mendoza y ayudá a mantener actualizados los horarios de misas de tu departamento. No hace falta saber de tecnología, lleva minutos por semana.",
  openGraph: {
    title: "Sumate como voluntario | Misas Mendoza",
    description:
      "Ayudá a mantener actualizados los horarios de misas de tu departamento. Es voluntario, sin fines de lucro y lleva minutos por semana.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const QUE_HACE = [
  {
    Icon: Church,
    titulo: "Mantener los horarios al día",
    texto:
      "Actualizás los horarios de las capillas de tu departamento cuando cambian de temporada o hay misas especiales.",
  },
  {
    Icon: MapPinPlus,
    titulo: "Cargar lo que falta",
    texto:
      "Sumás capillas o parroquias de tu zona que todavía no estén en el sitio.",
  },
  {
    Icon: CalendarHeart,
    titulo: "Difundir eventos",
    texto:
      "Publicás las fiestas patronales y celebraciones de tu comunidad para que más gente se entere.",
  },
];

const QUE_SABER = [
  "Lleva minutos por semana, no horas.",
  "No hace falta saber de tecnología: si usás WhatsApp, podés usar el panel.",
  "Cada voluntario cuida solo su departamento — no te comprometés con toda la provincia.",
  "Es 100% voluntario y sin fines de lucro, igual que todo el proyecto.",
];

const MAILTO =
  "mailto:soporte@misasmendoza.com.ar?subject=" +
  encodeURIComponent("Quiero ser voluntario");

export default function VoluntariosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
        ¿Querés formar parte?
      </h1>
      <p className="mt-3 text-on-surface-variant leading-relaxed">
        Los horarios de Misas Mendoza los mantienen voluntarios de cada
        departamento, en contacto directo con las parroquias de su zona.
        Buscamos más manos para cubrir toda la provincia.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-on-surface">
          Qué hace un voluntario
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {QUE_HACE.map(({ Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-xl border border-outline-variant/50 bg-secondary-container p-6"
            >
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
              <h3 className="mt-3 font-semibold text-on-surface">{titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                {texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-outline-variant/50 bg-secondary-container p-6 md:p-8">
        <h2 className="text-lg font-semibold text-on-surface">
          Lo que tenés que saber
        </h2>
        <ul className="mt-4 space-y-2.5">
          {QUE_SABER.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-sm leading-relaxed text-on-surface-variant"
            >
              <HandHeart
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 text-center">
        <MessageCircleHeart
          className="mx-auto h-8 w-8 text-primary"
          strokeWidth={1.5}
        />
        <h2 className="mt-3 text-lg font-semibold text-on-surface">
          Cómo sumarte
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Escribinos a{" "}
          <a
            href={MAILTO}
            className="font-medium text-primary hover:underline"
          >
            soporte@misasmendoza.com.ar
          </a>{" "}
          contando de qué departamento sos y, si querés, de qué parroquia
          participás.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            href={MAILTO}
            className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-on-primary shadow-md transition-colors hover:bg-primary-container"
          >
            Quiero ser voluntario
          </a>
          <Link
            href="/guia"
            className="text-sm font-medium text-primary hover:underline"
          >
            Mirá la guía del voluntario para ver cómo funciona el panel →
          </Link>
        </div>
      </section>

      <p className="mt-12 text-center text-sm text-on-surface-variant">
        Cargar horarios lleva minutos y le ahorra la búsqueda a mucha gente.
      </p>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        <Link href="/" className="font-medium text-primary hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
