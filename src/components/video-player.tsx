"use client";

import { useEffect, useRef } from "react";
import type Hls from "hls.js";
import type { VideoSource } from "@/lib/video/types";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = {
  source: VideoSource;
  title?: string;
  className?: string;
  autoPlay?: boolean;
};

/**
 * Single entry point for playback. HLS uses hls.js (Safari may use native HLS).
 */
export function VideoPlayer({
  source,
  title,
  className,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let cancelled = false;

    async function attach() {
      if (!video) return;
      if (source.kind === "hls") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source.src;
        } else {
          const HlsModule = await import("hls.js");
          const HlsCtor = HlsModule.default;
          if (HlsCtor.isSupported()) {
            hls = new HlsCtor({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source.src);
            hls.attachMedia(video);
          } else {
            video.src = source.src;
          }
        }
      } else {
        video.src = source.src;
      }

      if (autoPlay && !cancelled) {
        void video.play().catch(() => {
          /* autoplay blocked */
        });
      }
    }

    void attach();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [autoPlay, source.kind, source.src]);

  const poster = source.poster;

  return (
    <video
      ref={videoRef}
      key={`${source.kind}-${source.src}`}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      title={title}
      className={cn("aspect-video w-full rounded-md bg-black", className)}
    />
  );
}
