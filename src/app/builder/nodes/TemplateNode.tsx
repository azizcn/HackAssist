"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Sparkles, Coins, Image } from "lucide-react";
import type { TemplateNodeData } from "../codegen";

type TemplateNodeType = Node<TemplateNodeData>;

function TemplateNode({ id, data, selected }: NodeProps<TemplateNodeType>) {
  const isCoin = data.templateType === "basic_coin";
  const accentColor = isCoin ? "#14f195" : "#9945ff";
  const accentMuted = isCoin ? "rgba(20,241,149,0.15)" : "rgba(153,69,255,0.15)";
  const Icon = isCoin ? Coins : Image;

  const handleExpand = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("builder:expandTemplate", {
        detail: { id, templateType: data.templateType },
      })
    );
  }, [id, data.templateType]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
      style={{ minWidth: 240 }}
    >
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
          className="flex items-center gap-2 px-3 py-2.5"
          style={{
            background: `linear-gradient(135deg, ${accentMuted}, transparent)`,
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accentMuted }}
          >
            <Icon size={16} style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-foreground">
              {isCoin ? "Basic Coin" : "Basic NFT"}
            </div>
            <div className="text-[10px] text-muted-dim">Template • Click Expand</div>
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
            }}
          >
            TPL
          </div>
        </div>

        {/* Description */}
        <div className="px-3 py-2 text-xs text-muted leading-relaxed">
          {isCoin
            ? "Generates a full SPL Token Solana Program with mint, transfer, and burn Instructions."
            : "Generates an NFT minting Solana Program with metadata and collection support."}
        </div>

        {/* Expand Button */}
        <div className="px-3 pb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExpand}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
                       transition-colors"
            style={{
              backgroundColor: accentMuted,
              color: accentColor,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Sparkles size={13} />
            Expand Template
          </motion.button>
        </div>
      </div>

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

export default memo(TemplateNode);
