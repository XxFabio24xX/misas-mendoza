"use client";

import dynamic from "next/dynamic";
import type { LugarMapa } from "@/app/components/global-map";

const GlobalMapClient = dynamic(() => import("@/app/components/global-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
});

export default function GlobalMapWrapper({ lugares }: { lugares: LugarMapa[] }) {
  return <GlobalMapClient lugares={lugares} />;
}
