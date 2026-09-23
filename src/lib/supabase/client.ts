import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isMockMode } from "@/lib/supabase/config";

export function createClient() {
  if (isMockMode()) {
    throw new Error("createClient no está disponible en modo mock");
  }
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
