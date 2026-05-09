"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge,
  useReactFlow, ReactFlowProvider, BackgroundVariant,
  type Connection, type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useApp } from "../context/AppContext";
import { generateAnchorCode } from "./codegen";
import { applyDagreLayout } from "./autoLayout";

import Toolbox from "./Toolbox";
import CodePreviewPanel from "./CodePreviewPanel";
import CanvasToolbar from "./CanvasToolbar";
import AIImportModal from "./AIImportModal";
import AITutorPanel from "./AITutorPanel";
import NodeEditModal from "./NodeEditModal";
import SolanaSensei from "../dojo/SolanaSensei";

import StructNode from "./nodes/StructNode";
import FunctionNode from "./nodes/FunctionNode";
import ActionNode from "./nodes/ActionNode";
import TemplateNode from "./nodes/TemplateNode";
import PDANode from "./nodes/PDANode";
import CPINode from "./nodes/CPINode";
import DeletableEdge from "./DeletableEdge";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";

// ── Register custom node types ──────────────────────────────────────────
const nodeTypes = {
  structNode: StructNode,
  functionNode: FunctionNode,
  actionNode: ActionNode,
  templateNode: TemplateNode,
  pdaNode: PDANode,
  cpiNode: CPINode,
};

const edgeTypes = {
  default: DeletableEdge,
};

// ── Helpers ─────────────────────────────────────────────────────────────
let nodeIdCounter = 0;
function nextId() {
  nodeIdCounter++;
  return `node-${Date.now()}-${nodeIdCounter}`;
}

// ── Connection validation rules (Solana Program structure) ──────────────
function isValidConnection(
  sourceNode: Node | undefined,
  targetNode: Node | undefined
): { valid: boolean; reason: string } {
  if (!sourceNode || !targetNode) return { valid: false, reason: "Invalid nodes" };

  const src = sourceNode.type;
  const tgt = targetNode.type;

  // Template nodes cannot be connected (must expand first)
  if (src === "templateNode" || tgt === "templateNode") {
    return { valid: false, reason: "Expand the template first before connecting!" };
  }

  // Can't connect to self
  if (sourceNode.id === targetNode.id) {
    return { valid: false, reason: "Cannot connect a node to itself" };
  }

  // PDA → Context only
  if (src === "pdaNode" && tgt !== "structNode") {
    return { valid: false, reason: "PDA nodes must connect to a Context struct!" };
  }
  if (src === "pdaNode" && tgt === "structNode") {
    const d = targetNode.data as Record<string, unknown>;
    if (d.nodeCategory !== "context") {
      return { valid: false, reason: "PDA nodes must connect to a Context struct, not a State Account!" };
    }
  }

  // CPI → Function only
  if (src === "cpiNode" && tgt !== "functionNode") {
    return { valid: false, reason: "CPI nodes must connect to an Instruction (Function) node!" };
  }

  // Action → cannot connect to structNode directly
  if (src === "actionNode" && tgt === "structNode") {
    return { valid: false, reason: "Action nodes generate standalone functions. Connect State → Context → Function instead." };
  }

  // State → Context (valid), State → Function (not recommended)
  if (src === "structNode") {
    const d = sourceNode.data as Record<string, unknown>;
    if (d.nodeCategory === "state" && tgt === "functionNode") {
      return { valid: false, reason: "State Accounts must connect to a Context struct first, then Context → Instruction." };
    }
  }

  return { valid: true, reason: "" };
}

// ── Toast type ──────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: "error" | "success"; }

