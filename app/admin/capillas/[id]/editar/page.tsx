"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { unstable_rethrow, useParams, useRouter } from "next/navigation";
import { Clock, Loader2, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import imageCompression from "browser-image-compression";
import { actualizarCapilla, eliminarCapilla } from "../../actions";
import { HorariosGrid, type HorarioData } from "@/app/components/horarios-grid";
import { ImageUploader } from "@/app/components/image-uploader";
import { Breadcrumb } from "@/app/admin/components/breadcrumb";
import { CandleLoader } from "@/app/components/candle-loader";
import ConfirmDialog from "@/app/components/confirm-dialog";

const LocationPicker = dynamic(
  () => import("@/app/components/location-picker"),
  { ssr: false },
);

const TIPOS_LUGAR = ["parroquia", "capilla", "santuario"];

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
  notas_horarios?: string;
  recibe_caritas?: boolean;
};

type HorarioRaw = {
  id: string;
  dia_semana: number | null;
  dia_mes: number | null;
  hora: string;
  temporada: string;
  reemplaza_dia: boolean | null;
  observacion: string | null;
};

export default function EditarCapillaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [horarios, setHorarios] = useState<HorarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number>(-32.8908);
  const [lng, setLng] = useState<number>(-68.8272);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [esEditor, setEsEditor] = useState(false);
  const [hayCambios, setHayCambios] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const marcarCambio = () => {
    if (!hayCambios) setHayCambios(true);
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hayCambios) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hayCambios]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle();
      setEsEditor(perfil?.rol === "editor");
    })();
  }, []);

  const fetchLugar = useCallback(async () => {
    if (!id) {
      setError("ID de capilla inválido");
      setLoading(false);
      return;
    }
    const [{ data, error: err }, { data: horariosData }] = await Promise.all([
      supabase.from("lugares").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("horarios")
        .select("id, dia_semana, dia_mes, hora, temporada, reemplaza_dia, observacion")
        .eq("lugar_id", id)
        .order("dia_semana", { ascending: true }),
    ]);
    if (err) {
      setError(err.message);
    } else if (data) {
      const l = data as Lugar;
      setLugar(l);
      setLat(l.lat ?? -32.8908);
      setLng(l.lng ?? -68.8272);
      if (l.imagen_url) setImagePreview(l.imagen_url);
      setError(null);
    } else {
      setError("No se encontró la capilla.");
    }
    if (horariosData) {
      setHorarios(
        (horariosData as HorarioRaw[]).map((h) => ({
          tipo: h.dia_mes != null ? "mensual" : "semanal",
          dia_semana: h.dia_semana ?? 0,
          dia_mes: h.dia_mes ?? 1,
          hora: h.hora.slice(0, 5),
          temporada: (h.temporada as HorarioData["temporada"]) ?? "Todo el año",
          reemplaza_dia: h.reemplaza_dia ?? false,
          observacion: h.observacion ?? null,
        }))
      );
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Initial data load on mount — fetchLugar manages its own loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLugar();
  }, [fetchLugar]);

  function validar(formData: FormData): string | null {
    const nombre = ((formData.get("nombre") as string) ?? "").trim();
    const direccion = ((formData.get("direccion") as string) ?? "").trim();
    const departamento = formData.get("departamento") as string;
    const email = ((formData.get("email") as string) ?? "").trim();
    const sitio_web = ((formData.get("sitio_web") as string) ?? "").trim();

    if (!nombre) return "El nombre es obligatorio.";
    if (!direccion) return "La dirección es obligatoria.";
    if (!departamento) return "Seleccioná un departamento.";
    if (!lat || !lng) return "Marcá la ubicación en el mapa.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "El email no tiene un formato válido.";
    }
    if (sitio_web && sitio_web.length > 0 && !sitio_web.startsWith("http")) {
      return "El sitio web debe comenzar con http:// o https://";
    }
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const errorValidacion = validar(formData);
    if (errorValidacion) {
      setError(errorValidacion);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
      } else {
        formData.set("imagen_url", imagePreview);
      }

      try {
        await actualizarCapilla(id, formData);
        setHayCambios(false);
      } catch (e) {
        unstable_rethrow(e);
        setError(e instanceof Error ? e.message : "Error inesperado.");
      }
    });
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await eliminarCapilla(id);
      router.push("/admin/capillas");
    } catch (e) {
      setIsDeleting(false);
      setConfirmarEliminar(false);
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CandleLoader size="md" />
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
      <Breadcrumb items={[
        { label: "Capillas", href: "/admin/capillas" },
        { label: lugar?.nombre ?? "Editar" },
      ]} />
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Editar Capilla</h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">Modificá los datos de la capilla.</p>
      </div>

      {esEditor && (
        <div className="mt-6 rounded-xl bg-secondary-container px-5 py-4 text-sm text-on-secondary-container">
          <strong>Modo editor:</strong> los cambios en datos de contacto y horarios se enviarán al
          administrador de tu departamento para su aprobación antes de publicarse.
        </div>
      )}

      <form action={handleSubmit} className="mt-6 space-y-6">

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Información básica</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="text-sm font-medium text-on-surface">Nombre</label>
              <input id="nombre" name="nombre" type="text" required defaultValue={lugar?.nombre}
                placeholder="Ej: Parroquia Santiago Apóstol"
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
              <select id="tipo" name="tipo" required defaultValue={lugar?.tipo}
                onChange={marcarCambio}
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
                onChange={marcarCambio}
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
                onChange={marcarCambio}
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
                  onChange={marcarCambio}
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
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="text-sm font-medium text-on-surface">Teléfono <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="telefono" name="telefono" type="text" defaultValue={lugar?.telefono ?? ""}
                placeholder="Ej: 261 123-4567"
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-on-surface">Email <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="email" name="email" type="email" defaultValue={lugar?.email ?? ""}
                placeholder="secretaria@ejemplo.com"
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="sitio_web" className="text-sm font-medium text-on-surface">Sitio Web <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="sitio_web" name="sitio_web" type="url" defaultValue={lugar?.sitio_web ?? ""}
                placeholder="https://ejemplo.com"
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="horario_secretaria" className="text-sm font-medium text-on-surface">Horario Secretaría <span className="text-on-surface-variant font-normal">(opcional)</span></label>
              <input id="horario_secretaria" name="horario_secretaria" type="text" defaultValue={lugar?.horario_secretaria ?? ""}
                placeholder="Ej: Lun a Vie 9-13 y 16-20"
                onChange={marcarCambio}
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
                  onChange={marcarCambio}
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
                  defaultChecked={lugar?.recibe_caritas}
                  onChange={marcarCambio}
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
              <textarea id="descripcion" name="descripcion" rows={3} defaultValue={lugar?.descripcion ?? ""}
                placeholder="Breve descripción de la capilla..."
                onChange={marcarCambio}
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface">
                Imagen <span className="font-normal text-on-surface-variant">(opcional)</span>
              </label>
              <ImageUploader
                value={imagePreview}
                onChange={(file, preview) => { setImageFile(file); setImagePreview(preview); marcarCambio(); }}
                aspect={768 / 288}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Horarios de Misas</h2>
            <Link
              href={`/admin/capillas/${id}/horarios`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/70 hover:underline"
            >
              <Clock className="h-3.5 w-3.5" />
              Editor avanzado
            </Link>
          </div>
          <p className="mb-4 text-sm text-on-surface-variant">
            Al guardar, estos horarios reemplazarán los actuales. Usá el editor avanzado para opciones adicionales.
          </p>
          <HorariosGrid initialHorarios={horarios} />
          <div className="mt-5">
            <label htmlFor="notas_horarios" className="text-sm font-medium text-on-surface">
              Notas de Temporada <span className="font-normal text-on-surface-variant">(opcional)</span>
            </label>
            <textarea
              id="notas_horarios"
              name="notas_horarios"
              rows={3}
              defaultValue={lugar?.notas_horarios ?? ""}
              placeholder="Ej: En verano se agrega una misa a las 20:30 los sábados. En invierno se suspende la misa de las 7:00..."
              onChange={marcarCambio}
              className="mt-1.5 block w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>
        </section>

        <section className="rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
          <h2 className="mb-4 text-base font-semibold text-on-surface">Ubicación</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4 md:col-span-2">
              <p className="text-sm text-on-surface-variant">Hacé clic en el mapa para ajustar la ubicación.</p>
              <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); marcarCambio(); }} />
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
              "Guardar Cambios"
            )}
          </button>
          <button
            type="button"
            onClick={() => setConfirmarEliminar(true)}
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

      <ConfirmDialog
        open={confirmarEliminar}
        title="Eliminar capilla"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmarEliminar(false)}
      />
    </div>
  );
}
