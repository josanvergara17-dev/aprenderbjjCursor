"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { incrementTechniqueVideoViews, uploadTechniqueVideoFile } from "@/lib/data/videos";

export type VideoActionState = {
  error?: string;
  success?: string;
};

export async function uploadTechniqueAction(
  _prev: VideoActionState,
  formData: FormData,
): Promise<VideoActionState> {
  try {
    await uploadTechniqueVideoFile(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir" };
  }
  revalidatePath("/videos");
  redirect("/videos");
}

export async function recordTechniqueVideoViewAction(videoId: string): Promise<void> {
  if (!videoId) return;
  try {
    await incrementTechniqueVideoViews(videoId);
  } catch {
    /* non-blocking analytics */
  }
}
