import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie-based client (instead of plain createClient/localStorage) so the
// session is also readable server-side, by proxy.ts and Server Components/Actions.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
