"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      className="ambient-shadow flex h-10 w-10 items-center justify-center rounded-full bg-surface-container/90 backdrop-blur-sm transition-all hover:-translate-y-0.5"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-on-surface-variant"}`}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
