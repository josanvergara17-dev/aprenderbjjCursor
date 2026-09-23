import { requireMaster, requireUser } from "@/lib/auth/session";
import type { TechniqueVideo } from "@/lib/auth/types";
import { SAMPLE_TECHNIQUE_VIDEO, VIDEOS_PER_PAGE } from "@/lib/auth/types";
import { getMockStore } from "@/lib/mock/store";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type VideoPage = {
  items: TechniqueVideo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function mapVideoRow(row: Record<string, unknown>): TechniqueVideo {
  return {
    id: String(row.id),
    title: String(row.title),
    thumbnailUrl: String(row.thumbnail_url),
    videoUrl: String(row.video_url),
    techniqueId: (row.technique_id as string | null) ?? null,
    uploadedBy: (row.uploaded_by as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export async function listTechniqueVideos(page = 1): Promise<VideoPage> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * VIDEOS_PER_PAGE;
  const to = from + VIDEOS_PER_PAGE;

  if (isMockMode()) {
    const all = getMockStore().videos;
    const items = all.slice(from, to);
    const total = all.length;
    return {
      items,
      total,
      page: safePage,
      pageSize: VIDEOS_PER_PAGE,
      totalPages: Math.max(1, Math.ceil(total / VIDEOS_PER_PAGE)),
    };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("technique_videos")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("technique_videos")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => mapVideoRow(row as Record<string, unknown>)),
    total,
    page: safePage,
    pageSize: VIDEOS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / VIDEOS_PER_PAGE)),
  };
}

export async function createTechniqueVideo(input: {
  title: string;
  techniqueId?: string;
  fileName?: string;
}): Promise<TechniqueVideo> {
  const master = await requireMaster();
  const title = input.title.trim();
  if (!title) throw new Error("El título es obligatorio");

  const thumbnailUrl = `https://placehold.co/640x360/0d1117/00d4ff/png?text=${encodeURIComponent(title.slice(0, 28))}`;

  if (isMockMode()) {
    const video: TechniqueVideo = {
      id: `vid-${crypto.randomUUID()}`,
      title,
      thumbnailUrl,
      videoUrl: SAMPLE_TECHNIQUE_VIDEO,
      techniqueId: input.techniqueId?.trim() || null,
      uploadedBy: master.id,
      createdAt: new Date().toISOString(),
    };
    getMockStore().videos.unshift(video);
    return video;
  }

  const supabase = await createClient();
  const path = `${master.id}/${Date.now()}-${input.fileName ?? "tecnica.mp4"}`;
  // En producción el cliente sube el archivo a Storage y pasa la URL pública.
  // Aquí guardamos una fila con URL de muestra si no hay upload previo.
  const { data, error } = await supabase
    .from("technique_videos")
    .insert({
      title,
      thumbnail_url: thumbnailUrl,
      video_url: SAMPLE_TECHNIQUE_VIDEO,
      technique_id: input.techniqueId?.trim() || null,
      uploaded_by: master.id,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  void path;
  return mapVideoRow(data as Record<string, unknown>);
}

export async function uploadTechniqueVideoFile(formData: FormData): Promise<TechniqueVideo> {
  const master = await requireMaster();
  const title = String(formData.get("title") ?? "").trim();
  const techniqueId = String(formData.get("techniqueId") ?? "").trim();
  const file = formData.get("video");

  if (!title) throw new Error("El título es obligatorio");

  if (isMockMode()) {
    return createTechniqueVideo({
      title,
      techniqueId,
      fileName: file instanceof File ? file.name : undefined,
    });
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo de vídeo");
  }

  const supabase = await createClient();
  const path = `${master.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("technique-videos")
    .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("technique-videos").getPublicUrl(path);

  const thumbnailUrl = `https://placehold.co/640x360/0d1117/00d4ff/png?text=${encodeURIComponent(title.slice(0, 28))}`;

  const { data, error } = await supabase
    .from("technique_videos")
    .insert({
      title,
      thumbnail_url: thumbnailUrl,
      video_url: publicUrl,
      technique_id: techniqueId || null,
      uploaded_by: master.id,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapVideoRow(data as Record<string, unknown>);
}

export async function assertCanAccessApp() {
  await requireUser();
}
