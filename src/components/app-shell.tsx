"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { AppUser } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Mapa" },
  { href: "/videos", label: "Vídeos" },
  { href: "/evaluacion", label: "Evaluación" },
] as const;

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-[#21262d] bg-[#0d1117]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/" className="font-heading text-xl tracking-wide text-[#e6edf3] uppercase">
              No-Gi Lab
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-[#123044] text-[#00d4ff]"
                        : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs sm:text-sm">
              <p className="text-[#e6edf3]">{user.fullName || user.email}</p>
              <p className="text-[#8b949e]">
                {user.role === "master" ? "Maestro" : "Alumno"}
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
