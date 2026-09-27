// URL canónica del sitio. El dominio sin www redirige (308) a www en Vercel,
// y el sitio también responde en misas-mendoza.vercel.app: todo lo que se le
// informa a Google (sitemap, robots, canonical, JSON-LD) tiene que usar esta
// URL, si no Google ve redirecciones o copias duplicadas en vez de la página.
//
// Está fija a propósito (sin variable de entorno): en los previews de Vercel
// también queremos que la canónica apunte a producción.
export const SITE_URL = "https://www.misasmendoza.com.ar";
