"use client";

type FilterChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

/** Chip de filtro estándar (píldora con estado seleccionado/deseleccionado). */
export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "border border-outline-variant/50 bg-outline-variant/40 text-on-surface hover:bg-outline-variant/60"
      }`}
    >
      {children}
    </button>
  );
}
