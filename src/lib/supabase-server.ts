import { createClient } from "@supabase/supabase-js";

// Returns null when env vars aren't configured (local dev without .env.local)
// so all callers gracefully fall back to the in-memory store.
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer service role key (bypasses RLS) for server-side mutations;
  // fall back to anon key (works with the permissive policies below).
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project")) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
