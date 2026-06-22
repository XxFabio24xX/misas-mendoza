"use client";

import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Check, ImageIcon, RotateCcw, X, ZoomIn } from "lucide-react";

async function cropImageToFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise<void>((res) => { img.onload = () => res(); });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(new File([blob!], "imagen.jpg", { type: "image/jpeg" })),
      "image/jpeg",
      0.92
    );
  });
}

type Props = {
  value: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  maxMB?: number;
  aspect?: number;
};

export function ImageUploader({ value, onChange, maxMB = 2, aspect = 3 / 2 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleFileSelect(file: File | null) {
    setSizeError(null);
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      setSizeError(
        `La imagen pesa más de ${maxMB}MB. Comprimila en tinypng.com o similar antes de subirla.`
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setRawSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function confirmCrop() {
    if (!rawSrc || !croppedAreaPixels) return;
    setConfirming(true);
    try {
      const croppedFile = await cropImageToFile(rawSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);
      onChange(croppedFile, previewUrl);
      setRawSrc(null);
    } finally {
      setConfirming(false);
    }
  }

  function cancelCrop() {
    setRawSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (inputRef.current) inputRef.current.value = "";
  }

  function clear() {
    onChange(null, null);
    setSizeError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Modo recorte
  if (rawSrc) {
    return (
      <div className="mt-1.5 space-y-3">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={rawSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>
        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <p className="text-xs text-on-surface-variant">
          Arrastrá para encuadrar · Slider para zoom
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelCrop}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmCrop}
            disabled={confirming}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {confirming ? "Procesando..." : "Confirmar recorte"}
          </button>
        </div>
      </div>
    );
  }

  // Modo preview
  if (value) {
    return (
      <div className="mt-1.5">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-outline-variant"
          style={{ aspectRatio: aspect }}
        >
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 rounded-full bg-surface-container/80 p-1.5 text-on-surface-variant backdrop-blur-sm transition-colors hover:bg-error-container hover:text-error"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
          <label
            htmlFor="imagen_file"
            className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface-container/80 px-3 py-1.5 text-xs font-medium text-on-surface backdrop-blur-sm transition-colors hover:bg-surface-container"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Cambiar
          </label>
        </div>
        <input
          ref={inputRef}
          id="imagen_file"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
        {sizeError && <p className="mt-1.5 text-xs text-error">{sizeError}</p>}
      </div>
    );
  }

  // Modo vacío
  return (
    <div className="mt-1.5">
      <label
        htmlFor="imagen_file"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-10 text-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <ImageIcon className="h-8 w-8 opacity-40" />
        <span>Hacé clic para seleccionar una foto</span>
        <span className="text-xs opacity-60">JPG, PNG, WEBP · Máx. {maxMB}MB</span>
      </label>
      {sizeError && <p className="mt-1.5 text-xs text-error">{sizeError}</p>}
      <input
        ref={inputRef}
        id="imagen_file"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
