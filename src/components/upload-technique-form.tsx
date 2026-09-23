"use client";

import { useActionState } from "react";
import { uploadTechniqueAction, type VideoActionState } from "@/app/actions/videos";
import { Button } from "@/components/ui/button";
import { TECHNIQUES } from "@/lib/techniques";

const initialState: VideoActionState = {};

export function UploadTechniqueForm() {
  const [state, formAction, pending] = useActionState(uploadTechniqueAction, initialState);

  return (
    <form action={formAction} className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm text-[#8b949e]">
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
          placeholder="Nombre de la técnica"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="techniqueId" className="text-sm text-[#8b949e]">
          Nodo del mapa (opcional)
        </label>
        <select
          id="techniqueId"
          name="techniqueId"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
          defaultValue=""
        >
          <option value="">Sin enlace</option>
          {TECHNIQUES.map((technique) => (
            <option key={technique.id} value={technique.id}>
              {technique.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="video" className="text-sm text-[#8b949e]">
          Archivo de vídeo
        </label>
        <input
          id="video"
          name="video"
          type="file"
          accept="video/*"
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
        <p className="text-xs text-[#8b949e]">
          En modo mock el archivo es opcional; se usa un vídeo de demostración.
        </p>
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Subiendo…" : "Publicar técnica"}
      </Button>
    </form>
  );
}
