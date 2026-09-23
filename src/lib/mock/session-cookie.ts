import type { AppUser } from "@/lib/auth/types";
import { MOCK_SESSION_COOKIE } from "@/lib/auth/types";

function toBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeMockSession(user: AppUser): string {
  return toBase64Url(JSON.stringify(user));
}

export function decodeMockSession(value: string | undefined | null): AppUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<AppUser>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.fullName !== "string" ||
      (parsed.role !== "student" && parsed.role !== "master")
    ) {
      return null;
    }
    return {
      id: parsed.id,
      email: parsed.email,
      fullName: parsed.fullName,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export { MOCK_SESSION_COOKIE };
