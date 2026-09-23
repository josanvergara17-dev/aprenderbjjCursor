"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { TechniqueType } from "@/lib/techniques";

export type NodeVisualStatus = "lit" | "path" | "asleep";

export type TechniqueNodeData = {
  title: string;
  status: NodeVisualStatus;
  kind: TechniqueType;
};

export type TechniqueFlowNode = Node<TechniqueNodeData, "technique">;

const circleStyle: Record<NodeVisualStatus, string> = {
  lit: "border-[#00d4ff] bg-[radial-gradient(circle_at_40%_35%,#16465f,#071018_72%)] node-lit",
  path: "border-[#8b949e] bg-[#161b22]",
  asleep: "border-[#21262d] bg-[#0d1117]",
};

const wrapperOpacity: Record<NodeVisualStatus, string> = {
  lit: "opacity-100",
  path: "opacity-60",
  asleep: "opacity-25",
};

export function TechniqueNode({ data }: NodeProps<TechniqueFlowNode>) {
  const lit = data.status === "lit";
  const kindLabel = data.kind === "base_position" ? "Postura" : "Variante";

  return (
    <div className={`flex w-[140px] flex-col items-center ${wrapperOpacity[data.status]}`}>
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          className="!size-2 !border-0 !bg-transparent"
        />
        <div
          className={`size-[76px] rounded-full border-2 ${circleStyle[data.status]} ${lit ? "cursor-pointer" : "cursor-default"}`}
          aria-hidden
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!size-2 !border-0 !bg-transparent"
        />
      </div>
      <p className="mt-2 text-center font-heading text-[13px] leading-tight tracking-wide text-[#e6edf3] uppercase">
        {data.title}
      </p>
      <p className="mt-1 text-[10px] tracking-[0.14em] text-[#8b949e] uppercase">{kindLabel}</p>
    </div>
  );
}

export const techniqueNodeTypes = {
  technique: TechniqueNode,
};
