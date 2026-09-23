import { requireMaster, requireUser } from "@/lib/auth/session";
import type { Submission, SubmissionStatus } from "@/lib/auth/types";
import { SAMPLE_PRACTICE_VIDEO } from "@/lib/auth/types";
import { getMockStore } from "@/lib/mock/store";
import { techniqueById } from "@/lib/techniques";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function mapSubmissionRow(
  row: Record<string, unknown>,
  profile?: { email?: string; full_name?: string } | null,
): Submission {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentEmail: profile?.email ?? String(row.student_email ?? ""),
    studentName: profile?.full_name ?? String(row.student_name ?? ""),
    techniqueId: String(row.technique_id),
    techniqueTitle: String(row.technique_title),
    videoUrl: String(row.video_url),
    status: row.status as SubmissionStatus,
    masterComment: (row.master_comment as string | null) ?? null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    createdAt: String(row.created_at),
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  };
}

export async function listMySubmissions(): Promise<Submission[]> {
  const user = await requireUser();

  if (isMockMode()) {
    return getMockStore()
      .submissions.filter((item) => item.studentId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapSubmissionRow(row as Record<string, unknown>, {
      email: user.email,
      full_name: user.fullName,
    }),
  );
}

export async function listPendingSubmissions(): Promise<Submission[]> {
  await requireMaster();

  if (isMockMode()) {
    return getMockStore()
      .submissions.filter((item) => item.status === "pending")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles:student_id (email, full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown> & {
      profiles?: { email?: string; full_name?: string } | null;
    };
    return mapSubmissionRow(record, record.profiles);
  });
}

export async function listAllSubmissionsForMaster(): Promise<Submission[]> {
  await requireMaster();

  if (isMockMode()) {
    return [...getMockStore().submissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles:student_id (email, full_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const record = row as Record<string, unknown> & {
      profiles?: { email?: string; full_name?: string } | null;
    };
    return mapSubmissionRow(record, record.profiles);
  });
}

export async function createSubmission(formData: FormData): Promise<Submission> {
  const user = await requireUser();
  if (user.role !== "student") {
    throw new Error("Solo los alumnos pueden enviar prácticas");
  }

  const techniqueId = String(formData.get("techniqueId") ?? "").trim();
  const technique = techniqueById[techniqueId];
  if (!technique) throw new Error("Selecciona una técnica válida");

  const file = formData.get("video");

  if (isMockMode()) {
    const submission: Submission = {
      id: `sub-${crypto.randomUUID()}`,
      studentId: user.id,
      studentEmail: user.email,
      studentName: user.fullName,
      techniqueId: technique.id,
      techniqueTitle: technique.title,
      videoUrl: SAMPLE_PRACTICE_VIDEO,
      status: "pending",
      masterComment: null,
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };
    void file;
    getMockStore().submissions.unshift(submission);
    return submission;
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo de vídeo");
  }

  const supabase = await createClient();
  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("practice-videos")
    .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("practice-videos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      student_id: user.id,
      technique_id: technique.id,
      technique_title: technique.title,
      video_url: publicUrl,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapSubmissionRow(data as Record<string, unknown>, {
    email: user.email,
    full_name: user.fullName,
  });
}

export async function reviewSubmission(input: {
  submissionId: string;
  grade: "approved" | "needs_improvement";
  comment: string;
}): Promise<Submission> {
  const master = await requireMaster();
  const comment = input.comment.trim();
  if (!comment) throw new Error("El comentario es obligatorio");

  if (isMockMode()) {
    const store = getMockStore();
    const submission = store.submissions.find((item) => item.id === input.submissionId);
    if (!submission) throw new Error("Entrega no encontrada");
    submission.status = input.grade;
    submission.masterComment = comment;
    submission.reviewedBy = master.id;
    submission.reviewedAt = new Date().toISOString();
    return submission;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .update({
      status: input.grade,
      master_comment: comment,
      reviewed_by: master.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.submissionId)
    .select("*, profiles:student_id (email, full_name)")
    .single();

  if (error) throw new Error(error.message);
  const record = data as Record<string, unknown> & {
    profiles?: { email?: string; full_name?: string } | null;
  };
  return mapSubmissionRow(record, record.profiles);
}