// ── Inner component (needs ReactFlowProvider ancestor) ──────────────────
function BuilderCanvas() {
  const { theme } = useApp();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [codeOutput, setCodeOutput] = useState("");
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editModalNodeId, setEditModalNodeId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rejectNodeId, setRejectNodeId] = useState<string | null>(null);
  const toastIdRef = useRef(0);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const editModalNode = useMemo(() => nodes.find((n) => n.id === editModalNodeId) || null, [nodes, editModalNodeId]);

  // ── Toast helper ────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: "error" | "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Code generation ───────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCodeOutput(generateAnchorCode(nodes, edges)); }, [nodes, edges]);

  // ── Listen for node data updates from custom nodes ────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, updates } = (e as CustomEvent).detail;
      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
    };
    window.addEventListener("builder:updateNode", handler);
    return () => window.removeEventListener("builder:updateNode", handler);
  }, [setNodes]);

  // ── Listen for template expand events ─────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, templateType } = (e as CustomEvent).detail;
      const templateNode = nodes.find((n) => n.id === id);
      if (!templateNode) return;

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      if (templateType === "basic_coin") {
        const stateId = nextId(), ctxId = nextId(), fnId = nextId();
        newNodes.push({ id: stateId, type: "structNode", position: { x: 0, y: 0 }, data: { label: "Token State", structName: "TokenState", fields: [{ name: "mint", type: "Pubkey" }, { name: "authority", type: "Pubkey" }, { name: "supply", type: "u64" }], nodeCategory: "state" } });
        newNodes.push({ id: ctxId, type: "structNode", position: { x: 0, y: 0 }, data: { label: "Mint Context", structName: "MintCtx", fields: [{ name: "mint", type: "Account<'info, Mint>" }, { name: "authority", type: "Signer<'info>" }, { name: "token_program", type: "Program<'info, Token>" }], nodeCategory: "context" } });
        newNodes.push({ id: fnId, type: "functionNode", position: { x: 0, y: 0 }, data: { label: "fn mint_tokens", functionName: "mint_tokens", body: "// Mint SPL tokens\nOk(())", connectedContext: "MintCtx" } });
        newEdges.push({ id: `edge-${stateId}-${ctxId}`, source: stateId, target: ctxId, animated: true, style: { stroke: "#14f195", strokeWidth: 2 } });
        newEdges.push({ id: `edge-${ctxId}-${fnId}`, source: ctxId, target: fnId, animated: true, style: { stroke: "#9945ff", strokeWidth: 2 } });
      } else if (templateType === "basic_nft") {
        const stateId = nextId(), ctxId = nextId(), fnId = nextId();
        newNodes.push({ id: stateId, type: "structNode", position: { x: 0, y: 0 }, data: { label: "NFT Metadata", structName: "NftMetadata", fields: [{ name: "name", type: "String" }, { name: "symbol", type: "String" }, { name: "uri", type: "String" }, { name: "creator", type: "Pubkey" }], nodeCategory: "state" } });
        newNodes.push({ id: ctxId, type: "structNode", position: { x: 0, y: 0 }, data: { label: "Mint NFT Context", structName: "MintNftCtx", fields: [{ name: "mint", type: "Account<'info, Mint>" }, { name: "metadata", type: "Account<'info, NftMetadata>" }, { name: "authority", type: "Signer<'info>" }], nodeCategory: "context" } });
        newNodes.push({ id: fnId, type: "functionNode", position: { x: 0, y: 0 }, data: { label: "fn mint_nft", functionName: "mint_nft", body: "// Mint NFT with metadata\nOk(())", connectedContext: "MintNftCtx" } });
        newEdges.push({ id: `edge-${stateId}-${ctxId}`, source: stateId, target: ctxId, animated: true, style: { stroke: "#14f195", strokeWidth: 2 } });
        newEdges.push({ id: `edge-${ctxId}-${fnId}`, source: ctxId, target: fnId, animated: true, style: { stroke: "#9945ff", strokeWidth: 2 } });
      }

      const allNodes = [...nodes.filter((n) => n.id !== id), ...newNodes];
      const allEdges = [...edges, ...newEdges];
      const laid = applyDagreLayout(allNodes, allEdges);
      setNodes(laid); setEdges(allEdges);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    };
    window.addEventListener("builder:expandTemplate", handler);
    return () => window.removeEventListener("builder:expandTemplate", handler);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // ── Edge connection with validation ───────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    const validation = isValidConnection(sourceNode, targetNode);

    if (!validation.valid) {
      // Reject: shake target node + show error toast
      if (params.target) {
        setRejectNodeId(params.target);
        setTimeout(() => setRejectNodeId(null), 600);
      }
      showToast(validation.reason, "error");
      return;
    }

    const newEdges = addEdge(
      { ...params, animated: true, style: { stroke: "#14f195", strokeWidth: 2 } },
      edges
    );
    setEdges(newEdges);
    const laid = applyDagreLayout(nodes, newEdges);
    setNodes(laid);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [nodes, edges, setEdges, setNodes, fitView, showToast]);

  // ── Node click → select for tutor ─────────────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (!tutorOpen) setTutorOpen(true);
  }, [tutorOpen]);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setEditModalNodeId(node.id);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveNodeEdit = useCallback((id: string, updates: any) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [setNodes]);

  const onPaneClick = useCallback(() => { setSelectedNodeId(null); }, []);

  // ── Drag from sidebar → canvas ────────────────────────────────────
  const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/reactflow");
    if (!raw) return;
    const { type, data } = JSON.parse(raw);
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newNode: Node = { id: nextId(), type, position, data: { ...data } };
    const allNodes = [...nodes, newNode];
    const laid = applyDagreLayout(allNodes, edges);
    setNodes(laid);
    setTimeout(() => fitView({ padding: 0.2 }), 100);

    // Auto-select for Sensei
    setSelectedNodeId(newNode.id);
    if (!tutorOpen) setTutorOpen(true);
  }, [screenToFlowPosition, nodes, edges, setNodes, fitView, tutorOpen]);

  // ── Toolbar actions ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const blob = new Blob([codeOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "program.rs"; a.click();
    URL.revokeObjectURL(url);
  }, [codeOutput]);

  const handleAIImport = useCallback((importedNodes: Node[], importedEdges: Edge[]) => {
    const allNodes = [...nodes, ...importedNodes];
    const allEdges = [...edges, ...importedEdges];
    const laid = applyDagreLayout(allNodes, allEdges);
    setNodes(laid); setEdges(allEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // ── MiniMap colors ────────────────────────────────────────────────
  const minimapStyle = useMemo(() => ({ backgroundColor: theme === "dark" ? "#0f172a" : "#f1f5f9" }), [theme]);

  const miniMapNodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case "structNode": return (node.data as { nodeCategory?: string })?.nodeCategory === "context" ? "#9945ff" : "#14f195";
      case "functionNode": return "#f0f056";
      case "actionNode": return "#38bdf8";
      case "templateNode": return "#fb923c";
      case "pdaNode": return "#06b6d4";
      case "cpiNode": return "#f43f5e";
      default: return "#94a3b8";
    }
  }, []);

  // ── Apply reject animation class to nodes ─────────────────────────
  const styledNodes = useMemo(() => nodes.map((n) => ({
    ...n,
    className: n.id === rejectNodeId ? "node-reject" : "",
  })), [nodes, rejectNodeId]);

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[280px] shrink-0"><Toolbox /></div>

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={styledNodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
          onNodeClick={onNodeClick} onNodeDoubleClick={onNodeDoubleClick} onPaneClick={onPaneClick}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes} nodesDraggable={!locked} fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: true, style: { stroke: "#14f195", strokeWidth: 2 } }}
          className="builder-canvas"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color={theme === "dark" ? "rgba(148,163,184,0.15)" : "rgba(100,116,139,0.2)"} />
          <Controls showInteractive={false} className="!hidden" />
          <MiniMap style={minimapStyle} nodeColor={miniMapNodeColor} maskColor={theme === "dark" ? "rgba(15,23,42,0.7)" : "rgba(241,245,249,0.7)"} className="!rounded-xl !border !border-card-border !shadow-lg" />
        </ReactFlow>

        <CanvasToolbar onZoomIn={() => zoomIn()} onZoomOut={() => zoomOut()} onFitView={() => fitView({ padding: 0.2 })} locked={locked} onToggleLock={() => setLocked((p) => !p)} onExport={handleExport} />
      </div>

      {/* Right Panel */}
      <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: rightPanelOpen ? 400 : 0, borderLeft: rightPanelOpen ? "1px solid var(--card-border)" : "none", transition: "width 0.3s ease-in-out" }}>
        {rightPanelOpen && (
          <>
            <AITutorPanel selectedNode={selectedNode} isOpen={tutorOpen} onToggle={() => setTutorOpen((p) => !p)} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <CodePreviewPanel code={codeOutput} isOpen={true} onToggle={() => setRightPanelOpen(false)} onOpenAIModal={() => setAiModalOpen(true)} />
            </div>
          </>
        )}
      </div>

      {!rightPanelOpen && (
        <button onClick={() => setRightPanelOpen(true)} className="absolute right-4 top-4 z-10 p-2.5 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground transition-colors backdrop-blur-xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
        </button>
      )}

      <AIImportModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} onImport={handleAIImport} />
      <NodeEditModal node={editModalNode} onClose={() => setEditModalNodeId(null)} onSave={handleSaveNodeEdit} />
      <SolanaSensei />

      {/* Toast container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md"
              style={{
                background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(20,241,149,0.15)",
                border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(20,241,149,0.3)"}`,
                backdropFilter: "blur(20px)",
              }}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${toast.type === "error" ? "bg-red-500/20" : "bg-neon-green/20"}`}>
                {toast.type === "error" ? <AlertTriangle size={14} className="text-red-400" /> : <Check size={14} className="text-neon-green" />}
              </div>
              <p className="text-xs font-semibold text-foreground">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BuilderView() {
  return <ReactFlowProvider><BuilderCanvas /></ReactFlowProvider>;
}
