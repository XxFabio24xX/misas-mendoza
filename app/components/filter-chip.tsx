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
          ? "bg-primary text-on-primary border border-primary"
          : "border border-outline-variant/50 bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}
