"use client";

import { useEffect, useState } from "react";
import { recordTechniqueVideoViewAction } from "@/app/actions/videos";
import type { AppRole } from "@/lib/auth/types";
import { SAMPLE_TECHNIQUE_VIDEO } from "@/lib/auth/types";
import type { Technique } from "@/lib/techniques";
import type { TechniqueVideoSource } from "@/lib/video/types";
import { MapPracticeUpload } from "@/components/map-practice-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/video-player";
import { cn } from "@/lib/utils";

type TabId = "class" | "practice";

function TechniqueModalBody({
  technique,
  videoSource,
  userRole,
}: {
  technique: Technique;
  videoSource: TechniqueVideoSource | null;
  userRole: AppRole;
}) {
  const [tab, setTab] = useState<TabId>("class");

  useEffect(() => {
    if (videoSource?.videoId) {
      void recordTechniqueVideoViewAction(videoSource.videoId);
    }
  }, [videoSource?.videoId]);

  const src =
    videoSource?.src ||
    (technique.videoUrl.startsWith("https://storage.example")
      ? SAMPLE_TECHNIQUE_VIDEO
      : technique.videoUrl) ||
    SAMPLE_TECHNIQUE_VIDEO;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{technique.title}</DialogTitle>
        <DialogDescription>
          Reproduce la clase oficial. Al cerrar, el nodo queda recorrido y se iluminan sus variantes.
        </DialogDescription>
      </DialogHeader>

      <div className="flex gap-2 border-b border-[#21262d] pb-2">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "class"
              ? "bg-[#123044] text-[#00d4ff]"
              : "text-[#8b949e] hover:text-[#e6edf3]",
          )}
          onClick={() => setTab("class")}
        >
          Clase
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "practice"
              ? "bg-[#123044] text-[#00d4ff]"
              : "text-[#8b949e] hover:text-[#e6edf3]",
          )}
          onClick={() => setTab("practice")}
        >
          Ahora tú
        </button>
      </div>

      {tab === "class" ? (
        <VideoPlayer
          source={{
            kind: "native",
            src,
            poster: videoSource?.poster,
          }}
          title={technique.title}
          autoPlay
        />
      ) : (
        <MapPracticeUpload
          techniqueId={technique.id}
          techniqueTitle={technique.title}
          userRole={userRole}
        />
      )}
    </>
  );
}

export function TechniqueVideoModal({
  technique,
  videoSource,
  userRole,
  open,
  onOpenChange,
  onDismissProgress,
}: {
  technique: Technique | null;
  videoSource: TechniqueVideoSource | null;
  userRole: AppRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissProgress: (techniqueId: string) => void;
}) {
  const handleOpenChange = (next: boolean) => {
    if (!next && technique) {
      onDismissProgress(technique.id);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {technique ? (
          <TechniqueModalBody
            key={technique.id}
            technique={technique}
            videoSource={videoSource}
            userRole={userRole}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
