import Link from "next/link";
import { Church, User } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { BottomNav } from "@/app/components/bottom-nav";
import { HeaderNav } from "@/app/components/header-nav";
import { OfflineBanner } from "@/app/components/offline-banner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface-container/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-280 items-center justify-between px-5 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Church className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-semibold tracking-tight text-primary">
              Misas Mendoza
            </span>
          </Link>

          <HeaderNav />

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-primary-container/20 text-primary transition-all hover:bg-primary-container/30"
              aria-label="Perfil"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <OfflineBanner />

      <main className="pb-20 md:pb-0">{children}</main>

      <BottomNav />
    </>
  );
}
