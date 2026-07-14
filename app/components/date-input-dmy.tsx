"use client";

import { useState, type ChangeEvent } from "react";

type Props = {
  id: string;
  name: string;
  required?: boolean;
  defaultValueISO?: string;
  className?: string;
  "aria-describedby"?: string;
};

function isoToDisplay(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

function displayToISO(display: string): string {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  const date = new Date(year, month - 1, day);
  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isValid ? `${y}-${m}-${d}` : "";
}

/** Text input masked as DD/MM/AAAA that submits an ISO (YYYY-MM-DD) value via a hidden field. */
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
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

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/AAAA"
        pattern="\d{2}/\d{2}/\d{4}"
        maxLength={10}
        value={display}
        onChange={handleChange}
        required={required}
        aria-describedby={ariaDescribedBy}
        className={className}
      />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}
