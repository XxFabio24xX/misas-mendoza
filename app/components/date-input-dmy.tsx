"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CalendarDays } from "lucide-react";
import { displayToISO, isoToDisplay } from "@/lib/date-dmy";

type Props = {
  id: string;
  name: string;
  required?: boolean;
  defaultValueISO?: string;
  className?: string;
  "aria-describedby"?: string;
};

/**
 * Campo de fecha que siempre muestra/acepta DD/MM/AAAA (tecleado o vía el
 * datepicker nativo, disparado con showPicker() desde el ícono de calendario)
 * y envía el valor en ISO por un input oculto.
 */
export default function DateInputDMY({
  id,
  name,
  required,
  defaultValueISO = "",
  className,
  "aria-describedby": ariaDescribedBy,
}: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(defaultValueISO));
  const [iso, setIso] = useState(defaultValueISO);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDisplay(formatted);

    const parsedIso = displayToISO(formatted);
    setIso(parsedIso);

    const complete = digits.length === 8;
    e.target.setCustomValidity(
      complete && !parsedIso ? "Ingresá una fecha válida (DD/MM/AAAA)." : "",
    );
  }

  function handleNativeDateChange(e: ChangeEvent<HTMLInputElement>) {
    setIso(e.target.value);
    setDisplay(isoToDisplay(e.target.value));
  }

  function openPicker() {
    const el = nativeDateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/AAAA"
        pattern="\d{2}/\d{2}/\d{4}"
        maxLength={10}
        value={display}
        onChange={handleTextChange}
        required={required}
        aria-describedby={ariaDescribedBy}
        style={{ paddingRight: "2.5rem" }}
        className={className}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Elegir fecha desde el calendario"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
      <input
        ref={nativeDateRef}
        type="date"
        value={iso}
        onChange={handleNativeDateChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <input type="hidden" name={name} value={iso} />
    </div>
  );
}
