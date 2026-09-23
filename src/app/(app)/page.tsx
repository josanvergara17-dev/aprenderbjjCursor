import { TechniqueMap } from "@/components/technique-map";
import { getCurrentUser } from "@/lib/auth/session";
import { loadTechniqueGraph } from "@/lib/data/techniques";
import { getPublishedVideoMap } from "@/lib/data/videos";

export default async function MapPage() {
  const user = await getCurrentUser();
  const graph = await loadTechniqueGraph();
  const videoByTechniqueId = await getPublishedVideoMap(
    graph.techniques.map((technique) => technique.id),
  );

  return (
    <TechniqueMap
      techniques={graph.techniques}
      videoByTechniqueId={videoByTechniqueId}
      userRole={user?.role ?? "student"}
    />
  );
}
