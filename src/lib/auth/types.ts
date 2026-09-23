export type AppRole = "student" | "master" | "admin";

export function isReviewerRole(role: AppRole): boolean {
  return role === "master" || role === "admin";
}

export type SubmissionStatus = "pending" | "approved" | "needs_improvement";

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
};

export type TechniqueVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  techniqueId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  streamKind: "storage" | "mux";
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxUploadId: string | null;
  processingStatus: "pending_upload" | "processing" | "ready" | "error";
};

export type Submission = {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  techniqueId: string;
  techniqueTitle: string;
  videoUrl: string;
  status: SubmissionStatus;
  masterComment: string | null;
  reviewedBy: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export const VIDEOS_PER_PAGE = 50;
export const MOCK_SESSION_COOKIE = "nogi-mock-session";
export const SAMPLE_PRACTICE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
export const SAMPLE_TECHNIQUE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
