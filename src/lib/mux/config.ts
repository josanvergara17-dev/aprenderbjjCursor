export type StreamKind = "storage" | "mux";

export type VideoProcessingStatus =
  | "pending_upload"
  | "processing"
  | "ready"
  | "error";

export function isMuxConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

export function getMuxCredentials() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("Faltan MUX_TOKEN_ID o MUX_TOKEN_SECRET");
  }
  return { tokenId, tokenSecret };
}

export function muxPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function muxThumbnailUrl(playbackId: string, time = 1): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;
}

export function getMuxWebhookSecret(): string | undefined {
  return process.env.MUX_WEBHOOK_SECRET;
}
