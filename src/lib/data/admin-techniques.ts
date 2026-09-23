import { requireAdmin } from "@/lib/auth/session";
import type { Technique } from "@/lib/techniques";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminTechniqueRow = Technique & { childIds: string[] };

function mapDbType(value: string): Technique["type"] {
  if (value === "base_position" || value === "progression" || value === "defense") {
    return value;
  }
  return "progression";
}

export async function listTechniquesAdmin(): Promise<AdminTechniqueRow[]> {
  await requireAdmin();

  if (isMockMode()) {
    const { TECHNIQUES } = await import("@/lib/techniques");
    return TECHNIQUES.map((technique) => ({
      ...technique,
      childIds: [...technique.children],
    }));
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("techniques").select("*").order("name");
  if (error) throw new Error(error.message);

  const { data: connections } = await supabase
    .from("technique_connections")
    .select("source_technique_id, target_technique_id");

  const childrenBySource = new Map<string, string[]>();
  for (const edge of connections ?? []) {
    const source = String(edge.source_technique_id);
    const target = String(edge.target_technique_id);
    const list = childrenBySource.get(source) ?? [];
    list.push(target);
    childrenBySource.set(source, list);
  }

  return (rows ?? []).map((row) => {
    const id = String(row.id);
    return {
      id,
      title: String(row.name),
      description: (row.description as string | null) ?? undefined,
      type: mapDbType(String(row.type)),
      videoUrl: "",
      children: childrenBySource.get(id) ?? [],
      childIds: childrenBySource.get(id) ?? [],
      x: Number(row.position_x ?? 0),
      y: Number(row.position_y ?? 0),
      isVerified: Boolean(row.is_verified),
      coverImageUrl: (row.cover_image_url as string | null) ?? undefined,
    };
  });
}

export async function upsertTechniqueAdmin(formData: FormData): Promise<void> {
  await requireAdmin();
  if (isMockMode()) {
    throw new Error("El panel admin requiere Supabase (desactiva USE_MOCK_AUTH)");
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "progression");
  const description = String(formData.get("description") ?? "").trim();
  const isVerified = formData.get("isVerified") === "on";
  const x = Number(formData.get("positionX") ?? 0);
  const y = Number(formData.get("positionY") ?? 0);
  const childIds = String(formData.get("childIds") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const coverFile = formData.get("cover");

  if (!id || !title) throw new Error("ID y título son obligatorios");

  const supabase = await createClient();
  let coverImageUrl: string | null = null;

  if (coverFile instanceof File && coverFile.size > 0) {
    const path = `${id}/${Date.now()}-${coverFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("technique-covers")
      .upload(path, coverFile, { contentType: coverFile.type || "image/jpeg", upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from("technique-covers").getPublicUrl(path);
    coverImageUrl = publicUrl;
  }

  const patch: Record<string, unknown> = {
    id,
    name: title,
    description,
    type,
    is_verified: isVerified,
    position_x: x,
    position_y: y,
  };
  if (coverImageUrl) patch.cover_image_url = coverImageUrl;

  const { error: upsertError } = await supabase.from("techniques").upsert(patch);
  if (upsertError) throw new Error(upsertError.message);

  await supabase.from("technique_connections").delete().eq("source_technique_id", id);
  if (childIds.length > 0) {
    const { error: connError } = await supabase.from("technique_connections").insert(
      childIds.map((target) => ({
        source_technique_id: id,
        target_technique_id: target,
      })),
    );
    if (connError) throw new Error(connError.message);
  }
}

export async function deleteTechniqueAdmin(id: string): Promise<void> {
  await requireAdmin();
  if (isMockMode()) {
    throw new Error("El panel admin requiere Supabase");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("techniques").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
