"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { LocateFixed, LocateOff } from "lucide-react";

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

// Punto azul pulsante estilo Google Maps para la ubicación del usuario.
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 20px; height: 20px;">
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 20px; height: 20px;
        border-radius: 50%;
        background: rgba(55, 138, 221, 0.25);
        animation: user-pulse 2s ease-out infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 12px; height: 12px;
        border-radius: 50%;
        background: #378ADD;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export type LugarMapa = {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  slug: string;
};

type UserLocation = { lat: number; lng: number };

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

// Centra el mapa en la ubicación del usuario apenas el navegador la entrega.
function CenterOnUser({ location }: { location: UserLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    map.setView([location.lat, location.lng], 14);
  }, [location, map]);

  return null;
}

export default function GlobalMap({ lugares }: { lugares: LugarMapa[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geoStatus, setGeoStatus] = useState<"pending" | "granted" | "denied">(() =>
    "geolocation" in navigator ? "pending" : "denied",
  );
  const [showLocationHint, setShowLocationHint] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const flyToUserLocation = useCallback(() => {
    if (!userLocation || !mapRef.current) {
      setShowLocationHint(true);
      setTimeout(() => setShowLocationHint(false), 3000);
      return;
    }
    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [userLocation]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={MENDOZA_CENTER}
        zoom={11}
        // El zoom va abajo a la derecha: en su posición default (arriba-izquierda)
        // quedaba superpuesto al título "Mapa de Iglesias".
        zoomControl={false}
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sin ubicación del usuario: comportamiento de siempre, ajustar a las capillas. */}
        {geoStatus === "denied" && <FitBounds lugares={lugares} />}
        <CenterOnUser location={geoStatus === "granted" ? userLocation : null} />

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

        {/* Marcador de ubicación del usuario — separado de los markers de capillas. */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
        )}
      </MapContainer>

      <button
        onClick={flyToUserLocation}
        title={userLocation ? "Mi ubicación" : "Ubicación no disponible"}
        aria-label="Ir a mi ubicación"
        className={`absolute bottom-24 right-3 z-[1000]
             flex items-center justify-center
             w-10 h-10 rounded-xl
             bg-surface-container border border-outline-variant/30
             transition-colors shadow-sm ${
               userLocation
                 ? "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                 : "text-on-surface-variant/40 hover:bg-surface-container-high"
             }`}
      >
        {userLocation ? <LocateFixed className="h-5 w-5" /> : <LocateOff className="h-5 w-5" />}
      </button>

      {showLocationHint && (
        <div className="ambient-shadow absolute bottom-38 right-3 z-[1000] max-w-50 rounded-lg bg-surface-container-highest px-3 py-2 text-xs text-on-surface">
          Activá la ubicación en tu navegador
        </div>
      )}
    </div>
  );
}
