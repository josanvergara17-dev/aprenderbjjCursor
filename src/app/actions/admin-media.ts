"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  batchUploadTechniqueCovers,
  listAdminMediaRows,
  uploadSingleTechniqueCover,
} from "@/lib/data/admin-media";

export type AdminMediaState = {
  error?: string;
  success?: string;
  batch?: {
    updated: string[];
    skipped: { file: string; reason: string }[];
  };
};

export async function loadAdminMediaPageData() {
  await requireAdmin();
  return listAdminMediaRows();
}

export async function uploadTechniqueCoverAction(
  _prev: AdminMediaState,
  formData: FormData,
): Promise<AdminMediaState> {
  const techniqueId = String(formData.get("techniqueId") ?? "").trim();
  const file = formData.get("cover");
  if (!techniqueId) return { error: "ID de técnica obligatorio" };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen" };
  }

  try {
    await requireAdmin();
    await uploadSingleTechniqueCover(techniqueId, file);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la portada" };
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/techniques");
  revalidatePath("/");
  return { success: `Portada actualizada: ${techniqueId}` };
}

export async function batchUploadCoversAction(
  _prev: AdminMediaState,
  formData: FormData,
): Promise<AdminMediaState> {
  try {
    await requireAdmin();
    const batch = await batchUploadTechniqueCovers(formData);
    revalidatePath("/admin/media");
    revalidatePath("/admin/techniques");
    revalidatePath("/");

    if (batch.updated.length === 0 && batch.skipped.length > 0) {
      return {
        error: "Ninguna portada se actualizó",
        batch,
      };
    }

    return {
      success: `${batch.updated.length} portada(s) actualizada(s)`,
      batch,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error en lote" };
  }
}
