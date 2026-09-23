import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, isMockMode } from "@/lib/supabase/config";

export async function createClient() {
  if (isMockMode()) {
    throw new Error("createClient no está disponible en modo mock");
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // set desde Server Component: el proxy refresca la sesión.
        }
      },
    },
  });
}
