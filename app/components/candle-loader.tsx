"use client";

import { useEffect, useState } from "react";

interface CandleLoaderProps {
  text?: string; // default: "Cargando"
  size?: "sm" | "md" | "lg"; // default: 'md'
}

export function CandleLoader({ text = "Cargando", size = "md" }: CandleLoaderProps) {
  const [lit, setLit] = useState<number[]>([]);

  useEffect(() => {
    // Encender las 3 velas en secuencia
    const timers = [0, 350, 700].map((delay, i) =>
      setTimeout(() => setLit((prev) => [...prev, i]), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Tamaños según prop size
  const heights = {
    sm: [20, 30, 20],
    md: [28, 40, 28],
    lg: [36, 52, 36],
  };
  const gaps = { sm: "gap-3", md: "gap-4", lg: "gap-5" };
  const candleH = heights[size];

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Velas */}
      <div className={`flex items-end ${gaps[size]}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center">

            {/* Llama */}
            <div className="relative h-4 flex items-end">
              <div
                className="w-2 rounded-t-full rounded-b-[35%]
                           bg-primary origin-bottom
                           transition-all duration-500 ease-out"
                style={{
                  height: lit.includes(i) ? "14px" : "0px",
                  opacity: lit.includes(i) ? 1 : 0,
                  animation: lit.includes(i)
                    ? "candle-flicker 2s ease-in-out infinite alternate"
                    : "none",
                }}
              >
                {/* Núcleo interior de la llama */}
                <div
                  className="absolute top-1 left-0.5 w-1
                             rounded-t-full rounded-b-[35%]
                             bg-primary-fixed opacity-60"
                  style={{ height: "7px" }}
                />
              </div>
            </div>

            {/* Mecha */}
            <div className="w-px h-1.5 bg-outline-variant" />

            {/* Cuerpo de la vela */}
            <div
              className="w-3 rounded-t-sm rounded-b-[1px]
                         bg-surface-container-high
                         border border-outline-variant/50"
              style={{ height: `${candleH[i]}px` }}
            />

            {/* Base */}
            <div className="w-4 h-0.5 rounded-sm bg-outline-variant" />
          </div>
        ))}
      </div>

      {/* Texto */}
      {text && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold uppercase
                           tracking-[0.1em] text-on-surface-variant">
            {text}
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-primary opacity-30"
                style={{
                  animation: "candle-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
