"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { actualizarCapilla, eliminarCapilla } from "../../actions";

const LocationPicker = dynamic(
  () => import("@/app/components/location-picker"),
  { ssr: false },
);

const TIPOS_LUGAR = ["parroquia", "capilla", "santuario"];
const DEPARTAMENTOS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

type Lugar = {
  id: string;
  nombre: string;
  tipo: string;
  departamento: string;
  direccion: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  horario_secretaria?: string;
  decanato?: string;
  descripcion?: string;
  imagen_url?: string;
  lat: number;
  lng: number;
  hay_confesiones: boolean;
  activo: boolean;
};

export default function EditarCapillaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number>(-32.8908);
  const [lng, setLng] = useState<number>(-68.8272);

  const fetchLugar = useCallback(async () => {
    if (!id) {
      setError("ID de capilla inválido");
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("lugares")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (err) {
      setError(err.message);
    } else if (data) {
      const l = data as Lugar;
      setLugar(l);
      setLat(l.lat ?? -32.8908);
      setLng(l.lng ?? -68.8272);
      setError(null);
    } else {
      setError("No se encontró la capilla.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchLugar(); }, [fetchLugar]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      formData.set("lat", String(lat));
      formData.set("lng", String(lng));
      try {
        await actualizarCapilla(id, formData);
      } catch (e) {
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
          setError(e.message);
        }
      }
    });
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que querés eliminar esta capilla?")) return;
    setIsDeleting(true);
    setError(null);
    try {
      await eliminarCapilla(id);
      router.push("/admin/capillas");
    } catch (e) {
      setIsDeleting(false);
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !lugar) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-on-surface-variant">{error}</p>
        <Link href="/admin/capillas" className="text-sm font-medium text-primary hover:underline">Volver a capillas</Link>
      </div>
    );
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
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Editar Capilla</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">Modificá los datos de la capilla.</p>
        </div>
        <Link
          href={`/admin/capillas/${id}/horarios`}
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Clock className="h-4 w-4" />
          Horarios
        </Link>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-6">

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Información básica</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="text-sm font-medium text-on-surface">Nombre</label>
              <input id="nombre" name="nombre" type="text" required defaultValue={lugar?.nombre}
                placeholder="Ej: Parroquia Santiago Apóstol"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
              <select id="tipo" name="tipo" required defaultValue={lugar?.tipo}
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
              <select id="departamento" name="departamento" required defaultValue={lugar?.departamento}
                className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              >
                <option value="" disabled>Seleccioná...</option>
                {DEPARTAMENTOS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="decanato" className="text-sm font-medium text-on-surface">Decanato <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="decanato" name="decanato" type="text" defaultValue={lugar?.decanato ?? ""}
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
                  defaultChecked={lugar?.activo ?? true}
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
              <input id="direccion" name="direccion" type="text" required defaultValue={lugar?.direccion}
                placeholder="Ej: Av. San Martín 1234, Ciudad"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="text-sm font-medium text-on-surface">Teléfono <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="telefono" name="telefono" type="text" defaultValue={lugar?.telefono ?? ""}
                placeholder="Ej: 261 123-4567"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-on-surface">Email <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="email" name="email" type="email" defaultValue={lugar?.email ?? ""}
                placeholder="secretaria@ejemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="sitio_web" className="text-sm font-medium text-on-surface">Sitio Web <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="sitio_web" name="sitio_web" type="url" defaultValue={lugar?.sitio_web ?? ""}
                placeholder="https://ejemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="horario_secretaria" className="text-sm font-medium text-on-surface">Horario Secretaría <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="horario_secretaria" name="horario_secretaria" type="text" defaultValue={lugar?.horario_secretaria ?? ""}
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
                  defaultChecked={lugar?.hay_confesiones}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-on-surface">¿Hay confesiones disponibles?</span>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Descripción</h2>
          <div className="grid gap-5">
            <div>
              <label htmlFor="descripcion" className="text-sm font-medium text-on-surface">Descripción <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <textarea id="descripcion" name="descripcion" rows={3} defaultValue={lugar?.descripcion ?? ""}
                placeholder="Breve descripción de la capilla..."
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
              />
            </div>
            <div>
              <label htmlFor="imagen_url" className="text-sm font-medium text-on-surface">URL de Imagen <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="imagen_url" name="imagen_url" type="url" defaultValue={lugar?.imagen_url ?? ""}
                placeholder="https://ejemplo.com/foto.jpg"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Ubicación</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4 md:col-span-2">
              <p className="text-sm text-on-surface-variant">Hacé clic en el mapa para ajustar la ubicación.</p>
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
          <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
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
              "Guardar Cambios"
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 rounded-lg border border-error px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error-container disabled:opacity-50"
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Eliminando...</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Eliminar</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
