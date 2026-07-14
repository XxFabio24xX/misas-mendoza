"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // El usuario canceló el share sheet — no es un error.
      }
      return;
    }
    // Fallback de escritorio: copiar el link al portapapeles.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Portapapeles no disponible — se ignora.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copiado" : "Compartir"}
      title={copied ? "¡Link copiado!" : "Compartir"}
      className="ambient-shadow flex h-10 w-10 items-center justify-center rounded-full bg-surface-container/90 backdrop-blur-sm transition-all hover:-translate-y-0.5"
    >
      {copied ? (
        <Check className="h-5 w-5 text-primary" />
      ) : (
        <Share2 className="h-5 w-5 text-on-surface-variant" />
      )}
    </button>
  );
}
