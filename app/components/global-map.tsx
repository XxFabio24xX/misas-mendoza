"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type LugarMapa = {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  slug: string;
};

// Centro por defecto: Ciudad de Mendoza (mismo default usado en el alta de capillas).
const MENDOZA_CENTER: [number, number] = [-32.8908, -68.8272];

function FitBounds({ lugares }: { lugares: LugarMapa[] }) {
  const map = useMap();

  useEffect(() => {
    if (lugares.length === 0) return;
    const bounds = L.latLngBounds(lugares.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [lugares, map]);

  return null;
}

export default function GlobalMap({ lugares }: { lugares: LugarMapa[] }) {
  return (
    <MapContainer
      center={MENDOZA_CENTER}
      zoom={11}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds lugares={lugares} />

      {lugares.map((lugar) => (
        <Marker key={lugar.id} position={[lugar.lat, lugar.lng]} icon={icon}>
          <Tooltip>{lugar.nombre}</Tooltip>
          {/* leaflet.css hardcodes the popup card to a white background regardless of
              our app theme, so its content is pinned to light-mode colors on purpose —
              theme-aware tokens here would turn illegible against that fixed white card
              in dark mode. */}
          <Popup>
            <div className="min-w-40">
              <p className="text-sm font-semibold text-[#1c1c15]">{lugar.nombre}</p>
              <p className="mt-0.5 text-xs text-[#424844]">{lugar.direccion}</p>
              <Link
                href={`/capilla/${lugar.slug}`}
                // text-white!: leaflet.css's `.leaflet-container a { color: #0078A8 }`
                // is more specific than a plain Tailwind utility and wins without it.
                className="mt-2 inline-block rounded-lg bg-[#476254] px-3 py-1.5 text-xs font-medium text-white! transition-colors hover:bg-[#5f7b6c]"
              >
                Ver detalles
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
