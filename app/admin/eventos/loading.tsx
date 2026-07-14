export default function Loading() {
  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-on-surface-variant">Cargando...</p>
    </div>
  );
}
