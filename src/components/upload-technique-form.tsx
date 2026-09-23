"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadTechniqueAction, type VideoActionState } from "@/app/actions/videos";
import { TECHNIQUES } from "@/lib/techniques";
import { Button } from "@/components/ui/button";

const initialState: VideoActionState = {};

function LegacyUploadForm() {
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

function MuxUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [techniqueId, setTechniqueId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!file) {
      setError("Selecciona un archivo de vídeo");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/mux/direct-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), techniqueId: techniqueId.trim() }),
      });
      const payload = (await response.json()) as { error?: string; uploadUrl?: string };
      if (!response.ok || !payload.uploadUrl) {
        throw new Error(payload.error ?? "No se pudo preparar la subida");
      }

      const uploadResponse = await fetch(payload.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "video/mp4" },
      });
      if (!uploadResponse.ok) {
        throw new Error("Error al subir el archivo a Mux");
      }

      router.push("/videos?processing=1");
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error de subida");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-4">
      <p className="rounded-lg border border-[#21262d] bg-[#161b22] px-3 py-2 text-sm text-[#8b949e]">
        Clases oficiales en <strong className="text-[#e6edf3]">Mux</strong> (HLS adaptativo).
      </p>
      <div className="space-y-2">
        <label htmlFor="mux-title" className="text-sm text-[#8b949e]">
          Título
        </label>
        <input
          id="mux-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="mux-techniqueId" className="text-sm text-[#8b949e]">
          Nodo del mapa (opcional)
        </label>
        <select
          id="mux-techniqueId"
          value={techniqueId}
          onChange={(event) => setTechniqueId(event.target.value)}
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
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
        <label htmlFor="mux-video" className="text-sm text-[#8b949e]">
          Archivo de vídeo
        </label>
        <input
          id="mux-video"
          type="file"
          accept="video/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Subiendo a Mux…" : "Publicar técnica (Mux)"}
      </Button>
    </form>
  );
}

export function UploadTechniqueForm({ muxEnabled }: { muxEnabled: boolean }) {
  return muxEnabled ? <MuxUploadForm /> : <LegacyUploadForm />;
}
