"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />
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
          placeholder="alumno@nogi.lab"
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
          autoComplete="current-password"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
          placeholder="demo1234"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-[#8b949e]">
        ¿Sin cuenta?{" "}
        <Link href="/register" className="text-[#00d4ff] hover:underline">
          Regístrate
        </Link>
      </p>
      <p className="rounded-lg border border-[#21262d] bg-[#161b22] px-3 py-2 text-xs text-[#8b949e]">
        Demo mock: <span className="text-[#e6edf3]">alumno@nogi.lab</span> o{" "}
        <span className="text-[#e6edf3]">maestro@nogi.lab</span> /{" "}
        <span className="text-[#e6edf3]">demo1234</span>
      </p>
    </form>
  );
}
