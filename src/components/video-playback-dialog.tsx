"use client";

import { useState } from "react";
import type { TechniqueVideo } from "@/lib/auth/types";
import { resolveVideoSource } from "@/lib/video/resolve-playback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/video-player";

export function VideoPlaybackDialog({
  videos,
}: {
  videos: TechniqueVideo[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = videos.find((video) => video.id === activeId) ?? null;

  return (
    <>
      <ul className="grid grid-cols-5 gap-3 max-md:grid-cols-2 max-lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id} className="group">
            <button
              type="button"
              onClick={() => setActiveId(video.id)}
              className="w-full overflow-hidden rounded-lg border border-[#21262d] bg-[#0d1117] text-left transition group-hover:border-[#00d4ff]/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt=""
                className="aspect-video w-full object-cover bg-[#161b22]"
              />
              <h2 className="px-2 py-2 text-sm text-[#e6edf3] line-clamp-2">{video.title}</h2>
              {video.processingStatus !== "ready" ? (
                <p className="px-2 pb-2 text-xs text-amber-300">Procesando…</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className="sm:max-w-3xl">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
              </DialogHeader>
              {active.processingStatus === "ready" ? (
                <VideoPlayer source={resolveVideoSource(active)} title={active.title} autoPlay />
              ) : (
                <p className="text-sm text-[#8b949e]">
                  El vídeo se está transcodificando en Mux. Vuelve en unos minutos.
                </p>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
