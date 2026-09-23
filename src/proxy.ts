import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AppUser } from "@/lib/auth/types";
import { isReviewerRole } from "@/lib/auth/types";
import { decodeMockSession, MOCK_SESSION_COOKIE } from "@/lib/mock/session-cookie";
import { getSupabaseEnv, isMockMode } from "@/lib/supabase/config";

const PUBLIC_PATHS = new Set(["/login", "/register"]);
const MASTER_ONLY_PREFIXES = ["/videos/subir"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

function isMasterOnly(pathname: string) {
  return MASTER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function readMockUser(request: NextRequest): AppUser | null {
  return decodeMockSession(request.cookies.get(MOCK_SESSION_COOKIE)?.value);
}

async function readSupabaseUser(
  request: NextRequest,
): Promise<{ user: AppUser | null; response: NextResponse }> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, response };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      fullName: profile?.full_name ?? "",
      role: (profile?.role as AppUser["role"] | undefined) ?? "student",
    },
    response,
  };
}

function redirectTo(request: NextRequest, pathname: string, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (next) url.searchParams.set("next", next);
  else url.searchParams.delete("next");
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMockMode()) {
    const user = readMockUser(request);

    if (!user && !isPublicPath(pathname)) {
      return redirectTo(request, "/login", pathname);
    }
    if (user && isPublicPath(pathname)) {
      return redirectTo(request, "/");
    }
    if (user && isMasterOnly(pathname) && !isReviewerRole(user.role)) {
      return redirectTo(request, "/videos");
    }
    return NextResponse.next();
  }

  const { user, response } = await readSupabaseUser(request);

  if (!user && !isPublicPath(pathname)) {
    return redirectTo(request, "/login", pathname);
  }
  if (user && isPublicPath(pathname)) {
    return redirectTo(request, "/");
  }
  if (user && isMasterOnly(pathname) && !isReviewerRole(user.role)) {
    return redirectTo(request, "/videos");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
