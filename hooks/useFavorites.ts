"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "misas-mendoza:favoritos";

function readFavoritos(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavoritos(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora.
  }
}

/**
 * Favoritos persistidos en localStorage, sin cuenta de usuario.
 * `isMounted` distingue el render inicial (SSR y primer paint del cliente,
 * donde localStorage no existe/no se leyó) del estado ya sincronizado,
 * para evitar mostrar un ícono incorrecto antes de la hidratación.
 */
export function useFavorites() {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Lectura de localStorage: solo existe en el cliente, no se puede
    // resolver en un inicializador de useState porque correría en SSR también.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoritos(readFavoritos());
    setIsMounted(true);
  }, []);

  function isFavorite(id: string): boolean {
    return isMounted && favoritos.includes(id);
  }

  function toggleFavorite(id: string) {
    setFavoritos((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      writeFavoritos(next);
      return next;
    });
  }

  return { favoritos, isFavorite, toggleFavorite, isMounted };
}
