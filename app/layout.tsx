import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/app/components/theme-provider";
import { RegisterSW } from "@/app/components/register-sw";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://misasmendoza.com.ar",
  ),
  title: {
    default: "Misas Mendoza — Horarios de misas en Mendoza",
    template: "%s | Misas Mendoza",
  },
  description:
    "Encontrá los horarios de misas, confesiones y celebraciones católicas más cercanas a vos en Mendoza, Argentina. Parroquias, capillas y santuarios de toda la arquidiócesis.",
  keywords: [
    "misas mendoza",
    "horario de misas mendoza",
    "misa hoy mendoza",
    "capillas mendoza",
    "parroquias mendoza",
    "iglesias mendoza horarios",
    "misas godoy cruz",
    "misas las heras",
    "misas guaymallen",
    "arquidiócesis mendoza",
  ],
  openGraph: {
    siteName: "Misas Mendoza",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Misas Mendoza",
      },
    ],
  },
  verification: {
    google: "aewZWHafkvNx-N088LukBEh-WO2cgG9lQdsfRZcS-h8",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={geist.className}>
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`}</Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <RegisterSW />
        <Analytics />
      </body>
    </html>
  );
}
