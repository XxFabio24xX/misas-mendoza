"use client";

import dynamic from "next/dynamic";
import type { LugarMapa } from "@/app/components/global-map";
import { CandleLoader } from "@/app/components/candle-loader";

const GlobalMapClient = dynamic(() => import("@/app/components/global-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
      <CandleLoader size="sm" />
    </div>
  ),
});

export default function GlobalMapWrapper({ lugares }: { lugares: LugarMapa[] }) {
  return <GlobalMapClient lugares={lugares} />;
}
