"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  batchUploadCoversAction,
  uploadTechniqueCoverAction,
  type AdminMediaState,
} from "@/app/actions/admin-media";
import type { AdminMediaRow } from "@/lib/data/admin-media";
import { Button } from "@/components/ui/button";

const initialState: AdminMediaState = {};

function videoStatusLabel(row: AdminMediaRow): string {
  if (!row.video) return "Sin vídeo";
  switch (row.video.processingStatus) {
    case "pending_upload":
      return "Pendiente de subida";
    case "processing":
      return "Procesando (Mux)";
    case "error":
      return "Error";
    default:
      return row.video.streamKind === "mux" ? "Listo (Mux)" : "Listo";
  }
}

function BatchCoverForm() {
  const [state, formAction, pending] = useActionState(batchUploadCoversAction, initialState);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="rounded-lg border border-[#21262d] bg-[#0d1117] p-4"
    >
      <h2 className="font-heading mb-2 text-lg tracking-wide text-[#e6edf3] uppercase">
        Portadas en lote
      </h2>
      <p className="mb-4 text-sm text-[#8b949e]">
        Nombra cada JPG como el <strong className="text-[#e6edf3]">id</strong> del nodo (
        <code className="text-[#00d4ff]">americana.jpg</code>
        ). Opcional: CSV con columnas{" "}
        <code className="text-[#00d4ff]">technique_id,filename</code>.
      </p>
      <label className="block text-sm text-[#8b949e]">
        Imágenes (varias)
        <input
          name="covers"
          type="file"
          accept="image/*"
          multiple
          required
          className="mt-1 w-full text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
      </label>
      <label className="mt-3 block text-sm text-[#8b949e]">
        CSV (opcional)
        <input
          name="csv"
          type="file"
          accept=".csv,text/csv"
          className="mt-1 w-full text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
      </label>
      <label className="mt-3 block text-sm text-[#8b949e]">
        O pega CSV aquí
        <textarea
          name="csvText"
          rows={3}
          placeholder={"technique_id,filename\namericana,IMG_001.jpg"}
          className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 font-mono text-xs text-[#e6edf3]"
        />
      </label>
      {state.error ? <p className="mt-2 text-sm text-red-300">{state.error}</p> : null}
      {state.success ? <p className="mt-2 text-sm text-[#00d4ff]">{state.success}</p> : null}
      {state.batch?.skipped.length ? (
        <ul className="mt-2 max-h-32 overflow-y-auto text-xs text-amber-200">
          {state.batch.skipped.map((item) => (
            <li key={`${item.file}-${item.reason}`}>
              {item.file}: {item.reason}
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Subiendo…" : "Importar portadas"}
      </Button>
    </form>
  );
}

function RowCoverForm({ row }: { row: AdminMediaRow }) {
  const [state, formAction, pending] = useActionState(uploadTechniqueCoverAction, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="techniqueId" value={row.id} />
      <input
        name="cover"
        type="file"
        accept="image/*"
        className="max-w-[11rem] text-xs text-[#e6edf3] file:mr-2 file:rounded file:border-0 file:bg-[#123044] file:px-2 file:py-1 file:text-[#00d4ff]"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "…" : "Cover"}
      </Button>
      {state.error ? <span className="text-xs text-red-300">{state.error}</span> : null}
      {state.success ? <span className="text-xs text-[#00d4ff]">OK</span> : null}
    </form>
  );
}

export function AdminMediaPanel({ rows, supabaseRequired }: { rows: AdminMediaRow[]; supabaseRequired: boolean }) {
  return (
    <div className="space-y-8">
      {supabaseRequired ? (
        <p className="rounded-lg border border-amber-800/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          Modo mock: vista previa de la tabla. Para importar portadas, usa Supabase real (
          <code className="text-amber-50">NEXT_PUBLIC_USE_MOCK_AUTH=false</code>) y migración 003.
        </p>
      ) : null}

      {!supabaseRequired ? <BatchCoverForm /> : null}

      <section>
        <h2 className="font-heading mb-3 text-xl tracking-wide text-[#e6edf3] uppercase">
          Por técnica ({rows.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[#21262d]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#161b22] text-xs text-[#8b949e] uppercase">
              <tr>
                <th className="px-3 py-2">Cover</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Título</th>
                <th className="px-3 py-2">Vídeo</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#21262d] bg-[#0d1117]">
                  <td className="px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.coverImageUrl}
                      alt=""
                      className="size-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[#8b949e]">{row.id}</td>
                  <td className="px-3 py-2 text-[#e6edf3]">{row.title}</td>
                  <td className="px-3 py-2 text-xs text-[#8b949e]">
                    {row.video ? (
                      <span title={row.video.title}>{videoStatusLabel(row)}</span>
                    ) : (
                      videoStatusLabel(row)
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {!supabaseRequired ? <RowCoverForm row={row} /> : null}
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/videos/subir?techniqueId=${encodeURIComponent(row.id)}`}>
                          Subir vídeo
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
