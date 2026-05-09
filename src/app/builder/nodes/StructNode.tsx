"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Database, Plus, Trash2, Shield, HelpCircle } from "lucide-react";
import { useTutorialStore } from "../../dojo/useTutorialStore";
import type { StructNodeData, StructField } from "../codegen";
import DeleteButton from "./DeleteButton";

type StructNodeType = Node<StructNodeData>;

function StructNode({ id, data, selected }: NodeProps<StructNodeType>) {
  const isContext = data.nodeCategory === "context";
  const accentColor = isContext ? "#9945ff" : "#14f195";
  const accentColorMuted = isContext ? "rgba(153,69,255,0.15)" : "rgba(20,241,149,0.15)";
  const Icon = isContext ? Shield : Database;

  const updateData = useCallback(
    (updates: Partial<StructNodeData>) => {
      // React Flow doesn't have a built-in way to update node data from inside a node.
      // We dispatch a custom event that BuilderView listens to.
      window.dispatchEvent(
        new CustomEvent("builder:updateNode", {
          detail: { id, updates },
        })
      );
    },
    [id]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ structName: e.target.value });
    },
    [updateData]
  );

  const handleFieldChange = useCallback(
    (index: number, key: keyof StructField, value: string) => {
      const newFields = [...data.fields];
      newFields[index] = { ...newFields[index], [key]: value };
      updateData({ fields: newFields });
    },
    [data.fields, updateData]
  );

  const addField = useCallback(() => {
    updateData({ fields: [...data.fields, { name: "", type: "u64" }] });
  }, [data.fields, updateData]);

  const removeField = useCallback(
    (index: number) => {
      const newFields = data.fields.filter((_, i) => i !== index);
      updateData({ fields: newFields });
    },
    [data.fields, updateData]
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
      style={{ minWidth: 280 }}
    >
      <DeleteButton id={id} type="node" />

      {/* ── Target Handle (top — bullet pointing up) ─────────────── */}
      <Handle
        type="target"
        position={Position.Top}
        className="!border-0 !bg-transparent"
        style={{ top: -6 }}
      >
        <div
          className="bullet-handle-target"
          style={{ backgroundColor: accentColor }}
        />
      </Handle>

      {/* ── Node Body ───────────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden transition-shadow duration-200"
        style={{
          background: "var(--card-bg)",
          border: `1.5px solid ${selected ? accentColor : "var(--card-border)"}`,
          boxShadow: selected ? `0 0 20px ${accentColorMuted}` : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background: `linear-gradient(135deg, ${accentColorMuted}, transparent)`,
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: accentColorMuted }}
          >
            <Icon size={14} style={{ color: accentColor }} />
          </div>
          <div
            className="bullet-badge"
            style={{
              backgroundColor: accentColorMuted,
              color: accentColor,
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 10px 2px 14px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {isContext ? "CTX" : "STATE"}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const store = useTutorialStore.getState();
              store.triggerSenseiHelp(isContext ? "sensei.topic.isSigner" : "sensei.topic.isMut");
            }}
            className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center hover:bg-neon-purple hover:text-white transition-colors"
            title="Ask Sensei"
          >
            <HelpCircle size={10} />
          </button>
        </div>

        {/* Struct Name Input */}
        <div className="px-3 pt-3 pb-1">
          <input
            value={data.structName}
            onChange={handleNameChange}
            placeholder="StructName"
            className="w-full bg-transparent border-b border-card-border text-foreground font-mono font-bold text-sm
                       focus:outline-none focus:border-neon-green pb-1 placeholder:text-muted-dim"
            style={{ caretColor: accentColor }}
          />
        </div>

        {/* Fields */}
        <div className="px-3 py-2 space-y-1.5">
          {data.fields.map((field, i) => (
            <div key={i} className="flex items-center gap-1.5 group/field">
              <input
                value={field.name}
                onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                placeholder="field"
                className="flex-1 bg-surface rounded px-2 py-1 text-xs font-mono text-foreground
                           focus:outline-none focus:ring-1 placeholder:text-muted-dim"
                style={{ focusRingColor: accentColor } as React.CSSProperties}
              />
              <span className="text-muted-dim text-xs">:</span>
              <input
                value={field.type}
                onChange={(e) => handleFieldChange(i, "type", e.target.value)}
                placeholder="u64"
                className="w-20 bg-surface rounded px-2 py-1 text-xs font-mono text-neon-green
                           focus:outline-none focus:ring-1 placeholder:text-muted-dim"
              />
              <button
                onClick={() => removeField(i)}
                className="opacity-0 group-hover/field:opacity-100 text-muted-dim hover:text-red-400
                           transition-opacity p-0.5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <button
            onClick={addField}
            className="flex items-center gap-1 text-xs text-muted hover:text-neon-green
                       transition-colors w-full justify-center py-1.5 rounded border border-dashed
                       border-card-border hover:border-neon-green/40 mt-1"
          >
            <Plus size={12} />
            Add Field
          </button>
        </div>
      </div>

      {/* ── Source Handle (bottom — bullet pointing down) ────────────── */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-0 !bg-transparent"
        style={{ bottom: -6 }}
      >
        <div
          className="bullet-handle-source"
          style={{ backgroundColor: accentColor }}
        />
      </Handle>
    </motion.div>
  );
}

export default memo(StructNode);
