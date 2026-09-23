"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { TechniqueType } from "@/lib/techniques";

export type NodeVisualStatus = "lit" | "path" | "asleep";

export type TechniqueNodeData = {
  title: string;
  status: NodeVisualStatus;
  kind: TechniqueType;
  verified?: boolean;
  coverImageUrl?: string;
};

export type TechniqueFlowNode = Node<TechniqueNodeData, "technique">;

function circleClasses(kind: TechniqueType, status: NodeVisualStatus): string {
  if (status === "asleep") return "border-[#21262d] bg-[#0d1117]";
  if (status === "path") return "border-[#8b949e] bg-[#161b22]";

  switch (kind) {
    case "defense":
      return "border-[#c084fc] bg-[radial-gradient(circle_at_40%_35%,#3b2667,#120818_72%)] node-lit-defense";
    case "progression":
      return "border-[#00d4ff] bg-[radial-gradient(circle_at_40%_35%,#16465f,#071018_72%)] node-lit";
    default:
      return "border-[#e6edf3] bg-[radial-gradient(circle_at_40%_35%,#2a3038,#0a0d12_72%)] node-lit-base";
  }
}

const wrapperOpacity: Record<NodeVisualStatus, string> = {
  lit: "opacity-100",
  path: "opacity-60",
  asleep: "opacity-25",
};

function kindLabel(kind: TechniqueType): string {
  switch (kind) {
    case "base_position":
      return "Postura";
    case "defense":
      return "Defensa";
    case "progression":
      return "Progresión";
  }
}

export function TechniqueNode({ data }: NodeProps<TechniqueFlowNode>) {
  const lit = data.status === "lit";
  const kindLabelText = kindLabel(data.kind);

  return (
    <div className={`flex w-[140px] flex-col items-center ${wrapperOpacity[data.status]}`}>
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          className="!size-2 !border-0 !bg-transparent"
        />
        <div
          className={`size-[76px] overflow-hidden rounded-full border-2 ${circleClasses(data.kind, data.status)} ${lit ? "cursor-pointer" : "cursor-default"}`}
          aria-hidden
        >
          {data.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.coverImageUrl}
              alt=""
              className={`size-full object-cover ${data.status === "asleep" ? "grayscale" : ""} ${data.status === "path" ? "opacity-70" : ""}`}
            />
          ) : null}
        </div>
        {data.verified ? (
          <span
            className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1117]"
            title="Verificada"
          />
        ) : null}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!size-2 !border-0 !bg-transparent"
        />
      </div>
      <p className="mt-2 text-center font-heading text-[13px] leading-tight tracking-wide text-[#e6edf3] uppercase">
        {data.title}
      </p>
      <p className="mt-1 text-[10px] tracking-[0.14em] text-[#8b949e] uppercase">{kindLabelText}</p>
    </div>
  );
}

export const techniqueNodeTypes = {
  technique: TechniqueNode,
};
