"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Link2, Plus, Trash2 } from "lucide-react";
import type { CPINodeData, StructField } from "../codegen";

type CPINodeType = Node<CPINodeData>;

function CPINode({ id, data, selected }: NodeProps<CPINodeType>) {
  const accentColor = "#f43f5e";
  const accentMuted = "rgba(244,63,94,0.15)";

  const updateData = useCallback(
    (updates: Partial<CPINodeData>) => {
      window.dispatchEvent(
        new CustomEvent("builder:updateNode", { detail: { id, updates } })
      );
    },
    [id]
  );

  const handleAccountChange = useCallback(
    (index: number, key: keyof StructField, value: string) => {
      const newAccounts = [...data.accounts];
      newAccounts[index] = { ...newAccounts[index], [key]: value };
      updateData({ accounts: newAccounts });
    },
    [data.accounts, updateData]
  );

  const addAccount = useCallback(() => {
    updateData({ accounts: [...data.accounts, { name: "", type: "AccountInfo<'info>" }] });
  }, [data.accounts, updateData]);

  const removeAccount = useCallback(
    (index: number) => {
      updateData({ accounts: data.accounts.filter((_, i) => i !== index) });
    },
    [data.accounts, updateData]
  );

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
            <Link2 size={14} style={{ color: accentColor }} />
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
            CPI
          </div>
          <span className="ml-auto text-[10px] font-mono opacity-60" style={{ color: accentColor }}>
            Cross-Program Invocation
          </span>
        </div>

        {/* Target Program */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1 text-xs text-muted-dim font-mono mb-1">
            <span>target_program</span>
          </div>
          <input
            value={data.targetProgram}
            onChange={(e) => updateData({ targetProgram: e.target.value })}
            placeholder="Token Program"
            className="w-full bg-transparent border-b border-card-border text-foreground font-mono font-bold text-sm
                       focus:outline-none pb-1 placeholder:text-muted-dim"
            style={{ caretColor: accentColor, borderColor: selected ? accentColor : undefined }}
          />
        </div>

        {/* Instruction Name */}
        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center gap-1 text-xs text-muted-dim font-mono mb-1">
            <span>instruction</span>
          </div>
          <input
            value={data.instruction}
            onChange={(e) => updateData({ instruction: e.target.value })}
            placeholder="transfer"
            className="w-full bg-transparent border-b border-card-border text-foreground font-mono font-bold text-sm
                       focus:outline-none pb-1 placeholder:text-muted-dim"
            style={{ caretColor: accentColor }}
          />
        </div>

        {/* Accounts */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="text-[10px] text-muted-dim uppercase tracking-wider font-semibold mb-1">
            Accounts
          </div>
          {data.accounts.map((account, i) => (
            <div key={i} className="flex items-center gap-1.5 group/field">
              <input
                value={account.name}
                onChange={(e) => handleAccountChange(i, "name", e.target.value)}
                placeholder="account"
                className="flex-1 bg-surface rounded px-2 py-1 text-xs font-mono text-foreground
                           focus:outline-none focus:ring-1 placeholder:text-muted-dim"
              />
              <span className="text-muted-dim text-xs">:</span>
              <input
                value={account.type}
                onChange={(e) => handleAccountChange(i, "type", e.target.value)}
                placeholder="AccountInfo"
                className="w-24 bg-surface rounded px-2 py-1 text-xs font-mono"
                style={{ color: accentColor }}
              />
              <button
                onClick={() => removeAccount(i)}
                className="opacity-0 group-hover/field:opacity-100 text-muted-dim hover:text-red-400
                           transition-opacity p-0.5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={addAccount}
            className="flex items-center gap-1 text-xs text-muted transition-colors w-full justify-center py-1.5 rounded border border-dashed
                       border-card-border mt-1"
            style={{ borderColor: `${accentColor}40` }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${accentColor}40`)}
          >
            <Plus size={12} style={{ color: accentColor }} />
            <span style={{ color: accentColor }}>Add Account</span>
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

export default memo(CPINode);
