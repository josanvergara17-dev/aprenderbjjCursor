"use client";

import { useEffect, useRef } from "react";
import type { VideoSource } from "@/lib/video/types";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = {
  source: VideoSource;
  title?: string;
  className?: string;
  autoPlay?: boolean;
};

/**
 * Single entry point for playback. HLS sources use native `<video>` until hls.js/Mux is wired in.
 */
export function VideoPlayer({
  source,
  title,
  className,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoPlay || !videoRef.current) return;
    void videoRef.current.play().catch(() => {
      /* autoplay blocked */
    });
  }, [autoPlay, source.src]);

  const poster = source.poster;
  const src = source.src;

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      title={title}
      className={cn("aspect-video w-full rounded-md bg-black", className)}
    />
  );
}
