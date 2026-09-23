import Mux from "@mux/mux-node";
import { getMuxCredentials } from "@/lib/mux/config";

let muxClient: Mux | null = null;

export function getMuxClient(): Mux {
  if (!muxClient) {
    const { tokenId, tokenSecret } = getMuxCredentials();
    muxClient = new Mux({ tokenId, tokenSecret });
  }
  return muxClient;
}

export async function createMuxDirectUpload(corsOrigin: string, passthrough?: string) {
  const mux = getMuxClient();
  const upload = await mux.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
      passthrough: passthrough ?? undefined,
    },
  });
  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  };
}

export async function getMuxUploadStatus(uploadId: string) {
  const mux = getMuxClient();
  return mux.video.uploads.retrieve(uploadId);
}
