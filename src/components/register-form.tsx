"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm text-[#8b949e]">
          Nombre
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
          placeholder="Tu nombre"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-[#8b949e]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-[#8b949e]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
        />
      </div>
      <p className="text-xs text-[#8b949e]">
        Si el email contiene «master» o «maestro», el rol será Maestro. El resto son Alumnos.
      </p>
      {state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-[#8b949e]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[#00d4ff] hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
