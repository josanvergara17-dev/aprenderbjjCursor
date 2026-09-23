"use client";

import { useActionState } from "react";
import {
  submitPracticeAction,
  type SubmissionActionState,
} from "@/app/actions/submissions";
import type { AppRole } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";

const initialState: SubmissionActionState = {};

export function MapPracticeUpload({
  techniqueId,
  techniqueTitle,
  userRole,
}: {
  techniqueId: string;
  techniqueTitle: string;
  userRole: AppRole;
}) {
  const [state, formAction, pending] = useActionState(submitPracticeAction, initialState);

  if (userRole !== "student") {
    return (
      <p className="text-sm text-[#8b949e]">
        Inicia sesión como alumno para enviar tu práctica desde el mapa.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="techniqueId" value={techniqueId} />
      <p className="text-sm text-[#8b949e]">
        Técnica: <span className="text-[#e6edf3]">{techniqueTitle}</span>
      </p>
      <div className="space-y-2">
        <label htmlFor={`map-practice-${techniqueId}`} className="text-sm text-[#8b949e]">
          Vídeo de práctica
        </label>
        <input
          id={`map-practice-${techniqueId}`}
          name="video"
          type="file"
          accept="video/*"
          required
          className="w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-[#00d4ff]/30 bg-[#123044]/50 px-3 py-2 text-sm text-[#00d4ff]">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar para revisión"}
      </Button>
    </form>
  );
}
