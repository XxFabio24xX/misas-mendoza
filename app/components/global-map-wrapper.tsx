"use client";

import dynamic from "next/dynamic";
import type { LugarMapa } from "@/app/components/global-map";
import type { FranjaHoraria } from "@/lib/misas-utils";
import { CandleLoader } from "@/app/components/candle-loader";

const GlobalMapClient = dynamic(() => import("@/app/components/global-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
      <CandleLoader size="sm" />
    </div>
  ),
});

type Props = {
  lugares: LugarMapa[];
  diaParam?: string | null;
  horarioParam?: FranjaHoraria | null;
};

export default function GlobalMapWrapper({ lugares, diaParam, horarioParam }: Props) {
  return <GlobalMapClient lugares={lugares} diaParam={diaParam} horarioParam={horarioParam} />;
}
