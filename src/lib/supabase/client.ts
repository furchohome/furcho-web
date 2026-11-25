import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase public key. Supports the new publishable key (sb_publishable_...)
 * and falls back to the legacy anon key for older projects.
 */
export function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    undefined
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();
  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("your-project-id") &&
      !key.startsWith("your-")
  );
}

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!
  );
}
