import { TECHNIQUES, defaultTechniqueCoverUrl, indexTechniques, validateTechniqueGraph, type Technique } from "@/lib/techniques";
import { isMockMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type TechniqueGraphSource = "database" | "static";

export type TechniqueGraph = {
  techniques: Technique[];
  source: TechniqueGraphSource;
};

function mapDbType(value: string): Technique["type"] {
  if (value === "base_position" || value === "progression" || value === "defense") {
    return value;
  }
  if (value === "variation") return "progression";
  return "progression";
}

export async function loadTechniqueGraph(): Promise<TechniqueGraph> {
  const allowStaticFallback =
    isMockMode() || process.env.NEXT_PUBLIC_USE_STATIC_GRAPH_FALLBACK === "true";

  if (isMockMode()) {
    return { techniques: TECHNIQUES, source: "static" };
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("techniques").select("*").order("id");

  if (error || !rows?.length) {
    if (allowStaticFallback) {
      return { techniques: TECHNIQUES, source: "static" };
    }
    return { techniques: [], source: "database" };
  }

  const { data: connections } = await supabase
    .from("technique_connections")
    .select("source_technique_id, target_technique_id");

  const childrenBySource = new Map<string, string[]>();
  for (const edge of connections ?? []) {
    const source = String(edge.source_technique_id);
    const target = String(edge.target_technique_id);
    const list = childrenBySource.get(source) ?? [];
    list.push(target);
    childrenBySource.set(source, list);
  }

  const techniques: Technique[] = rows.map((row) => {
    const id = String(row.id);
    return {
      id,
      title: String(row.name ?? row.title ?? id),
      description: (row.description as string | null) ?? undefined,
      type: mapDbType(String(row.type ?? "progression")),
      videoUrl: "",
      children: childrenBySource.get(id) ?? [],
      x: Number(row.position_x ?? row.x ?? 0),
      y: Number(row.position_y ?? row.y ?? 0),
      isVerified: Boolean(row.is_verified),
      coverImageUrl:
        (row.cover_image_url as string | null) ??
        defaultTechniqueCoverUrl(id),
    };
  });

  const byId = indexTechniques(techniques);
  validateTechniqueGraph(techniques, byId);

  return { techniques, source: "database" };
}
