"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Code2, HelpCircle } from "lucide-react";
import { useTutorialStore } from "../../dojo/useTutorialStore";
import type { FunctionNodeData } from "../codegen";
import DeleteButton from "./DeleteButton";

type FunctionNodeType = Node<FunctionNodeData>;

function FunctionNode({ id, data, selected }: NodeProps<FunctionNodeType>) {
  const accentColor = "#f0f056";
  const accentMuted = "rgba(240,240,86,0.15)";

  const updateData = useCallback(
    (updates: Partial<FunctionNodeData>) => {
      window.dispatchEvent(
        new CustomEvent("builder:updateNode", { detail: { id, updates } })
      );
    },
    [id]
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
      style={{ minWidth: 280 }}
    >
      <DeleteButton id={id} type="node" />

      {/* Target Handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!border-0 !bg-transparent"
        style={{ top: -6 }}
      >
        <div className="bullet-handle-target" style={{ backgroundColor: accentColor }} />
      </Handle>

      <div
        className="rounded-xl overflow-hidden transition-shadow duration-200"
        style={{
          background: "var(--card-bg)",
          border: `1.5px solid ${selected ? accentColor : "var(--card-border)"}`,
          boxShadow: selected ? `0 0 20px ${accentMuted}` : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: `linear-gradient(135deg, ${accentMuted}, transparent)`,
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: accentMuted }}
          >
            <Code2 size={14} style={{ color: accentColor }} />
          </div>
          <div
            className="bullet-badge"
            style={{
              backgroundColor: accentMuted,
              color: accentColor,
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 10px 2px 14px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            FN
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const store = useTutorialStore.getState();
              store.triggerSenseiHelp("sensei.topic.instructionName");
            }}
            className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center hover:bg-neon-purple hover:text-white transition-colors"
            title="Ask Sensei"
          >
            <HelpCircle size={10} />
          </button>
          {data.connectedContext && (
            <span className="ml-auto text-[10px] font-mono text-neon-purple opacity-80">
              ctx: {data.connectedContext}
            </span>
          )}
        </div>

        {/* Function Name */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 text-xs text-muted-dim font-mono mb-1">
            <span>pub fn</span>
          </div>
          <input
            value={data.functionName}
            onChange={(e) => updateData({ functionName: e.target.value })}
            placeholder="my_function"
            className="w-full bg-transparent border-b border-card-border text-foreground font-mono font-bold text-sm
                       focus:outline-none focus:border-neon-yellow pb-1 placeholder:text-muted-dim"
            style={{ caretColor: accentColor }}
          />
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          <textarea
            value={data.body}
            onChange={(e) => updateData({ body: e.target.value })}
            placeholder="Ok(())"
            rows={3}
            className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-foreground
                       resize-none focus:outline-none focus:ring-1 focus:ring-neon-yellow/40
                       placeholder:text-muted-dim"
          />
        </div>
      </div>

      {/* Source Handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-0 !bg-transparent"
        style={{ bottom: -6 }}
      >
        <div className="bullet-handle-source" style={{ backgroundColor: accentColor }} />
      </Handle>
    </motion.div>
  );
}

export default memo(FunctionNode);
