"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { crearCapilla } from "../actions";
import { HorariosGrid } from "@/app/components/horarios-grid";
import { ImageUploader } from "@/app/components/image-uploader";
import { supabase } from "@/lib/supabase";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import imageCompression from "browser-image-compression";

const LocationPicker = dynamic(
  () => import("@/app/components/location-picker"),
  { ssr: false },
);

const TIPOS_LUGAR = ["parroquia", "capilla", "santuario"];

export default function NuevaCapillaPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number>(-32.8908);
  const [lng, setLng] = useState<number>(-68.8272);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      formData.set("lat", String(lat));
      formData.set("lng", String(lng));

      if (imageFile) {
        const compressed = await imageCompression(imageFile, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("imagenes_capillas")
          .upload(fileName, compressed, { upsert: false });
        if (uploadError) {
          setError(`Error al subir la imagen: ${uploadError.message}`);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("imagenes_capillas")
          .getPublicUrl(fileName);
        formData.set("imagen_url", urlData.publicUrl);
      } else if (!imagePreview) {
        formData.set("imagen_url", "");
      }

      try {
        await crearCapilla(formData);
      } catch (e) {
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
          setError(e.message);
        }
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/capillas"
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Nueva Capilla</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">Registrá una nueva capilla, parroquia o santuario.</p>
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-8">
        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Información básica</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="text-sm font-medium text-on-surface">Nombre</label>
              <input id="nombre" name="nombre" type="text" required
                placeholder="Ej: Parroquia Santiago Apóstol"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
              <select id="tipo" name="tipo" required defaultValue=""
                className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="" disabled>Seleccioná...</option>
                {TIPOS_LUGAR.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="departamento" className="text-sm font-medium text-on-surface">Departamento</label>
              <select id="departamento" name="departamento" required defaultValue=""
                className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="" disabled>Seleccioná...</option>
                {DEPARTAMENTOS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="decanato" className="text-sm font-medium text-on-surface">Decanato <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="decanato" name="decanato" type="text"
                placeholder="Ej: Decanato Centro"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5">
                <input
                  id="activo"
                  name="activo"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-on-surface">Activo</span>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Contacto</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="direccion" className="text-sm font-medium text-on-surface">Dirección</label>
              <input id="direccion" name="direccion" type="text" required
                placeholder="Ej: Av. San Martín 1234, Ciudad"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="text-sm font-medium text-on-surface">Teléfono <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="telefono" name="telefono" type="text"
                placeholder="Ej: 261 123-4567"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-on-surface">Email <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="email" name="email" type="email"
                placeholder="secretaria@ejemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="sitio_web" className="text-sm font-medium text-on-surface">Sitio Web <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="sitio_web" name="sitio_web" type="url"
                placeholder="https://ejemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="horario_secretaria" className="text-sm font-medium text-on-surface">Horario Secretaría <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="horario_secretaria" name="horario_secretaria" type="text"
                placeholder="Ej: Lun a Vie 9-13 y 16-20"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5">
                <input
                  id="hay_confesiones"
                  name="hay_confesiones"
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-on-surface">¿Hay confesiones disponibles?</span>
              </label>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5">
                <input
                  id="recibe_caritas"
                  name="recibe_caritas"
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-on-surface">Recibe donaciones para Cáritas</span>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Descripción</h2>
          <div className="grid gap-5">
            <div>
              <label htmlFor="descripcion" className="text-sm font-medium text-on-surface">Descripción <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <textarea id="descripcion" name="descripcion" rows={3}
                placeholder="Breve descripción de la capilla..."
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface">
                Imagen <span className="font-normal text-on-surface-variant">(opcional)</span>
              </label>
              <ImageUploader
                value={imagePreview}
                onChange={(file, preview) => { setImageFile(file); setImagePreview(preview); }}
                aspect={768 / 288}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Horarios de Misas</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Agregá los horarios de misas de esta capilla. Podés agregar más horarios después desde el panel de horarios.
          </p>
          <HorariosGrid />
          <div className="mt-5">
            <label htmlFor="notas_horarios" className="text-sm font-medium text-on-surface">
              Notas de Temporada <span className="font-normal text-on-surface-variant">(opcional)</span>
            </label>
            <textarea
              id="notas_horarios"
              name="notas_horarios"
              rows={3}
              placeholder="Ej: En verano se agrega una misa a las 20:30 los sábados. En invierno se suspende la misa de las 7:00..."
              className="mt-1.5 block w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Ubicación</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4 md:col-span-2">
              <p className="text-sm text-on-surface-variant">Hacé clic en el mapa para marcar la ubicación exacta.</p>
              <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
            </div>
            <div>
              <label htmlFor="lat_input" className="text-sm font-medium text-on-surface">Latitud</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                <input id="lat_input" type="number" step="any" readOnly value={lat}
                  className="w-full bg-transparent text-sm text-on-surface outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lng_input" className="text-sm font-medium text-on-surface">Longitud</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                <input id="lng_input" type="number" step="any" readOnly value={lng}
                  className="w-full bg-transparent text-sm text-on-surface outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div role="status" aria-live="polite" className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
        )}

        <div className="flex items-center gap-3 pt-2 pb-6">
          <Link
            href="/admin/capillas"
            className="flex-1 rounded-lg border border-outline-variant px-4 py-2.5 text-center text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              "Guardar Capilla"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
