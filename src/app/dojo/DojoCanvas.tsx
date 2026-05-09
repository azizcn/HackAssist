"use client";

import { useCallback, useEffect, useMemo, useRef, type DragEvent } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState,
  useReactFlow, BackgroundVariant,
  type Connection, type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useApp } from "../context/AppContext";
import { useTutorialStore, triggerSenseiVoice } from "./useTutorialStore";
import { getLevelConfig, type GhostNodeConfig } from "./levelConfigs";
import GhostBulletNode from "./nodes/GhostBulletNode";
import TutorialBulletNode from "./nodes/TutorialBulletNode";
import confetti from "canvas-confetti";

const nodeTypes = {
  ghostBulletNode: GhostBulletNode,
  tutorialBulletNode: TutorialBulletNode,
};

// Helper: distance between two points
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const SNAP_DISTANCE = 120;

export default function DojoCanvas() {
  const { theme } = useApp();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const store = useTutorialStore();
  const config = getLevelConfig(store.currentLevel);

  // ── Initialize ghost nodes when level/step changes ──────────────────
  useEffect(() => {
    const ghostNodes: Node[] = config.ghostNodes
      .filter((g) => g.step <= store.currentStep)
      .map((g) => {
        const state = store.nodeStates[g.id] || "ghost";
        if (state === "placed") {
          // Find the sidebar item that matches this ghost to get its data
          const sidebarItem = config.sidebarItems.find(
            (si) => si.type === g.expectedType &&
              Object.entries(g.expectedData).every(([k, v]) =>
                (si.defaultData as Record<string, unknown>)[k] === v
              )
          );
          return {
            id: g.id,
            type: "tutorialBulletNode",
            position: g.position,
            data: {
              ...(sidebarItem?.defaultData || {}),
              label: sidebarItem?.label || g.label,
              accentColor: g.accentColor,
            },
          } as Node;
        }
        return {
          id: g.id,
          type: "ghostBulletNode",
          position: g.position,
          draggable: false,
          data: {
            label: g.label,
            accentColor: g.accentColor,
            ghostId: g.id,
            placementState: state,
          },
        } as Node;
      });

    setNodes(ghostNodes);

    // Build placed edges
    const placedEdges: Edge[] = config.ghostEdges
      .filter((ge) => {
        const srcState = store.nodeStates[ge.sourceGhostId];
        const tgtState = store.nodeStates[ge.targetGhostId];
        const edgeState = store.edgeStates[ge.id];
        return srcState === "placed" && tgtState === "placed" && edgeState === "connected";
      })
      .map((ge) => ({
        id: ge.id,
        source: ge.sourceGhostId,
        target: ge.targetGhostId,
        animated: true,
        style: { stroke: "#14f195", strokeWidth: 2 },
      }));

    setEdges(placedEdges);

    setTimeout(() => fitView({ padding: 0.3 }), 100);
  }, [store.currentLevel, store.currentStep, store.nodeStates, store.edgeStates,
      config, setNodes, setEdges, fitView]);

  // ── Update Sensei dialogue on step change ────────────────────────────
  useEffect(() => {
    const dialogue = config.dialogue[store.currentStep];
    if (dialogue && !store.levelCompleted) {
      store.setSenseiMessage(dialogue.instruction, "neutral");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentStep, store.currentLevel]);

  // ── Drag Over ─────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // ── Drop handler — validate against ghost nodes ───────────────────────
  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/reactflow-dojo");
    if (!raw) return;

    const { type, data } = JSON.parse(raw);
    const dropPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

    // Find the current step's ghost node(s)
    const currentGhosts = config.ghostNodes.filter(
      (g) => g.step === store.currentStep && (store.nodeStates[g.id] || "ghost") === "ghost"
    );

    if (currentGhosts.length === 0) return;

    // Find closest ghost node
    let closest: GhostNodeConfig | null = null;
    let closestDist = Infinity;
    for (const ghost of currentGhosts) {
      const d = dist(dropPos, ghost.position);
      if (d < closestDist) {
        closestDist = d;
        closest = ghost;
      }
    }

    if (!closest || closestDist > SNAP_DISTANCE * 3) return;

    // Validate: does the dropped node type match the expected ghost type?
    const typeMatch = type === closest.expectedType;
    const dataMatch = Object.entries(closest.expectedData).every(
      ([key, value]) => data[key] === value
    );

    const dialogue = config.dialogue[store.currentStep];

    if (typeMatch && dataMatch) {
      // ✅ SUCCESS
      store.placeNode(closest.id);
      store.advanceStep();

      // Show success message
      if (dialogue) {
        store.setSenseiMessage(dialogue.successMessage, "happy");
        triggerSenseiVoice(dialogue.successMessage);
      }

      // Mini confetti burst
      confetti({
        particleCount: 30,
        spread: 50,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ["#14f195", "#9945ff"],
        gravity: 0.8,
        scalar: 0.8,
      });
    } else {
      // ❌ ERROR
      store.triggerNodeError(closest.id);
      if (dialogue) {
        store.setSenseiMessage(dialogue.errorMessage, "angry");
        triggerSenseiVoice(dialogue.errorMessage);
      }

      // Clear error after animation
      setTimeout(() => store.clearNodeError(closest!.id), 1500);
    }
  }, [screenToFlowPosition, config, store]);

  // ── Edge connection validation ────────────────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    // Find the expected edge for this step
    const expectedEdge = config.ghostEdges.find(
      (ge) => ge.step === store.currentStep
    );

    if (!expectedEdge) return;

    const dialogue = config.dialogue[store.currentStep];

    // Validate connection matches expected
    const isValid =
      params.source === expectedEdge.sourceGhostId &&
      params.target === expectedEdge.targetGhostId;

    if (isValid) {
      store.connectEdge(expectedEdge.id);
      store.advanceStep();

      if (dialogue) {
        store.setSenseiMessage(dialogue.successMessage, "happy");
        triggerSenseiVoice(dialogue.successMessage);
      }

      // Check if level is now complete
      const nextStep = store.currentStep;
      if (nextStep >= config.totalSteps) {
        store.completeLevel();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#14f195", "#9945ff", "#f0f056"],
        });
      }
    } else {
      if (dialogue) {
        store.setSenseiMessage(dialogue.errorMessage, "angry");
        triggerSenseiVoice(dialogue.errorMessage);
      }
    }
  }, [config, store]);

  // ── MiniMap colors ────────────────────────────────────────────────────
  const minimapStyle = useMemo(
    () => ({ backgroundColor: theme === "dark" ? "#0f172a" : "#f1f5f9" }),
    [theme]
  );

  const miniMapNodeColor = useCallback((node: Node) => {
    if (node.type === "ghostBulletNode") return "rgba(148,163,184,0.3)";
    const data = node.data as { accentColor?: string };
    return data?.accentColor || "#14f195";
  }, []);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#14f195", strokeWidth: 2 },
        }}
        className="builder-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={theme === "dark" ? "rgba(148,163,184,0.15)" : "rgba(100,116,139,0.2)"}
        />
        <Controls showInteractive={false} className="!hidden" />
        <MiniMap
          style={minimapStyle}
          nodeColor={miniMapNodeColor}
          maskColor={theme === "dark" ? "rgba(15,23,42,0.7)" : "rgba(241,245,249,0.7)"}
          className="!rounded-xl !border !border-card-border !shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}
