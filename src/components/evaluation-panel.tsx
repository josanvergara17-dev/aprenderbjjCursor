"use client";

import { useActionState } from "react";
import {
  reviewSubmissionAction,
  submitPracticeAction,
  type SubmissionActionState,
} from "@/app/actions/submissions";
import type { AppUser, Submission } from "@/lib/auth/types";
import { TECHNIQUES } from "@/lib/techniques";
import { Button } from "@/components/ui/button";

const initialState: SubmissionActionState = {};

function statusLabel(status: Submission["status"]) {
  switch (status) {
    case "pending":
      return "Pendiente de revisión por el Maestro";
    case "approved":
      return "Aprobado";
    case "needs_improvement":
      return "Necesita mejorar";
  }
}

function statusClass(status: Submission["status"]) {
  switch (status) {
    case "pending":
      return "border-[#00d4ff]/40 bg-[#123044]/40 text-[#00d4ff]";
    case "approved":
      return "border-emerald-700/50 bg-emerald-950/40 text-emerald-300";
    case "needs_improvement":
      return "border-amber-700/50 bg-amber-950/40 text-amber-200";
  }
}

function StudentEvaluation({ submissions }: { submissions: Submission[] }) {
  const [state, formAction, pending] = useActionState(submitPracticeAction, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section>
        <h2 className="font-heading text-xl tracking-wide uppercase text-[#e6edf3]">
          Enviar práctica
        </h2>
        <p className="mt-1 mb-4 text-sm text-[#8b949e]">
          Elige la técnica, sube tu vídeo y espera la revisión del maestro.
        </p>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="techniqueId" className="text-sm text-[#8b949e]">
              Técnica
            </label>
            <select
              id="techniqueId"
              name="techniqueId"
              required
              className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona una técnica
              </option>
              {TECHNIQUES.map((technique) => (
                <option key={technique.id} value={technique.id}>
                  {technique.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="video" className="text-sm text-[#8b949e]">
              Vídeo de práctica
            </label>
            <input
              id="video"
              name="video"
              type="file"
              accept="video/*"
              className="w-full rounded-lg border border-[#21262d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] file:mr-3 file:rounded-md file:border-0 file:bg-[#123044] file:px-3 file:py-1.5 file:text-[#00d4ff]"
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
      </section>

      <section>
        <h2 className="font-heading text-xl tracking-wide uppercase text-[#e6edf3]">
          Mis envíos
        </h2>
        <ul className="mt-4 space-y-3">
          {submissions.length === 0 ? (
            <li className="text-sm text-[#8b949e]">Aún no has enviado prácticas.</li>
          ) : (
            submissions.map((submission) => (
              <li
                key={submission.id}
                className="rounded-lg border border-[#21262d] bg-[#0d1117] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#e6edf3]">{submission.techniqueTitle}</p>
                    <p className="text-xs text-[#8b949e]">
                      {new Date(submission.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs ${statusClass(submission.status)}`}
                  >
                    {statusLabel(submission.status)}
                  </span>
                </div>
                {submission.masterComment ? (
                  <p className="mt-3 text-sm text-[#8b949e]">
                    Comentario:{" "}
                    <span className="text-[#e6edf3]">{submission.masterComment}</span>
                  </p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function ReviewCard({ submission }: { submission: Submission }) {
  const [state, formAction, pending] = useActionState(reviewSubmissionAction, initialState);

  return (
    <li className="rounded-lg border border-[#21262d] bg-[#0d1117] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-[#e6edf3]">{submission.techniqueTitle}</p>
          <p className="text-sm text-[#8b949e]">
            {submission.studentName} · {submission.studentEmail}
          </p>
          <p className="text-xs text-[#8b949e]">
            {new Date(submission.createdAt).toLocaleString("es-ES")}
          </p>
        </div>
        <span className={`rounded-md border px-2 py-1 text-xs ${statusClass(submission.status)}`}>
          {statusLabel(submission.status)}
        </span>
      </div>
      <video
        src={submission.videoUrl}
        controls
        className="mb-4 aspect-video w-full rounded-md bg-black"
      />
      {submission.status === "pending" ? (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="submissionId" value={submission.id} />
          <div className="space-y-2">
            <label htmlFor={`comment-${submission.id}`} className="text-sm text-[#8b949e]">
              Comentario
            </label>
            <textarea
              id={`comment-${submission.id}`}
              name="comment"
              required
              rows={3}
              className="w-full rounded-lg border border-[#21262d] bg-[#05080f] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#00d4ff]"
              placeholder="Feedback para el alumno"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              name="grade"
              value="approved"
              disabled={pending}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Aprobado
            </Button>
            <Button
              type="submit"
              name="grade"
              value="needs_improvement"
              disabled={pending}
              variant="outline"
            >
              Necesita mejorar
            </Button>
          </div>
          {state.error ? (
            <p className="text-sm text-red-300">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-[#00d4ff]">{state.success}</p>
          ) : null}
        </form>
      ) : submission.masterComment ? (
        <p className="text-sm text-[#8b949e]">
          Comentario: <span className="text-[#e6edf3]">{submission.masterComment}</span>
        </p>
      ) : null}
    </li>
  );
}

function MasterEvaluation({ submissions }: { submissions: Submission[] }) {
  const pending = submissions.filter((item) => item.status === "pending");
  const reviewed = submissions.filter((item) => item.status !== "pending");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-xl tracking-wide uppercase text-[#e6edf3]">
          Bandeja de revisión
        </h2>
        <p className="mt-1 mb-4 text-sm text-[#8b949e]">
          {pending.length} pendiente{pending.length === 1 ? "" : "s"}
        </p>
        <ul className="space-y-4">
          {pending.length === 0 ? (
            <li className="text-sm text-[#8b949e]">No hay entregas pendientes.</li>
          ) : (
            pending.map((submission) => (
              <ReviewCard key={submission.id} submission={submission} />
            ))
          )}
        </ul>
      </section>
      {reviewed.length > 0 ? (
        <section>
          <h2 className="font-heading text-xl tracking-wide uppercase text-[#e6edf3]">
            Revisadas
          </h2>
          <ul className="mt-4 space-y-4">
            {reviewed.map((submission) => (
              <ReviewCard key={submission.id} submission={submission} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function EvaluationPanel({
  user,
  submissions,
}: {
  user: AppUser;
  submissions: Submission[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-3xl tracking-wide text-[#e6edf3] uppercase">
        Revisión de Técnicas
      </h1>
      <p className="mt-1 mb-8 text-sm text-[#8b949e]">
        {user.role === "master"
          ? "Reproduce la práctica del alumno y deja calificación con comentario."
          : "Sube tu práctica y consulta el estado de la revisión."}
      </p>
      {user.role === "master" ? (
        <MasterEvaluation submissions={submissions} />
      ) : (
        <StudentEvaluation submissions={submissions} />
      )}
    </div>
  );
}
