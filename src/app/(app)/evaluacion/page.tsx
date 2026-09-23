import { redirect } from "next/navigation";
import { EvaluationPanel } from "@/components/evaluation-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { isReviewerRole } from "@/lib/auth/types";
import {
  listAllSubmissionsForMaster,
  listMySubmissions,
} from "@/lib/data/submissions";

export default async function EvaluacionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const submissions = isReviewerRole(user.role)
    ? await listAllSubmissionsForMaster()
    : await listMySubmissions();

  return <EvaluationPanel user={user} submissions={submissions} />;
}
