"use client";

import { Navigation } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.divIcon({
  className: "",
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: #476254;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 14 14"
             style="transform: rotate(45deg)">
          <rect x="6" y="1" width="2" height="12"
                rx="0.5" fill="white"/>
          <rect x="2" y="4" width="10" height="2"
                rx="0.5" fill="white"/>
        </svg>
      </div>
      <div style="
        width: 5px;
        height: 5px;
        background: rgba(0,0,0,0.12);
        border-radius: 50%;
        margin-top: 2px;
      "></div>
    </div>
  `,
  iconSize: [30, 37],
  iconAnchor: [15, 37],
  popupAnchor: [0, -38],
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
