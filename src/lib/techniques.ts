export type TechniqueType = "base_position" | "progression" | "defense";

export type Technique = {
  id: string;
  title: string;
  description?: string;
  type: TechniqueType;
  /** Fallback demo URL when no published gallery video exists */
  videoUrl: string;
  children: string[];
  x: number;
  y: number;
  isVerified?: boolean;
  coverImageUrl?: string;
};

export function defaultTechniqueCoverUrl(techniqueId: string): string {
  return `https://picsum.photos/seed/nogi-${techniqueId}/240/240`;
}

export const TECHNIQUES: Technique[] = [
  {
    id: "montada",
    title: "Montada",
    type: "base_position",
    videoUrl: "https://storage.example/montada.mp4",
    children: ["americana", "escape_codo_rodilla", "gancho_espalda"],
    x: 40,
    y: 0,
    isVerified: true,
    coverImageUrl: defaultTechniqueCoverUrl("montada"),
  },
  {
    id: "guardia_cerrada",
    title: "Guardia cerrada",
    type: "base_position",
    videoUrl: "https://storage.example/guardia-cerrada.mp4",
    children: ["armbar", "triangulo", "omoplata"],
    x: 470,
    y: 0,
    isVerified: true,
  },
  {
    id: "media_guardia",
    title: "Media guardia",
    type: "base_position",
    videoUrl: "https://storage.example/media-guardia.mp4",
    children: ["raspado_mariposa", "escudo_rodilla", "dogfight"],
    x: 900,
    y: 0,
    isVerified: true,
  },
  {
    id: "americana",
    title: "Americana",
    type: "progression",
    videoUrl: "https://storage.example/americana.mp4",
    children: ["transicion_espalda"],
    x: 0,
    y: 220,
  },
  {
    id: "escape_codo_rodilla",
    title: "Escape codo-rodilla",
    type: "defense",
    videoUrl: "https://storage.example/escape-codo-rodilla.mp4",
    children: ["recuperar_media"],
    x: 160,
    y: 220,
  },
  {
    id: "gancho_espalda",
    title: "Gancho a la espalda",
    type: "progression",
    videoUrl: "https://storage.example/gancho-espalda.mp4",
    children: [],
    x: 330,
    y: 220,
  },
  {
    id: "armbar",
    title: "Llave de brazo",
    type: "progression",
    videoUrl: "https://storage.example/armbar.mp4",
    children: [],
    x: 390,
    y: 220,
  },
  {
    id: "triangulo",
    title: "Triángulo",
    type: "progression",
    videoUrl: "https://storage.example/triangulo.mp4",
    children: ["armbar_triangulo"],
    x: 550,
    y: 220,
  },
  {
    id: "omoplata",
    title: "Omoplata",
    type: "progression",
    videoUrl: "https://storage.example/omoplata.mp4",
    children: [],
    x: 710,
    y: 220,
  },
  {
    id: "raspado_mariposa",
    title: "Raspado de mariposa",
    type: "progression",
    videoUrl: "https://storage.example/raspado.mp4",
    children: ["paso_montada", "control_tobillo"],
    x: 820,
    y: 220,
  },
  {
    id: "escudo_rodilla",
    title: "Escudo de rodilla",
    type: "defense",
    videoUrl: "https://storage.example/escudo-rodilla.mp4",
    children: [],
    x: 990,
    y: 220,
  },
  {
    id: "dogfight",
    title: "Dogfight",
    type: "progression",
    videoUrl: "https://storage.example/dogfight.mp4",
    children: [],
    x: 1160,
    y: 220,
  },
  {
    id: "transicion_espalda",
    title: "Transición a espalda",
    type: "progression",
    videoUrl: "https://storage.example/transicion-espalda.mp4",
    children: [],
    x: 0,
    y: 450,
  },
  {
    id: "recuperar_media",
    title: "Recuperar media guardia",
    type: "defense",
    videoUrl: "https://storage.example/recuperar-media.mp4",
    children: [],
    x: 170,
    y: 450,
  },
  {
    id: "armbar_triangulo",
    title: "Armbar desde triángulo",
    type: "progression",
    videoUrl: "https://storage.example/armbar-triangulo.mp4",
    children: [],
    x: 500,
    y: 450,
  },
  {
    id: "paso_montada",
    title: "Paso a montada",
    type: "progression",
    videoUrl: "https://storage.example/paso-montada.mp4",
    children: [],
    x: 760,
    y: 450,
  },
  {
    id: "control_tobillo",
    title: "Control de tobillo",
    type: "progression",
    videoUrl: "https://storage.example/control-tobillo.mp4",
    children: [],
    x: 940,
    y: 450,
  },
];

for (const technique of TECHNIQUES) {
  technique.coverImageUrl ??= defaultTechniqueCoverUrl(technique.id);
}

export const techniqueById: Record<string, Technique> = Object.fromEntries(
  TECHNIQUES.map((technique) => [technique.id, technique]),
);

export function indexTechniques(techniques: Technique[]): Record<string, Technique> {
  return Object.fromEntries(techniques.map((technique) => [technique.id, technique]));
}

export function validateTechniqueGraph(
  techniques: Technique[],
  byId: Record<string, Technique> = indexTechniques(techniques),
) {
  for (const technique of techniques) {
    for (const childId of technique.children) {
      if (!byId[childId]) {
        throw new Error(`El nodo ${technique.id} apunta a un hijo inexistente: ${childId}`);
      }
    }
  }
}

validateTechniqueGraph(TECHNIQUES, techniqueById);

export function basePositionIds(techniques: Technique[] = TECHNIQUES): string[] {
  return techniques
    .filter((technique) => technique.type === "base_position")
    .map((technique) => technique.id);
}

export function illuminatedIds(
  path: readonly string[],
  byId: Record<string, Technique> = techniqueById,
  techniques: Technique[] = TECHNIQUES,
): string[] {
  const currentId = path.at(-1);
  if (!currentId) return basePositionIds(techniques);
  return byId[currentId]?.children ?? [];
}

export function edgeStrokeForChild(
  childId: string,
  byId: Record<string, Technique>,
  active: boolean,
): string {
  if (!active) return "#21262d";
  const kind = byId[childId]?.type;
  if (kind === "defense") return "#c084fc";
  if (kind === "progression") return "#00d4ff";
  return "#8b949e";
}
