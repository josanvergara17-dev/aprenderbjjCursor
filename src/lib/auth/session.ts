import { cookies } from "next/headers";
import type { AppUser } from "@/lib/auth/types";
import { isReviewerRole } from "@/lib/auth/types";
import { decodeMockSession, MOCK_SESSION_COOKIE } from "@/lib/mock/session-cookie";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<AppUser | null> {
  if (isMockMode()) {
    const cookieStore = await cookies();
    return decodeMockSession(cookieStore.get(MOCK_SESSION_COOKIE)?.value);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? "",
      role: "student",
    };
  }

  return {
    id: profile.id as string,
    email: profile.email as string,
    fullName: (profile.full_name as string) ?? "",
    role: profile.role as AppUser["role"],
  };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return user;
}

export async function requireMaster(): Promise<AppUser> {
  const user = await requireUser();
  if (!isReviewerRole(user.role)) {
    throw new Error("Solo el maestro puede hacer esto");
  }
  return user;
}
