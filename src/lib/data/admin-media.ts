import { requireAdmin } from "@/lib/auth/session";
import type { VideoProcessingStatus } from "@/lib/mux/config";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { setTechniqueCoverUrl, uploadTechniqueCoverFile } from "@/lib/data/technique-covers";
import { defaultTechniqueCoverUrl } from "@/lib/techniques";

export type AdminMediaRow = {
  id: string;
  title: string;
  coverImageUrl: string;
  video: {
    id: string;
    title: string;
    processingStatus: VideoProcessingStatus;
    streamKind: "storage" | "mux";
  } | null;
};

export type BatchCoverResult = {
  updated: string[];
  skipped: { file: string; reason: string }[];
};

function basename(name: string): string {
  const parts = name.split(/[/\\]/);
  return parts[parts.length - 1] ?? name;
}

/** Convención: `americana.jpg` → id `americana` */
export function techniqueIdFromCoverFilename(filename: string): string {
  const base = basename(filename);
  return base.replace(/\.[^.]+$/i, "").trim();
}

/** CSV: `technique_id,filename` (cabecera opcional) */
export function parseCoverCsvMapping(csvText: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^technique_id/i.test(line) && /filename/i.test(line)) continue;
    const [techniqueId, filename] = line.split(",").map((part) => part.trim());
    if (!techniqueId || !filename) continue;
    map.set(basename(filename).toLowerCase(), techniqueId);
  }
  return map;
}

export async function listAdminMediaRows(): Promise<AdminMediaRow[]> {
  await requireAdmin();

  if (isMockMode()) {
    const { TECHNIQUES } = await import("@/lib/techniques");
    const { getMockStore } = await import("@/lib/mock/store");
    const videosByTechnique = new Map<string, AdminMediaRow["video"]>();
    for (const video of getMockStore().videos) {
      if (!video.techniqueId || videosByTechnique.has(video.techniqueId)) continue;
      videosByTechnique.set(video.techniqueId, {
        id: video.id,
        title: video.title,
        processingStatus: video.processingStatus ?? "ready",
        streamKind: video.streamKind ?? "storage",
      });
    }
    return TECHNIQUES.map((technique) => ({
      id: technique.id,
      title: technique.title,
      coverImageUrl: technique.coverImageUrl ?? defaultTechniqueCoverUrl(technique.id),
      video: videosByTechnique.get(technique.id) ?? null,
    }));
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("techniques").select("*").order("name");
  if (error) throw new Error(error.message);

  const { data: videos } = await supabase
    .from("technique_videos")
    .select("id, title, technique_id, processing_status, stream_kind, created_at")
    .not("technique_id", "is", null)
    .order("created_at", { ascending: false });

  const videoByTechnique = new Map<string, AdminMediaRow["video"]>();
  for (const row of videos ?? []) {
    const techniqueId = String(row.technique_id);
    if (videoByTechnique.has(techniqueId)) continue;
    videoByTechnique.set(techniqueId, {
      id: String(row.id),
      title: String(row.title),
      processingStatus: (row.processing_status as VideoProcessingStatus) ?? "ready",
      streamKind: (row.stream_kind as "storage" | "mux") ?? "storage",
    });
  }

  return (rows ?? []).map((row) => {
    const id = String(row.id);
    return {
      id,
      title: String(row.name),
      coverImageUrl:
        (row.cover_image_url as string | null) ?? defaultTechniqueCoverUrl(id),
      video: videoByTechnique.get(id) ?? null,
    };
  });
}

export async function uploadSingleTechniqueCover(
  techniqueId: string,
  file: File,
): Promise<void> {
  await requireAdmin();
  if (isMockMode()) {
    throw new Error("La subida de portadas requiere Supabase (desactiva USE_MOCK_AUTH)");
  }

  const id = techniqueId.trim();
  const supabase = await createClient();
  const { data: exists } = await supabase.from("techniques").select("id").eq("id", id).maybeSingle();
  if (!exists) throw new Error(`No existe la técnica «${id}»`);

  const publicUrl = await uploadTechniqueCoverFile(id, file);
  await setTechniqueCoverUrl(id, publicUrl);
}

export async function batchUploadTechniqueCovers(formData: FormData): Promise<BatchCoverResult> {
  await requireAdmin();
  if (isMockMode()) {
    throw new Error("La subida en lote requiere Supabase (desactiva USE_MOCK_AUTH)");
  }

  const csvFile = formData.get("csv");
  let csvMap = new Map<string, string>();
  if (csvFile instanceof File && csvFile.size > 0) {
    const text = await csvFile.text();
    csvMap = parseCoverCsvMapping(text);
  } else {
    const csvText = String(formData.get("csvText") ?? "").trim();
    if (csvText) csvMap = parseCoverCsvMapping(csvText);
  }

  const files = formData.getAll("covers").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    throw new Error("Selecciona al menos una imagen");
  }

  const supabase = await createClient();
  const { data: techniqueRows } = await supabase.from("techniques").select("id");
  const knownIds = new Set((techniqueRows ?? []).map((row) => String(row.id)));

  const result: BatchCoverResult = { updated: [], skipped: [] };

  for (const file of files) {
    if (file.size === 0) {
      result.skipped.push({ file: file.name, reason: "Archivo vacío" });
      continue;
    }

    const fileKey = basename(file.name).toLowerCase();
    const techniqueId =
      csvMap.get(fileKey) ?? techniqueIdFromCoverFilename(file.name);

    if (!techniqueId) {
      result.skipped.push({ file: file.name, reason: "No se pudo inferir technique_id" });
      continue;
    }
    if (!knownIds.has(techniqueId)) {
      result.skipped.push({
        file: file.name,
        reason: `Técnica desconocida «${techniqueId}»`,
      });
      continue;
    }

    try {
      const publicUrl = await uploadTechniqueCoverFile(techniqueId, file);
      await setTechniqueCoverUrl(techniqueId, publicUrl);
      result.updated.push(techniqueId);
    } catch (uploadError) {
      result.skipped.push({
        file: file.name,
        reason: uploadError instanceof Error ? uploadError.message : "Error de subida",
      });
    }
  }

  return result;
}
