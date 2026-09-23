"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  techniqueNodeTypes,
  type NodeVisualStatus,
  type TechniqueFlowNode,
} from "@/components/technique-node";
import { TECHNIQUES, illuminatedIds, techniqueById } from "@/lib/techniques";
import "@xyflow/react/dist/style.css";

function statusFor(id: string, path: readonly string[], lit: ReadonlySet<string>): NodeVisualStatus {
  if (lit.has(id)) return "lit";
  if (path.includes(id)) return "path";
  return "asleep";
}

function TechniqueMapCanvas() {
  const [path, setPath] = useState<string[]>([]);
  const { fitView } = useReactFlow();
  const litIds = useMemo(() => illuminatedIds(path), [path]);
  const litSet = useMemo(() => new Set(litIds), [litIds]);

  const enter = useCallback((id: string) => {
    setPath((current) => {
      if (!new Set(illuminatedIds(current)).has(id)) return current;
      return [...current, id];
    });
  }, []);

  const back = useCallback(() => {
    setPath((current) => current.slice(0, -1));
  }, []);

  const nodes = useMemo<TechniqueFlowNode[]>(
    () =>
      TECHNIQUES.map((technique) => ({
        id: technique.id,
        type: "technique",
        position: { x: technique.x, y: technique.y },
        data: {
          title: technique.title,
          kind: technique.type,
          status: statusFor(technique.id, path, litSet),
        },
        draggable: false,
        selectable: false,
        focusable: litSet.has(technique.id),
      })),
    [litSet, path],
  );

  const edges = useMemo<Edge[]>(
    () =>
      TECHNIQUES.flatMap((technique) =>
        technique.children.map((childId) => {
          const active = litSet.has(childId) || (path.includes(technique.id) && path.includes(childId));
          return {
            id: `${technique.id}-${childId}`,
            source: technique.id,
            target: childId,
            type: "smoothstep",
            animated: active,
            style: {
              stroke: active ? "#00d4ff" : "#21262d",
              strokeWidth: active ? 2 : 1,
            },
          };
        }),
      ),
    [litSet, path],
  );

  useEffect(() => {
    function frameFit() {
      const lit = illuminatedIds(path);
      const showWholeTree = path.length === 0 && window.innerWidth >= 768;
      const focus = showWholeTree
        ? TECHNIQUES.map((technique) => technique.id)
        : lit.length > 0
          ? [...path, ...lit]
          : path;
      void fitView({
        nodes: focus.map((id) => ({ id })),
        padding: 0.28,
        duration: 400,
      });
    }

    const frame = requestAnimationFrame(frameFit);
    window.addEventListener("resize", frameFit);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", frameFit);
    };
  }, [fitView, path]);

  const crumbs = ["Inicio", ...path.map((id) => techniqueById[id]?.title ?? id)];
  const atLeaf = path.length > 0 && litIds.length === 0;

  return (
    <div className="flex h-[calc(100dvh-3.75rem)] flex-col">
      <header className="flex flex-col gap-3 border-b border-[#21262d] bg-[#0d1117] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl tracking-wide text-[#e6edf3] uppercase">
              Mapa de técnicas
            </h1>
            <p className="mt-1 text-sm text-[#8b949e]">
              Pulsa un círculo iluminado: se apaga y se encienden sus variantes.
            </p>
          </div>
          <Button variant="outline" onClick={back} disabled={path.length === 0}>
            <ArrowLeft />
            Volver atrás
          </Button>
        </div>
        <p className="text-sm text-[#8b949e]">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb}-${index}`}>
              {index > 0 ? <span className="px-1.5 text-[#21262d]">/</span> : null}
              <span className={index === crumbs.length - 1 ? "text-[#e6edf3]" : undefined}>{crumb}</span>
            </span>
          ))}
        </p>
        {atLeaf ? (
          <p className="rounded-lg border border-[#21262d] bg-[#161b22] px-3 py-2 text-sm text-[#e6edf3]">
            Esta técnica no tiene variantes. Vuelve atrás para seguir el mapa.
          </p>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1">
        <ReactFlow
          className="technique-flow"
          nodes={nodes}
          edges={edges}
          nodeTypes={techniqueNodeTypes}
          onNodeClick={(_, node) => enter(node.id)}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.28 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll
          minZoom={0.35}
          maxZoom={1.5}
        >
          <Background color="#21262d" gap={22} />
          <Controls showInteractive={false} />
        </ReactFlow>

        <ul className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2 rounded-lg border border-[#21262d] bg-[#0d1117]/90 px-3 py-2 text-xs text-[#8b949e]">
          <li className="flex items-center gap-2">
            <span className="node-lit size-3 rounded-full border border-[#00d4ff] bg-[#123044]" />
            Iluminada
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-[#8b949e] bg-[#161b22] opacity-60" />
            Recorrida
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-[#21262d] bg-[#0d1117] opacity-40" />
            Apagada
          </li>
        </ul>

      </div>
    </div>
  );
}

export function TechniqueMap() {
  return (
    <ReactFlowProvider>
      <TechniqueMapCanvas />
    </ReactFlowProvider>
  );
}
