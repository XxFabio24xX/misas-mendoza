"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/mapa", label: "Mapa" },
  { href: "/acerca", label: "Acerca" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {navLinks.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
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
    </nav>
  );
}
