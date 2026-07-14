"use client";

import { CalendarPlus } from "lucide-react";
import { buildIcs } from "@/lib/ics";

type Props = {
  uid: string;
  titulo: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  inicio: string;
  fin?: string | null;
};

export function AddToCalendarButton(props: Props) {
  const handleClick = () => {
    const ics = buildIcs({ ...props, url: window.location.href });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.uid}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant"
    >
      <CalendarPlus className="h-4 w-4 text-primary" />
      Agregar al calendario
    </button>
  );
}
