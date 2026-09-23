import type { AppRole, AppUser, Submission, TechniqueVideo } from "@/lib/auth/types";
import {
  SAMPLE_PRACTICE_VIDEO,
  SAMPLE_TECHNIQUE_VIDEO,
} from "@/lib/auth/types";
import { TECHNIQUES } from "@/lib/techniques";

type MockAccount = AppUser & { password: string };

type MockStore = {
  users: MockAccount[];
  videos: TechniqueVideo[];
  submissions: Submission[];
};

declare global {
  var __nogiMockStore: MockStore | undefined;
}

function thumbnailFor(title: string): string {
  const label = encodeURIComponent(title.slice(0, 28));
  return `https://placehold.co/640x360/0d1117/00d4ff/png?text=${label}&font=oswald`;
}

function videoFields(
  partial: Omit<
    TechniqueVideo,
    "streamKind" | "muxAssetId" | "muxPlaybackId" | "muxUploadId" | "processingStatus"
  >,
): TechniqueVideo {
  return {
    ...partial,
    streamKind: "storage",
    muxAssetId: null,
    muxPlaybackId: null,
    muxUploadId: null,
    processingStatus: "ready",
  };
}

function seedVideos(): TechniqueVideo[] {
  const base = TECHNIQUES.map((technique, index) =>
    videoFields({
      id: `seed-${technique.id}`,
      title: technique.title,
      thumbnailUrl: thumbnailFor(technique.title),
      videoUrl: SAMPLE_TECHNIQUE_VIDEO,
      techniqueId: technique.id,
      uploadedBy: "user-master",
      createdAt: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
    }),
  );

  const extras: TechniqueVideo[] = [];
  for (let i = 1; i <= 40; i += 1) {
    const title = `Drill No-Gi #${String(i).padStart(2, "0")}`;
    extras.push(
      videoFields({
        id: `seed-drill-${i}`,
        title,
        thumbnailUrl: thumbnailFor(title),
        videoUrl: SAMPLE_TECHNIQUE_VIDEO,
        techniqueId: null,
        uploadedBy: "user-master",
        createdAt: new Date(Date.UTC(2026, 1, i)).toISOString(),
      }),
    );
  }

  return [...base, ...extras].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function createStore(): MockStore {
  return {
    users: [
      {
        id: "user-student",
        email: "alumno@nogi.lab",
        fullName: "Alumno Demo",
        role: "student",
        password: "demo1234",
      },
      {
        id: "user-master",
        email: "maestro@nogi.lab",
        fullName: "Maestro Demo",
        role: "master",
        password: "demo1234",
      },
      {
        id: "user-admin",
        email: "admin@nogi.lab",
        fullName: "Admin Demo",
        role: "admin",
        password: "demo1234",
      },
    ],
    videos: seedVideos(),
    submissions: [
      {
        id: "sub-demo-1",
        studentId: "user-student",
        studentEmail: "alumno@nogi.lab",
        studentName: "Alumno Demo",
        techniqueId: "americana",
        techniqueTitle: "Americana",
        videoUrl: SAMPLE_PRACTICE_VIDEO,
        status: "pending",
        masterComment: null,
        reviewedBy: null,
        createdAt: new Date(Date.UTC(2026, 2, 10)).toISOString(),
        reviewedAt: null,
      },
    ],
  };
}

export function getMockStore(): MockStore {
  if (!globalThis.__nogiMockStore) {
    globalThis.__nogiMockStore = createStore();
  }
  return globalThis.__nogiMockStore;
}

export function inferRoleFromEmail(email: string): AppRole {
  const lower = email.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("master") || lower.includes("maestro")) return "master";
  return "student";
}

export function authenticateMockUser(email: string, password: string): AppUser | null {
  const user = getMockStore().users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
  );
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

export function registerMockUser(input: {
  email: string;
  password: string;
  fullName: string;
}): AppUser {
  const store = getMockStore();
  if (store.users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Ya existe una cuenta con ese email");
  }
  const user: MockAccount = {
    id: `user-${crypto.randomUUID()}`,
    email: input.email.toLowerCase(),
    fullName: input.fullName.trim() || input.email.split("@")[0]!,
    role: inferRoleFromEmail(input.email),
    password: input.password,
  };
  store.users.push(user);
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}
