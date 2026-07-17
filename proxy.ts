import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side session gate for /admin/* y /login. Renamed from middleware.ts
// to proxy.ts per Next.js 16 conventions (middleware is deprecated).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refreshes the session token if needed — required for getUser() to be reliable.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ground-truth "activo" check con service role, para no depender de RLS
  // acá — corre en cada request a /admin/*, así que una sesión de un
  // voluntario recién desactivado no sigue teniendo acceso al panel.
  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
