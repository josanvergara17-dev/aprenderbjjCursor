import { redirect } from "next/navigation";
import { VideoGallery } from "@/components/video-gallery";
import { getCurrentUser } from "@/lib/auth/session";
import { listTechniqueVideos } from "@/lib/data/videos";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const data = await listTechniqueVideos(page);

  return <VideoGallery user={user} data={data} />;
}
