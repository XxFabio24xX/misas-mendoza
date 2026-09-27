import Link from "next/link";
import { slugDepartamento } from "@/lib/departamentos";

// Se renderiza en el servidor (desde app/(public)/page.tsx): el h1 es el LCP de
// la home y los links por departamento son los enlaces internos que Google ve
// sin ejecutar JavaScript. Van acá y no debajo del listado porque el listado
// cambia de altura mientras carga y los haría saltar (CLS).
export default function HeroBanner({ departamentos = [] }: { departamentos?: string[] }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-secondary-container px-6 py-8 md:px-10 md:py-9">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5" />

      <h1 className="relative z-10 text-2xl font-semibold text-on-surface md:text-3xl">
        Horarios de misa en Mendoza
      </h1>
      <p className="relative z-10 mt-2 max-w-lg text-sm text-on-surface-variant md:text-base">
        Encontrá la misa más cercana: horarios de parroquias, capillas y
        santuarios de tu comunidad, todo en un solo lugar.
      </p>

      {departamentos.length > 0 && (
        <nav
          aria-label="Horarios por departamento"
          className="relative z-10 mt-4 text-sm text-on-surface-variant"
        >
          <span>Por departamento: </span>
          {departamentos.map((dep, i) => (
            <span key={dep}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              <Link
                href={`/capillas/${slugDepartamento(dep)}`}
                className="font-medium text-primary hover:underline"
              >
                {dep}
              </Link>
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
