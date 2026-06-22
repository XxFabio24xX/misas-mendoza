"use client";

import { usePathname } from "next/navigation";
import { Calendar, Home, User } from "lucide-react";

const links = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/eventos", label: "Eventos", Icon: Calendar },
  { href: "/login", label: "Perfil", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 rounded-t-xl border-t border-outline-variant/20 bg-surface-container shadow-[0_-4px_24px_rgba(118,146,131,0.06)] md:hidden">
      <div className="flex h-full items-center justify-around px-4 pb-safe">
        {links.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <a
              key={href}
              href={href}
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
            </a>
          );
        })}
      </div>
    </nav>
  );
}
