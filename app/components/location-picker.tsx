"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[-32.8908, -68.8272]}
      zoom={12}
      className="h-[300px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {lat !== undefined && lng !== undefined && (
        <Marker position={[lat, lng]} icon={icon} />
      )}
    </MapContainer>
  );
}
