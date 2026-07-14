import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Misas Mendoza",
    short_name: "Misas MDZ",
    description:
      "Horarios de misas, parroquias, capillas y eventos católicos en Mendoza.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf9ee",
    theme_color: "#476254",
    lang: "es-AR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
