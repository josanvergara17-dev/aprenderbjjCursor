import { NextResponse } from "next/server";
import { muxThumbnailUrl } from "@/lib/mux/config";
import { createServiceClient, hasServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  if (!hasServiceClient()) {
    return NextResponse.json({ error: "Service role no configurado" }, { status: 503 });
  }

  let event: {
    type?: string;
    data?: {
      id?: string;
      upload_id?: string;
      passthrough?: string;
      playback_ids?: { id: string; policy: string }[];
    };
  };

  try {
    event = (await request.json()) as typeof event;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "video.upload.asset_created" && event.data?.upload_id && event.data?.id) {
    await supabase
      .from("technique_videos")
      .update({
        mux_asset_id: event.data.id,
        processing_status: "processing",
      })
      .eq("mux_upload_id", event.data.upload_id);
    return NextResponse.json({ ok: true });
  }

  if (event.type === "video.asset.ready" && event.data?.id) {
    const playbackId =
      event.data.playback_ids?.find((entry) => entry.policy === "public")?.id ??
      event.data.playback_ids?.[0]?.id;

    if (!playbackId) {
      return NextResponse.json({ error: "Sin playback id" }, { status: 422 });
    }

    const thumbnail = muxThumbnailUrl(playbackId);
    const patch = {
      mux_asset_id: event.data.id,
      mux_playback_id: playbackId,
      stream_kind: "mux",
      processing_status: "ready",
      thumbnail_url: thumbnail,
      video_url: `https://stream.mux.com/${playbackId}.m3u8`,
    };

    if (event.data.passthrough) {
      await supabase.from("technique_videos").update(patch).eq("id", event.data.passthrough);
    } else if (event.data.upload_id) {
      await supabase.from("technique_videos").update(patch).eq("mux_upload_id", event.data.upload_id);
    } else {
      await supabase.from("technique_videos").update(patch).eq("mux_asset_id", event.data.id);
    }

    return NextResponse.json({ ok: true });
  }

  if (event.type === "video.asset.errored") {
    const assetId = event.data?.id;
    if (assetId) {
      await supabase
        .from("technique_videos")
        .update({ processing_status: "error" })
        .eq("mux_asset_id", assetId);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
