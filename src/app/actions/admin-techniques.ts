"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  deleteTechniqueAdmin,
  listTechniquesAdmin,
  upsertTechniqueAdmin,
} from "@/lib/data/admin-techniques";

export type AdminTechniqueState = {
  error?: string;
  success?: string;
};

export async function saveTechniqueAdminAction(
  _prev: AdminTechniqueState,
  formData: FormData,
): Promise<AdminTechniqueState> {
  try {
    await requireAdmin();
    await upsertTechniqueAdmin(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar" };
  }
  revalidatePath("/admin/techniques");
  revalidatePath("/");
  return { success: "Técnica guardada" };
}

export async function deleteTechniqueAdminAction(
  _prev: AdminTechniqueState,
  formData: FormData,
): Promise<AdminTechniqueState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "ID obligatorio" };
  try {
    await requireAdmin();
    await deleteTechniqueAdmin(id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo eliminar" };
  }
  revalidatePath("/admin/techniques");
  revalidatePath("/");
  return { success: "Técnica eliminada" };
}

export async function loadAdminTechniquesPageData() {
  await requireAdmin();
  return listTechniquesAdmin();
}
