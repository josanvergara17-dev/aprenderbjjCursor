/** Native file/Storage URL today; swap `kind: "hls"` implementation for Mux/Cloudflare later. */
export type VideoSource =
  | { kind: "native"; src: string; poster?: string }
  | { kind: "hls"; src: string; poster?: string };

export type TechniqueVideoSource = {
  src: string;
  poster?: string;
  videoId?: string;
};
