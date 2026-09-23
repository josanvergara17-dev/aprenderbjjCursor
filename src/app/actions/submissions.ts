"use server";

import { revalidatePath } from "next/cache";
import { createSubmission, reviewSubmission } from "@/lib/data/submissions";

export type SubmissionActionState = {
  error?: string;
  success?: string;
};

export async function submitPracticeAction(
  _prev: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  try {
    await createSubmission(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo enviar" };
  }
  revalidatePath("/evaluacion");
  return { success: "Vídeo enviado. Pendiente de revisión por el Maestro." };
}

export async function reviewSubmissionAction(
  _prev: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const grade = String(formData.get("grade") ?? "") as "approved" | "needs_improvement";
  const comment = String(formData.get("comment") ?? "");

  if (grade !== "approved" && grade !== "needs_improvement") {
    return { error: "Selecciona una calificación" };
  }

  try {
    await reviewSubmission({ submissionId, grade, comment });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar la revisión" };
  }

  revalidatePath("/evaluacion");
  return { success: "Revisión guardada" };
}
