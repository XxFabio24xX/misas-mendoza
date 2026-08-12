"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { hrefConFiltrosCompartidos } from "@/lib/nav-filtros";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/mapa", label: "Mapa" },
  { href: "/acerca", label: "Acerca" },
  { href: "/contacto", label: "Contacto" },
];

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Inicio y Mapa arrastran ?dia=&horario= de la URL actual (sin
  // useSearchParams: se lee window.location.search recién al clickear, así
  // no hace falta envolver el nav global en Suspense).
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href !== "/" && href !== "/mapa") return;
    const destino = hrefConFiltrosCompartidos(href);
    if (destino === href) return;
    e.preventDefault();
    router.push(destino);
  }

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {navLinks.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleClick(e, href)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 hover:text-primary ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/voluntarios"
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-on-primary shadow-md transition-colors hover:bg-primary-container"
      >
        Sumate
      </Link>
    </nav>
  );
}
