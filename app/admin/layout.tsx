"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Church,
  Calendar,
  LogOut,
  Inbox,
  User,
  Home,
  Users,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/app/components/theme-toggle";

type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "super_admin" | "admin_departamento" | "editor";
  departamento_asignado: string | null;
  activo: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  tooltip?: string;
};

const superAdminNavItems: NavItem[] = [
  { href: "/admin", label: "Inicio del Panel", icon: LayoutDashboard },
  { href: "/admin/capillas", label: "Capillas", icon: Church },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  {
    href: "/admin/voluntarios",
    label: "Voluntarios",
    icon: Users,
    tooltip: "Gestión de usuarios y asignación de roles. Visible solo para Super Admin.",
  },
  {
    href: "/admin/solicitudes",
    label: "Solicitudes",
    icon: Inbox,
    tooltip: "Pedidos de alta, baja y edición enviados por los editores.",
  },
];

const adminDepartamentoNavItems: NavItem[] = [
  { href: "/admin", label: "Inicio del Panel", icon: LayoutDashboard },
  { href: "/admin/capillas", label: "Capillas", icon: Church },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  {
    href: "/admin/solicitudes",
    label: "Solicitudes",
    icon: Inbox,
    tooltip: "Pedidos de alta, baja y edición de tu departamento.",
  },
];

const editorNavItems: NavItem[] = [
  { href: "/admin", label: "Inicio del Panel", icon: LayoutDashboard },
  { href: "/admin/capillas", label: "Capillas", icon: Church },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
];

const mobileTabs = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/capillas", label: "Capillas", icon: Church },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        if (!(data as Perfil).activo) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }
        setPerfil(data as Perfil);
      }
      setLoading(false);
    })();
  }, [router]);

  // Contador para el badge de Solicitudes (RLS ya escopea: super_admin ve
  // todas, admin_departamento solo las de su departamento).
  // Se refresca en cada navegación para reflejar solicitudes resueltas/nuevas.
  useEffect(() => {
    if (perfil?.rol !== "super_admin" && perfil?.rol !== "admin_departamento") return;
    supabase
      .from("solicitudes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "pendiente")
      .then(({ count }) => setPendientes(count ?? 0));
  }, [perfil, pathname]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  // Auto-logout por inactividad — 4hs de balance entre seguridad y UX para
  // voluntarios que dejan el panel abierto mientras trabajan.
  useEffect(() => {
    const INACTIVIDAD_MS = 4 * 60 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleLogout, INACTIVIDAD_MS);
    };

    const eventos = ["mousedown", "keydown", "touchstart", "scroll"];
    eventos.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      eventos.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [handleLogout]);

  const closeDrawer = () => setDrawerOpen(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-container">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAdmin = perfil?.rol === "super_admin";
  const isAdminDepartamento = perfil?.rol === "admin_departamento";
  const navItems = isAdmin
    ? superAdminNavItems
    : isAdminDepartamento
      ? adminDepartamentoNavItems
      : editorNavItems;
  const roleLabel = isAdmin ? "Super Admin" : isAdminDepartamento ? "Admin Depto." : "Editor";

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:self-start lg:overflow-y-auto lg:border-r lg:border-outline-variant/30 lg:bg-surface-container">
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-outline-variant/30 px-6 py-5"
        >
          <span className="text-base font-semibold tracking-tight text-primary">
            Misas Mendoza
          </span>
        </Link>

        <div className="border-b border-outline-variant/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-on-surface">
                {perfil?.nombre_completo ?? "Voluntario"}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isAdmin || isAdminDepartamento
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary-container/30 text-secondary"
                }`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.tooltip}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/solicitudes" && pendientes > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-primary">
                    {pendientes}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant/30 px-3 py-4 space-y-0.5">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-on-surface-variant">Apariencia</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            <Home className="h-5 w-5" />
            Volver al Inicio
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex w-full items-center justify-between border-b border-outline-variant/30 bg-surface-container/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-on-surface transition-colors hover:bg-surface-container"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-on-surface">
            Panel Admin
          </span>
          <ThemeToggle />
        </div>

        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 py-6 lg:px-8 pb-20 lg:pb-6">
          {children}
        </main>

        {/* z-1100: por encima de los panes de Leaflet del minimapa de ubicación */}
        <nav className="fixed bottom-0 left-0 right-0 z-1100 border-t border-outline-variant/30 bg-surface-container lg:hidden">
          <div className="flex items-center justify-around py-1.5">
            {mobileTabs.map((tab) => {
              const isActive =
                tab.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                    isActive ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin/voluntarios"
                aria-label="Voluntarios"
                aria-current={pathname.startsWith("/admin/voluntarios") ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  pathname.startsWith("/admin/voluntarios")
                    ? "text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-[10px] font-medium">Voluntarios</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-on-surface-variant"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-medium">Salir</span>
            </button>
          </div>
        </nav>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-1200 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface-container shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-2"
              >
                <span className="text-base font-semibold tracking-tight text-primary">
                  Misas Mendoza
                </span>
              </Link>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-outline-variant/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-on-surface">
                    {perfil?.nombre_completo ?? "Voluntario"}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isAdmin || isAdminDepartamento
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary-container/30 text-secondary"
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    title={item.tooltip}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/admin/solicitudes" && pendientes > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-primary">
                        {pendientes}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-outline-variant/30 px-3 py-4 space-y-0.5">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              >
                <Home className="h-5 w-5" />
                Volver al Inicio
              </Link>
              <button
                onClick={() => { handleLogout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
