import { NextResponse } from "next/server";
import { isMuxConfigured } from "@/lib/mux/config";
import { createMuxDirectUpload } from "@/lib/mux/server";
import { requireMaster } from "@/lib/auth/session";
import { isMockMode } from "@/lib/supabase/config";
import { createPendingMuxTechniqueVideo } from "@/lib/data/videos";

export async function POST(request: Request) {
  if (isMockMode()) {
    return NextResponse.json({ error: "Mux no disponible en modo mock" }, { status: 400 });
  }
  if (!isMuxConfigured()) {
    return NextResponse.json({ error: "Mux no configurado" }, { status: 503 });
  }

  await requireMaster();

  let body: { title?: string; techniqueId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const techniqueId = String(body.techniqueId ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Título obligatorio" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const row = await createPendingMuxTechniqueVideo({ title, techniqueId: techniqueId || undefined });
  const { uploadId, uploadUrl } = await createMuxDirectUpload(origin, row.id);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.from("technique_videos").update({ mux_upload_id: uploadId }).eq("id", row.id);

  return NextResponse.json({
    videoId: row.id,
    uploadId,
    uploadUrl,
  });
}
