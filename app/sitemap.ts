import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase-public";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://misasmendoza.com.ar";

// Regenerar cada hora para reflejar capillas/eventos nuevos sin redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: lugares }, { data: eventos }] = await Promise.all([
    supabasePublic.from("lugares").select("slug, updated_at").eq("activo", true),
    supabasePublic.from("eventos").select("slug").eq("activo", true),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/eventos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/mapa`, changeFrequency: "weekly", priority: 0.6 },
    ...(lugares ?? []).map((l) => ({
      url: `${BASE_URL}/capilla/${l.slug}`,
      lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(eventos ?? []).map((e) => ({
      url: `${BASE_URL}/eventos/${e.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
