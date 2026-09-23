import type { TechniqueVideo } from "@/lib/auth/types";
import { isMuxConfigured, muxPlaybackUrl, muxThumbnailUrl } from "@/lib/mux/config";
import type { VideoSource } from "@/lib/video/types";

export function resolveVideoSource(video: TechniqueVideo): VideoSource {
  if (
    video.streamKind === "mux" &&
    video.muxPlaybackId &&
    video.processingStatus === "ready" &&
    isMuxConfigured()
  ) {
    return {
      kind: "hls",
      src: muxPlaybackUrl(video.muxPlaybackId),
      poster: video.thumbnailUrl || muxThumbnailUrl(video.muxPlaybackId),
    };
  }

  return {
    kind: "native",
    src: video.videoUrl,
    poster: video.thumbnailUrl,
  };
}

export function techniqueVideoToMapSource(video: TechniqueVideo) {
  const source = resolveVideoSource(video);
  return {
    ...source,
    videoId: video.id,
    processingStatus: video.processingStatus,
  };
}
