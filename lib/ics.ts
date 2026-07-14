/** Generación de archivos iCalendar (.ics) para "Agregar al calendario". */

type IcsEvento = {
  uid: string;
  titulo: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  /** ISO timestamps (timestamptz de la DB) */
  inicio: string;
  fin?: string | null;
  url?: string;
};

/** Escapa texto según RFC 5545 (backslash, punto y coma, coma, saltos de línea). */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fecha ISO → formato básico UTC de iCalendar (AAAAMMDDTHHMMSSZ). */
export function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(evento: IcsEvento): string {
  // Sin fecha de fin: se asume una hora de duración.
  const fin =
    evento.fin ?? new Date(new Date(evento.inicio).getTime() + 60 * 60 * 1000).toISOString();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Misas Mendoza//ES",
    "BEGIN:VEVENT",
    `UID:${evento.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(evento.inicio)}`,
    `DTEND:${toIcsDate(fin)}`,
    `SUMMARY:${escapeIcsText(evento.titulo)}`,
    ...(evento.descripcion ? [`DESCRIPTION:${escapeIcsText(evento.descripcion)}`] : []),
    ...(evento.ubicacion ? [`LOCATION:${escapeIcsText(evento.ubicacion)}`] : []),
    ...(evento.url ? [`URL:${evento.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
