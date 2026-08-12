"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Home, Info, Map as MapIcon, User } from "lucide-react";
import { hrefConFiltrosCompartidos } from "@/lib/nav-filtros";

const links = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/eventos", label: "Eventos", Icon: Calendar },
  { href: "/mapa", label: "Mapa", Icon: MapIcon },
  { href: "/acerca", label: "Acerca", Icon: Info },
  { href: "/login", label: "Perfil", Icon: User },
];

export function BottomNav() {
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

  // z-1100: por encima de los panes de Leaflet (llegan a ~1000), si no el
  // mapa de "Cómo llegar" tapa la barra al scrollear.
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-1100 h-20 rounded-t-xl border-t border-outline-variant/20 bg-surface-container shadow-[0_-4px_24px_rgba(118,146,131,0.06)] md:hidden">
      <div className="flex h-full items-center justify-around px-4 pb-safe">
        {links.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-90 ${
                isActive
                  ? "rounded-full bg-primary-container/20 px-4 py-1 text-primary"
                  : "p-2 text-on-surface-variant hover:text-primary"
              }`}
            >
              <Icon
                className="h-5 w-5"
                {...(isActive
                  ? { strokeWidth: 2.5 }
                  : { strokeWidth: 1.75 })}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
