import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function buscarEnWikimedia(nombre, departamento) {
  const query = nombre.replace(/Parroquia|Capilla|Santuario|Basílica/gi, "").trim();
  const searchQuery = `${query} ${departamento} Mendoza Argentina`;

  const url =
    `https://commons.wikimedia.org/w/api.php?` +
    `action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
    `&gsrnamespace=6&prop=imageinfo&iiprop=url|thumburl|extmetadata` +
    `&iiurlwidth=800&format=json&origin=*`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MisasMendoza/1.0 (misasmendoza.com.ar)" },
    });
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const firstPage = Object.values(pages)[0];
    return firstPage?.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const { data: capillas } = await supabase
    .from("lugares")
    .select("id, nombre, tipo, departamento, direccion, lat, lng, imagen_url")
    .is("imagen_url", null)
    .order("departamento", { ascending: true })
    .order("nombre", { ascending: true });

  console.log(`Buscando imágenes para ${capillas.length} capillas sin foto...`);

  const resultados = [];

  for (const c of capillas) {
    // Respetar rate limit razonable de la API de Wikimedia.
    await new Promise((r) => setTimeout(r, 500));

    const imgUrl = await buscarEnWikimedia(c.nombre, c.departamento);

    resultados.push({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      departamento: c.departamento,
      direccion: c.direccion,
      lat: c.lat,
      lng: c.lng,
      imagen_encontrada: imgUrl,
      streetview:
        c.lat && c.lng
          ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${c.lat},${c.lng}`
          : null,
    });

    const icono = imgUrl ? "✅" : "❌";
    console.log(`${icono} ${c.nombre}`);
  }

  const encontradas = resultados.filter((r) => r.imagen_encontrada).length;
  console.log(`\n${encontradas}/${capillas.length} imágenes encontradas`);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Revisión de imágenes — Misas Mendoza</title>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f2eee3; }
    h1 { color: #476254; }
    .stats { background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card img { width: 100%; height: 200px; object-fit: cover; background: #e9dec8; }
    .card-body { padding: 12px; }
    .card-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1c1c15; }
    .card-sub { font-size: 12px; color: #727974; margin-bottom: 8px; }
    .badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600; margin-right: 4px; }
    .badge-par { background: #ccead8; color: #052016; }
    .badge-cap { background: #ece1cb; color: #201b0e; }
    .badge-san { background: #e1e4d8; color: #191d16; }
    .no-img { display: flex; align-items: center; justify-content: center; height: 200px; background: #e9dec8; color: #727974; font-size: 13px; }
    .links { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #c2c8c2; color: #476254; text-decoration: none; background: #f7f3e8; }
    .sql-box { font-family: monospace; font-size: 11px; background: #f0f0f0; padding: 8px; border-radius: 4px; margin-top: 8px; word-break: break-all; user-select: all; cursor: pointer; }
    .sin-imagen { opacity: 0.6; }
  </style>
</head>
<body>
  <h1>Revisión de imágenes — Misas Mendoza</h1>
  <div class="stats">
    <strong>${encontradas}</strong> imágenes encontradas de <strong>${capillas.length}</strong> capillas sin foto
    (${Math.round((encontradas / capillas.length) * 100)}%)
  </div>
  <div class="grid">
    ${resultados
      .map(
        (r) => `
    <div class="card ${r.imagen_encontrada ? "" : "sin-imagen"}">
      ${
        r.imagen_encontrada
          ? `<img src="${r.imagen_encontrada}" alt="${r.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-img>Imagen no cargó</div>'">`
          : `<div class="no-img">Sin imagen encontrada</div>`
      }
      <div class="card-body">
        <div class="card-title">${r.nombre}</div>
        <div class="card-sub">
          <span class="badge badge-${r.tipo === "parroquia" ? "par" : r.tipo === "santuario" ? "san" : "cap"}">${r.tipo}</span>
          ${r.departamento}
        </div>
        <div class="links">
          ${r.streetview ? `<a class="btn" href="${r.streetview}" target="_blank">📍 Street View</a>` : ""}
          <a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(r.nombre + " " + r.departamento + " Mendoza")}&tbm=isch" target="_blank">🔍 Buscar imagen</a>
        </div>
        ${
          r.imagen_encontrada
            ? `
        <div class="sql-box" onclick="navigator.clipboard.writeText(this.innerText)" title="Click para copiar">
UPDATE lugares SET imagen_url='${r.imagen_encontrada}' WHERE id='${r.id}';
        </div>`
            : ""
        }
      </div>
    </div>
    `,
      )
      .join("")}
  </div>
</body>
</html>`;

  writeFileSync("scripts/revision-imagenes.html", html);
  console.log("\n✅ Archivo generado: scripts/revision-imagenes.html");
  console.log("Abrilo en el navegador para revisar las imágenes propuestas.");
}

main().catch(console.error);
