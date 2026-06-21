"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-surface-container-low" />
  ),
});

export default function MapWrapper({
  lat,
  lng,
  nombre,
}: {
  lat: number;
  lng: number;
  nombre: string;
}) {
  return <MapClient lat={lat} lng={lng} nombre={nombre} />;
}
