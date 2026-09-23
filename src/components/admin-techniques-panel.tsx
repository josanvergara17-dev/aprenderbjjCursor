"use client";

import { useActionState } from "react";
import {
  deleteTechniqueAdminAction,
  saveTechniqueAdminAction,
  type AdminTechniqueState,
} from "@/app/actions/admin-techniques";
import type { AdminTechniqueRow } from "@/lib/data/admin-techniques";
import { Button } from "@/components/ui/button";

const initialState: AdminTechniqueState = {};

function TechniqueEditor({ technique }: { technique?: AdminTechniqueRow }) {
  const [state, formAction, pending] = useActionState(saveTechniqueAdminAction, initialState);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="rounded-lg border border-[#21262d] bg-[#0d1117] p-4"
    >
      <h3 className="font-heading mb-4 text-lg tracking-wide text-[#e6edf3] uppercase">
        {technique ? `Editar: ${technique.title}` : "Nueva técnica"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-[#8b949e]">
          ID (slug)
          <input
            name="id"
            required
            defaultValue={technique?.id ?? ""}
            className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          />
        </label>
        <label className="text-sm text-[#8b949e]">
          Título
          <input
            name="title"
            required
            defaultValue={technique?.title ?? ""}
            className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          />
        </label>
        <label className="text-sm text-[#8b949e]">
          Tipo
          <select
            name="type"
            defaultValue={technique?.type ?? "progression"}
            className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          >
            <option value="base_position">Postura base</option>
            <option value="progression">Progresión</option>
            <option value="defense">Defensa</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[#8b949e] sm:mt-6">
          <input name="isVerified" type="checkbox" defaultChecked={technique?.isVerified} />
          Verificada
        </label>
        <label className="text-sm text-[#8b949e]">
          Posición X
          <input
            name="positionX"
            type="number"
            defaultValue={technique?.x ?? 0}
            className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          />
        </label>
        <label className="text-sm text-[#8b949e]">
          Posición Y
          <input
            name="positionY"
            type="number"
            defaultValue={technique?.y ?? 0}
            className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          />
        </label>
      </div>
      <label className="mt-3 block text-sm text-[#8b949e]">
        Descripción
        <textarea
          name="description"
          rows={2}
          defaultValue={technique?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
        />
      </label>
      <label className="mt-3 block text-sm text-[#8b949e]">
        Hijos (IDs separados por coma)
        <input
          name="childIds"
          defaultValue={technique?.childIds.join(", ") ?? ""}
          className="mt-1 w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3]"
          placeholder="americana, escape_codo_rodilla"
        />
      </label>
      <label className="mt-3 block text-sm text-[#8b949e]">
        Foto del círculo (cover)
        <input
          name="cover"
          type="file"
          accept="image/*"
          className="mt-1 w-full text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
        />
      </label>
      {state.error ? <p className="mt-2 text-sm text-red-300">{state.error}</p> : null}
      {state.success ? <p className="mt-2 text-sm text-[#00d4ff]">{state.success}</p> : null}
      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Guardando…" : "Guardar técnica"}
      </Button>
    </form>
  );
}

function DeleteTechniqueButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteTechniqueAdminAction, initialState);
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        Eliminar
      </Button>
      {state.error ? <span className="ml-2 text-xs text-red-300">{state.error}</span> : null}
    </form>
  );
}

export function AdminTechniquesPanel({ techniques }: { techniques: AdminTechniqueRow[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section>
        <h2 className="font-heading mb-3 text-xl tracking-wide text-[#e6edf3] uppercase">
          Técnicas ({techniques.length})
        </h2>
        <ul className="space-y-2">
          {techniques.map((technique) => (
            <li
              key={technique.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                {technique.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={technique.coverImageUrl}
                    alt=""
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="size-10 rounded-full bg-[#161b22]" />
                )}
                <div>
                  <p className="text-sm text-[#e6edf3]">{technique.title}</p>
                  <p className="text-xs text-[#8b949e]">
                    {technique.id} · {technique.type}
                  </p>
                </div>
              </div>
              <DeleteTechniqueButton id={technique.id} />
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-6">
        <TechniqueEditor />
        {techniques.map((technique) => (
          <TechniqueEditor key={technique.id} technique={technique} />
        ))}
      </section>
    </div>
  );
}
