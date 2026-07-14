export default function HeroBanner() {
  return (
    <div className="relative mx-auto mb-8 max-w-xl overflow-hidden rounded-xl bg-secondary-container px-6 py-8 text-center md:mb-10 md:px-8 md:py-10">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5" />

      <h1 className="relative z-10 text-2xl font-semibold text-on-surface md:text-3xl">
        Encontrá tu misa en Mendoza
      </h1>
      <p className="relative z-10 mt-2 text-sm text-on-surface-variant md:text-base">
        Horarios, parroquias y capillas de tu comunidad, todo en un solo lugar.
      </p>
    </div>
  );
}
