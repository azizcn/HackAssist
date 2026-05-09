"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { KeyRound, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { PDANodeData } from "../codegen";

type PDANodeType = Node<PDANodeData>;

function PDANode({ id, data, selected }: NodeProps<PDANodeType>) {
  const accentColor = "#06b6d4";
  const accentMuted = "rgba(6,182,212,0.15)";

  const updateData = useCallback(
    (updates: Partial<PDANodeData>) => {
      window.dispatchEvent(
        new CustomEvent("builder:updateNode", { detail: { id, updates } })
      );
    },
    [id]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData({ pdaName: e.target.value });
    },
    [updateData]
  );

  const handleSeedChange = useCallback(
    (index: number, value: string) => {
      const newSeeds = [...data.seeds];
      newSeeds[index] = value;
      updateData({ seeds: newSeeds });
    },
    [data.seeds, updateData]
  );

  const addSeed = useCallback(() => {
    updateData({ seeds: [...data.seeds, ""] });
  }, [data.seeds, updateData]);

  const removeSeed = useCallback(
    (index: number) => {
      updateData({ seeds: data.seeds.filter((_, i) => i !== index) });
    },
    [data.seeds, updateData]
  );

  const toggleBump = useCallback(() => {
    updateData({ bump: !data.bump });
  }, [data.bump, updateData]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
      style={{ minWidth: 280 }}
    >
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
          boxShadow: selected ? `0 0 24px ${accentMuted}` : "none",
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
            <KeyRound size={14} style={{ color: accentColor }} />
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
            PDA
          </div>
          <span className="ml-auto text-[10px] font-mono opacity-60" style={{ color: accentColor }}>
            Program Derived Address
          </span>
        </div>

        {/* PDA Name Input */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 text-xs text-muted-dim font-mono mb-1">
            <span>pda_name</span>
          </div>
          <input
            value={data.pdaName}
            onChange={handleNameChange}
            placeholder="my_pda"
            className="w-full bg-transparent border-b border-card-border text-foreground font-mono font-bold text-sm
                       focus:outline-none pb-1 placeholder:text-muted-dim"
            style={{ caretColor: accentColor, borderColor: selected ? accentColor : undefined }}
          />
        </div>

        {/* Seeds Array */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="text-[10px] text-muted-dim uppercase tracking-wider font-semibold mb-1">
            Seeds
          </div>
          {data.seeds.map((seed, i) => (
            <div key={i} className="flex items-center gap-1.5 group/field">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold shrink-0"
                style={{ backgroundColor: accentMuted, color: accentColor }}
              >
                {i}
              </div>
              <input
                value={seed}
                onChange={(e) => handleSeedChange(i, e.target.value)}
                placeholder={`seed_${i}`}
                className="flex-1 bg-surface rounded px-2 py-1 text-xs font-mono text-foreground
                           focus:outline-none focus:ring-1 placeholder:text-muted-dim"
                style={{ focusRingColor: accentColor } as React.CSSProperties}
              />
              <button
                onClick={() => removeSeed(i)}
                className="opacity-0 group-hover/field:opacity-100 text-muted-dim hover:text-red-400
                           transition-opacity p-0.5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <button
            onClick={addSeed}
            className="flex items-center gap-1 text-xs text-muted transition-colors w-full justify-center py-1.5 rounded border border-dashed
                       border-card-border mt-1"
            style={{ borderColor: `${accentColor}40` }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${accentColor}40`)}
          >
            <Plus size={12} style={{ color: accentColor }} />
            <span style={{ color: accentColor }}>Add Seed</span>
          </button>
        </div>

        {/* Bump Toggle */}
        <div className="px-3 pb-3">
          <button
            onClick={toggleBump}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: data.bump ? `${accentColor}15` : "var(--surface)",
              color: data.bump ? accentColor : "var(--muted)",
            }}
          >
            {data.bump ? <ToggleRight size={16} style={{ color: accentColor }} /> : <ToggleLeft size={16} />}
            <span>bump</span>
            <span className="ml-auto text-[10px] font-mono opacity-60">
              {data.bump ? "enabled" : "disabled"}
            </span>
          </button>
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

export default memo(PDANode);
