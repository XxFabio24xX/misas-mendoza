import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | Misas Mendoza",
  description:
    "Aviso legal y política de privacidad de Misas Mendoza.",
};

const ULTIMA_ACTUALIZACION = "31 de julio de 2026";
const CONTACTO = "soporte@misasmendoza.com.ar";
const RESPONSABLE = "Fabio E.";

export default function LegalPage() {
  return (
    <main className="bg-surface text-on-surface">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-primary border border-primary rounded-full px-4 py-1.5 mb-6">
          Legal
        </span>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
          Aviso legal y política de privacidad
        </h1>
        <p className="text-on-surface-variant text-sm mb-12">
          Última actualización: {ULTIMA_ACTUALIZACION}
        </p>

        {/* ───────────────────────── AVISO LEGAL ───────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-primary mb-4">
            1. Aviso legal
          </h2>

          <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant">
            <p>
              <strong className="text-on-surface">
                Misas Mendoza
              </strong>{" "}
              (misasmendoza.com.ar) es un proyecto independiente, comunitario
              y sin fines de lucro, mantenido por voluntarios. No es un sitio
              oficial de la Arquidiócesis de Mendoza ni de ninguna parroquia,
              diócesis o institución eclesiástica en particular. Su único
              propósito es facilitar la búsqueda de horarios de misa a partir
              de información recopilada y actualizada por voluntarios de cada
              comunidad.
            </p>

            <p>
              <strong className="text-on-surface">Responsable del sitio: </strong>
              {RESPONSABLE}, a cargo del mantenimiento técnico y de contenidos
              del proyecto. Cualquier consulta, corrección o reclamo puede
              dirigirse a{" "}
              <a
                href={`mailto:${CONTACTO}`}
                className="text-primary underline underline-offset-2"
              >
                {CONTACTO}
              </a>
              .
            </p>

            <p>
              <strong className="text-on-surface">Exactitud de la información: </strong>
              los horarios, direcciones y demás datos publicados se cargan y
              actualizan de forma voluntaria por personas de cada parroquia o
              capilla, y pueden cambiar sin previo aviso (fechas especiales,
              feriados, reemplazos de último momento, etc.). Recomendamos
              confirmar directamente con la parroquia antes de asistir a
              eventos importantes. Misas Mendoza no garantiza la exactitud
              absoluta de la información y no se responsabiliza por
              inconvenientes derivados de datos desactualizados o erróneos.
            </p>

            <p>
              <strong className="text-on-surface">Contenido e imágenes: </strong>
              las fotografías publicadas pertenecen a sus autores o se
              utilizan con su autorización. Si sos titular de derechos sobre
              alguna imagen publicada y no autorizaste su uso, escribinos a{" "}
              <a
                href={`mailto:${CONTACTO}`}
                className="text-primary underline underline-offset-2"
              >
                {CONTACTO}
              </a>{" "}
              y la retiramos a la brevedad.
            </p>

            <p>
              <strong className="text-on-surface">Propiedad del nombre: </strong>
              &ldquo;Misas Mendoza&rdquo; identifica a este proyecto voluntario. Su uso no
              implica afiliación, patrocinio ni respaldo por parte de la
              Iglesia Católica ni de ninguna institución religiosa.
            </p>
          </div>
        </section>

        {/* ─────────────────────── PRIVACIDAD ─────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-primary mb-4">
            2. Política de privacidad
          </h2>

          <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant">
            <p>
              Esta política describe cómo tratamos los datos personales en
              Misas Mendoza, en línea con la Ley N.º 25.326 de Protección de
              Datos Personales de la República Argentina.
            </p>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Qué datos recopilamos
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-on-surface">Visitantes del sitio público:</strong>{" "}
                  no creamos cuentas ni pedimos datos personales para
                  consultar horarios. Usamos analítica agregada y anónima
                  (Vercel Analytics) para entender el uso general del sitio;
                  no identifica personas individualmente.
                </li>
                <li>
                  <strong className="text-on-surface">
                    Voluntarios y administradores del panel:
                  </strong>{" "}
                  al sumarte como voluntario, guardamos tu email, nombre,
                  rol y el departamento que administrás, para poder darte
                  acceso al panel y contactarte por temas del proyecto.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Para qué los usamos
              </h3>
              <p>
                Únicamente para operar el proyecto: dar acceso al panel de
                administración según el rol correspondiente, coordinar con
                voluntarios y mantener actualizada la información pública del
                sitio. No vendemos, alquilamos ni compartimos estos datos con
                terceros con fines comerciales o publicitarios.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Dónde se alojan los datos
              </h3>
              <p>
                Los datos se almacenan en la infraestructura de Supabase
                (base de datos y autenticación) y el sitio se aloja en
                Vercel. Ambos son proveedores de infraestructura en la nube;
                no acceden al contenido de los datos más allá de lo necesario
                para prestar el servicio de hosting.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Seguridad
              </h3>
              <p>
                El acceso a los datos está restringido por políticas de
                seguridad a nivel de base de datos (Row Level Security):
                cada persona solo puede ver o modificar lo que corresponde a
                su rol y departamento. Las credenciales con acceso completo
                se usan exclusivamente desde el servidor, nunca desde el
                navegador.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Cuánto tiempo conservamos los datos
              </h3>
              <p>
                Mientras la persona sea voluntaria activa del proyecto. Si
                dejás de participar, podés pedir la eliminación de tu cuenta
                y datos asociados escribiendo a{" "}
                <a
                  href={`mailto:${CONTACTO}`}
                  className="text-primary underline underline-offset-2"
                >
                  {CONTACTO}
                </a>
                .
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Tus derechos (acceso, rectificación y supresión)
              </h3>
              <p>
                Como titular de tus datos, tenés derecho a acceder, rectificar,
                actualizar o solicitar la supresión de tu información en
                cualquier momento, así como a retirar tu consentimiento. Para
                ejercer estos derechos, escribinos a{" "}
                <a
                  href={`mailto:${CONTACTO}`}
                  className="text-primary underline underline-offset-2"
                >
                  {CONTACTO}
                </a>
                . La Agencia de Acceso a la Información Pública (AAIP),
                autoridad de control de la Ley N.º 25.326, es el organismo
                ante el cual podés reclamar si considerás que no atendimos tu
                pedido correctamente.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface mb-2">
                Cambios a esta política
              </h3>
              <p>
                Podemos actualizar esta política a medida que el proyecto
                crece. Los cambios importantes se van a reflejar en esta
                misma página, indicando la fecha de la última actualización.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
