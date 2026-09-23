export type AppRole = "student" | "master";

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
