import type { Metadata } from "next";
import Link from "next/link";
import { Church, Download, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Guía del voluntario | Misas Mendoza",
  description:
    "Guía paso a paso para voluntarios de Misas Mendoza: cómo entrar al panel, editar capillas y horarios, cargar capillas nuevas, verificar datos y publicar eventos.",
  openGraph: {
    title: "Guía del voluntario | Misas Mendoza",
    description:
      "Todo lo que necesitás saber para mantener actualizada la información de las capillas de tu zona.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

type NotaTipo = "info" | "warning" | "tip";

const NOTA_BORDE: Record<NotaTipo, string> = {
  info: "border-primary",
  warning: "border-error",
  tip: "border-tertiary",
};

function Nota({
  tipo,
  titulo,
  children,
}: {
  tipo: NotaTipo;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border-l-4 bg-secondary-container p-4 ${NOTA_BORDE[tipo]}`}
    >
      <p className="text-sm font-semibold text-on-surface">{titulo}</p>
      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
        {children}
      </p>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  children,
  tip,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
  tip?: string;
}) {
  return (
    <div className="flex gap-4 border-b border-outline-variant/40 py-4 last:border-b-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
        {numero}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-on-surface">{titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
          {children}
        </p>
        {tip && (
          <p className="mt-1.5 text-xs italic text-primary">{tip}</p>
        )}
      </div>
    </div>
  );
}

function Badge({ tono, children }: { tono: "editor" | "admin" | "both"; children: React.ReactNode }) {
  const clases =
    tono === "editor"
      ? "bg-secondary-container text-on-secondary-container"
      : tono === "admin"
        ? "bg-primary-container/20 text-primary"
        : "bg-surface-container-high text-on-surface-variant";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${clases}`}>
      {children}
    </span>
  );
}

function SeccionHeader({ numero, titulo, subtitulo }: { numero: string; titulo: string; subtitulo: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{numero}</p>
      <h2 className="mt-1 text-xl font-semibold text-on-surface">{titulo}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">{subtitulo}</p>
    </div>
  );
}

export default function GuiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <div className="flex items-center gap-2">
        <Church className="h-6 w-6 text-primary" strokeWidth={1.75} />
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          Guía para voluntarios
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-semibold text-on-surface md:text-3xl">
        Bienvenido al equipo de Misas Mendoza
      </h1>
      <p className="mt-2 italic text-on-surface-variant">
        Todo lo que necesitás saber para mantener actualizada la información
        de las capillas de tu zona.
      </p>

      <div className="mt-6">
        <Nota tipo="info" titulo="¿Qué es Misas Mendoza?">
          Una plataforma web gratuita donde cualquier persona puede encontrar
          los horarios de misas, confesiones y eventos de las capillas de la
          Arquidiócesis de Mendoza. Vos sos parte del equipo que mantiene esa
          información actualizada.
        </Nota>
      </div>

      <section className="mt-8">
        <p className="text-sm font-semibold text-on-surface">Tu rol en el equipo</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5">
            <Badge tono="editor">Editor</Badge>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Podés proponer cambios en las capillas de tu departamento. Tus
              propuestas las revisa el Admin antes de publicarse. Ideal para
              voluntarios parroquiales.
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant/50 bg-secondary-container p-5">
            <Badge tono="admin">Admin Departamental</Badge>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Podés editar directamente las capillas de tu departamento y
              aprobar o rechazar las propuestas de los editores de tu zona.
            </p>
          </div>
        </div>
      </section>

      {/* 01 — Primeros pasos */}
      <section className="mt-12">
        <SeccionHeader
          numero="01 — Primeros pasos"
          titulo="Cómo entrar al panel"
          subtitulo="Todo lo que necesitás para empezar"
        />

        <div className="rounded-xl border border-outline-variant/50 bg-secondary-container/40 px-5">
          <Paso numero={1} titulo="Entrá a misasmendoza.com.ar/login">
            Desde cualquier celular o computadora, abrí el navegador y
            escribí esa dirección. También podés instalar la app en tu
            celular tocando &ldquo;Agregar a pantalla de inicio&rdquo; en el
            menú del navegador.
          </Paso>
          <Paso numero={2} titulo="Ingresá con tu email y contraseña">
            El administrador te creó un usuario con tu email. Si es la
            primera vez, usá la contraseña que te enviaron. Si no la
            recordás, escribile a soporte@misasmendoza.com.ar.
          </Paso>
          <Paso numero={3} titulo="Explorá el panel">
            Una vez adentro vas a ver el menú con las secciones: Capillas,
            Eventos, Mensajes y (si sos Admin) Solicitudes. En el dashboard
            inicial ves un resumen de las capillas de tu zona.
          </Paso>
        </div>

        <div className="mt-4">
          <Nota tipo="warning" titulo="Importante sobre la sesión">
            Si dejás el panel abierto sin usarlo por más de 1 hora, la sesión
            se cierra automáticamente. Esto es para proteger los datos. Solo
            volvé a hacer login y continuá donde estabas.
          </Nota>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-on-surface">El panel en un vistazo</h3>
        <div className="mt-3 overflow-x-auto rounded-xl border border-outline-variant/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-2.5 font-medium">Sección</th>
                <th className="px-4 py-2.5 font-medium">Para qué sirve</th>
                <th className="px-4 py-2.5 font-medium">Quién lo ve</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              {[
                ["Dashboard", "Resumen de capillas de tu zona y alertas", "both"],
                ["Capillas", "Ver, editar y gestionar las capillas", "both"],
                ["Eventos", "Publicar avisos y actividades", "both"],
                ["Mensajes", "Ver reportes de la comunidad", "admin"],
                ["Solicitudes", "Aprobar o rechazar propuestas de editores", "admin"],
                ["Voluntarios", "Gestionar el equipo", "admin"],
              ].map(([nombre, desc, tono]) => (
                <tr key={nombre} className="border-t border-outline-variant/30">
                  <td className="px-4 py-2.5 font-medium text-on-surface">{nombre}</td>
                  <td className="px-4 py-2.5">{desc}</td>
                  <td className="px-4 py-2.5">
                    <Badge tono={tono as "editor" | "admin" | "both"}>
                      {tono === "both" ? "Todos" : tono === "admin" ? "Admin" : "Editor"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 02 — Capillas */}
      <section className="mt-12">
        <SeccionHeader
          numero="02 — Capillas"
          titulo="Editar una capilla"
          subtitulo="Cómo actualizar los datos de una capilla de tu zona"
        />

        <p className="text-sm leading-relaxed text-on-surface-variant">
          Esta es tu tarea principal. Cada capilla tiene datos básicos
          (nombre, dirección, teléfono) y horarios de misa. Lo más importante
          es mantener los horarios actualizados.
        </p>

        <h3 className="mt-6 text-sm font-semibold text-on-surface">Para editar una capilla existente</h3>
        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-secondary-container/40 px-5">
          <Paso numero={1} titulo="Andá a Capillas en el menú">
            Vas a ver la lista de todas las capillas de tu departamento.
            Podés buscar por nombre en el campo de búsqueda.
          </Paso>
          <Paso numero={2} titulo="Hacé click en el ícono de lápiz (Editar)">
            Se abre el formulario con todos los datos de la capilla. Podés
            modificar nombre, dirección, teléfono, email, descripción y foto.
          </Paso>
          <Paso
            numero={3}
            titulo="Guardá los cambios"
            tip="Editor: tus cambios importantes van a aprobación del Admin antes de publicarse. Admin: los cambios se publican directamente."
          >
            Hacé click en &ldquo;Guardar Capilla&rdquo; al final del
            formulario.
          </Paso>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-on-surface">Para editar los horarios de misa</h3>
        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-secondary-container/40 px-5">
          <Paso numero={1} titulo="En la lista de capillas, hacé click en el ícono de reloj (Horarios)">
            Se abre la página de horarios de esa capilla específica.
          </Paso>
          <Paso numero={2} titulo="Revisá los horarios existentes">
            Vas a ver una tabla con todos los horarios cargados. Si alguno
            está mal, podés eliminarlo con el botón de papelera.
          </Paso>
          <Paso
            numero={3}
            titulo="Agregá los horarios correctos"
            tip="Si la misa es el «1° domingo del mes», usá el campo Observación para aclararlo."
          >
            Usá el formulario de abajo para agregar cada horario: elegí el
            día, la hora, el tipo de actividad (Misa, Adoración, etc.) y la
            temporada (Todo el año, Verano, Invierno).
          </Paso>
        </div>

        <div className="mt-4">
          <Nota tipo="tip" titulo="Temporadas">
            Muchas capillas tienen horarios diferentes en verano
            (enero-febrero) e invierno. Podés cargar los dos por separado
            usando el campo &ldquo;Temporada&rdquo;. Ojo: el cambio no es
            automático — cuando la parroquia te avise que cambia de horario,
            entrá a Horarios y tocá el botón &ldquo;Invierno&rdquo; o
            &ldquo;Verano&rdquo; en &ldquo;Temporada vigente&rdquo; para
            activarla.
          </Nota>
        </div>
      </section>

      {/* 03 — Crear y verificar */}
      <section className="mt-12">
        <SeccionHeader
          numero="03 — Crear y verificar"
          titulo="Agregar una capilla nueva y verificar datos"
          subtitulo="Cómo sumar una capilla que falta y marcar datos confirmados"
        />

        <h3 className="text-sm font-semibold text-on-surface">Para agregar una capilla que no está en la lista</h3>
        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-secondary-container/40 px-5">
          <Paso numero={1} titulo='Hacé click en "+ Agregar capilla"'>
            Está en la esquina superior derecha de la sección Capillas.
          </Paso>
          <Paso numero={2} titulo="Completá el formulario">
            Los campos obligatorios son: nombre, tipo (parroquia/capilla/santuario),
            departamento y dirección. El resto es opcional pero muy útil:
            teléfono, email, descripción y foto.
          </Paso>
          <Paso
            numero={3}
            titulo="Marcá la ubicación en el mapa"
            tip="Abrí Google Maps en otra pestaña, buscá la capilla y usá esas coordenadas como referencia."
          >
            Hacé click en el mapa para poner el pin exactamente donde está la
            capilla. Esto es importante para que aparezca correctamente en la
            búsqueda por cercanía.
          </Paso>
          <Paso numero={4} titulo="Guardá — va a revisión">
            Si sos Editor, tu propuesta va al Admin para aprobación. Si sos
            Admin, se publica directamente y podés cargar los horarios
            enseguida.
          </Paso>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-on-surface">Estado de verificación</h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Cada capilla tiene un estado que indica si sus datos fueron
          confirmados con la parroquia real:
        </p>

        <div className="mt-3 overflow-x-auto rounded-xl border border-outline-variant/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5 font-medium">Qué significa</th>
                <th className="px-4 py-2.5 font-medium">Qué hacer</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <tr className="border-t border-outline-variant/30">
                <td className="px-4 py-2.5 font-medium text-on-surface">Sin verificar</td>
                <td className="px-4 py-2.5">Datos importados automáticamente, sin confirmar</td>
                <td className="px-4 py-2.5">Llamar a la parroquia y confirmar los horarios</td>
              </tr>
              <tr className="border-t border-outline-variant/30">
                <td className="px-4 py-2.5 font-medium text-on-surface">En revisión</td>
                <td className="px-4 py-2.5">Alguien está trabajando en verificarla</td>
                <td className="px-4 py-2.5">Marcarla así mientras la estás revisando</td>
              </tr>
              <tr className="border-t border-outline-variant/30">
                <td className="px-4 py-2.5 font-medium text-on-surface">Verificada</td>
                <td className="px-4 py-2.5">Datos confirmados con la parroquia</td>
                <td className="px-4 py-2.5">Marcarla así una vez confirmado todo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Nota tipo="info" titulo="Cómo verificar una capilla">
            Lo ideal es llamar directamente al teléfono de la parroquia y
            confirmar: horarios de misa (incluyendo cambios de verano),
            horario de secretaría, si hay confesiones y cuándo. Con esa
            info, actualizás los datos y marcás la capilla como
            &ldquo;Verificada&rdquo;.
          </Nota>
        </div>
      </section>

      {/* 04 — Eventos y mensajes */}
      <section className="mt-12">
        <SeccionHeader
          numero="04 — Eventos y mensajes"
          titulo="Publicar eventos y atender mensajes"
          subtitulo="Cómo mantener la comunidad informada"
        />

        <h3 className="text-sm font-semibold text-on-surface">Publicar un evento o aviso</h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          En la sección Eventos podés publicar actividades de jóvenes,
          retiros, misas especiales y cualquier aviso importante para tu
          zona.
        </p>

        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-secondary-container/40 px-5">
          <Paso numero={1} titulo='Andá a Eventos → "+ Agregar"'>
            Se abre el formulario de nuevo evento.
          </Paso>
          <Paso numero={2} titulo="Completá los datos del evento">
            Título, tipo (Jóvenes / Aviso / Especial), departamento,
            descripción y fecha. Podés vincular el evento a una capilla
            específica si querés.
          </Paso>
          <Paso numero={3} titulo="Publicá">
            Si sos Editor, va a revisión del Admin. Si sos Admin, se publica
            directamente en la app pública.
          </Paso>
        </div>

        <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold text-on-surface">
          Mensajes de la comunidad <Badge tono="admin">Solo Admin</Badge>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          En la sección Mensajes aparecen los reportes y sugerencias que
          manda la gente desde el sitio público. Hay dos tipos:
        </p>

        <div className="mt-3 overflow-x-auto rounded-xl border border-outline-variant/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Qué es</th>
                <th className="px-4 py-2.5 font-medium">Qué hacer</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-variant">
              <tr className="border-t border-outline-variant/30">
                <td className="px-4 py-2.5 font-medium text-on-surface">Sugerencia</td>
                <td className="px-4 py-2.5">Comentario general sobre la app</td>
                <td className="px-4 py-2.5">Leer, marcar como leído o respondido</td>
              </tr>
              <tr className="border-t border-outline-variant/30">
                <td className="px-4 py-2.5 font-medium text-on-surface">Error en horario</td>
                <td className="px-4 py-2.5">Alguien reportó un horario incorrecto</td>
                <td className="px-4 py-2.5">Verificar y corregir el horario de la capilla mencionada</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Nota tipo="tip" titulo="Los errores reportados son oro">
            Cuando alguien se toma el tiempo de reportar un error en un
            horario, significa que intentó ir a misa y encontró algo mal.
            Priorizá estos mensajes y corregí el horario lo antes posible.
          </Nota>
        </div>
      </section>

      {/* 05 — Contacto */}
      <section className="mt-12">
        <SeccionHeader
          numero="05 — Checklist y contacto"
          titulo="Contacto y soporte"
          subtitulo="¿Necesitás ayuda o tenés alguna duda?"
        />

        <Nota tipo="info" titulo="¿Necesitás ayuda?">
          Si tenés dudas sobre cómo usar el panel, encontrás un error o
          querés reportar algo, escribinos a soporte@misasmendoza.com.ar o
          contactá al administrador de tu decanato. Estamos para ayudarte.
        </Nota>

        <div className="mt-6 rounded-xl border border-outline-variant/50 bg-secondary-container p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            Datos útiles
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-on-surface-variant">Sitio público</p>
              <p className="text-sm font-medium text-on-surface">misasmendoza.com.ar</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Panel admin</p>
              <p className="text-sm font-medium text-on-surface">misasmendoza.com.ar/admin</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Soporte</p>
              <p className="text-sm font-medium text-on-surface">soporte@misasmendoza.com.ar</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Login</p>
              <p className="text-sm font-medium text-on-surface">misasmendoza.com.ar/login</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <a
          href="/guia-voluntarios.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary hover:underline"
        >
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Descargar versión imprimible
        </a>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
