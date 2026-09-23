"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateMockUser, registerMockUser } from "@/lib/mock/store";
import { encodeMockSession, MOCK_SESSION_COOKIE } from "@/lib/mock/session-cookie";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function safeNextPath(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

async function setMockSessionCookie(user: {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "master";
}) {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, encodeMockSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios" };
  }

  if (isMockMode()) {
    const user = authenticateMockUser(email, password);
    if (!user) return { error: "Credenciales incorrectas" };
    await setMockSessionCookie(user);
    redirect(next);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect(next);
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios" };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  if (isMockMode()) {
    let user;
    try {
      user = registerMockUser({ email, password, fullName });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo registrar" };
    }
    await setMockSessionCookie(user);
    redirect("/");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) return { error: error.message };
  redirect("/");
}

export async function logoutAction() {
  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_SESSION_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
