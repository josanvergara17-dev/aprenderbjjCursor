import { createClient } from "@/lib/supabase/server";

export async function uploadTechniqueCoverFile(
  techniqueId: string,
  file: File,
): Promise<string> {
  const id = techniqueId.trim();
  if (!id) throw new Error("ID de técnica obligatorio");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Archivo de imagen inválido");
  }

  const supabase = await createClient();
  const path = `${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("technique-covers")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("technique-covers").getPublicUrl(path);
  return publicUrl;
}

export async function setTechniqueCoverUrl(techniqueId: string, coverImageUrl: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("techniques")
    .update({ cover_image_url: coverImageUrl })
    .eq("id", techniqueId.trim());
  if (error) throw new Error(error.message);
}
