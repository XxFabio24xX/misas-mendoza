"use client";

import { Navigation } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map({
  lat,
  lng,
  nombre,
}: {
  lat: number;
  lng: number;
  nombre: string;
}) {
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon}>
          <Popup>{nombre}</Popup>
        </Marker>
      </MapContainer>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary shadow-md transition-colors hover:bg-primary-container"
      >
        <Navigation className="mr-1.5 inline-block h-4 w-4" />
        Cómo llegar
      </a>
    </div>
  );
}
