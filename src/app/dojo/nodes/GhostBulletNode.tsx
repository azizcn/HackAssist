"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";

interface GhostNodeData {
  label: string;
  accentColor: string;
  ghostId: string;
  placementState: "ghost" | "placed" | "error";
  [key: string]: unknown;
}

type GhostNodeType = Node<GhostNodeData>;

function GhostBulletNode({ data }: NodeProps<GhostNodeType>) {
  const { label, accentColor, placementState } = data;
  const isError = placementState === "error";
  const isPlaced = placementState === "placed";

  if (isPlaced) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isError ? 1 : 0.6, scale: 1 }}
      className={`relative group ${isError ? "ghost-node-error" : ""}`}
      style={{ minWidth: 280 }}
    >
      <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent" style={{ top: -6 }}>
        <div className="bullet-handle-target" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
      </Handle>

      <div className={`ghost-node rounded-xl overflow-hidden`}
        style={{
          border: `2px dashed ${isError ? "#ef4444" : accentColor}`,
          background: isError ? "rgba(239,68,68,0.05)" : `${accentColor}08`,
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5"
          style={{ borderBottom: `1px dashed ${isError ? "rgba(239,68,68,0.3)" : `${accentColor}30`}` }}>
          <motion.div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15`, border: `1px dashed ${accentColor}40` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-sm">👻</span>
          </motion.div>
          <div className="bullet-badge"
            style={{ backgroundColor: `${accentColor}15`, color: isError ? "#ef4444" : accentColor,
              fontSize: 10, fontWeight: 700, padding: "2px 10px 2px 14px",
              textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            GHOST
          </div>
        </div>

        <div className="px-4 py-6 flex flex-col items-center gap-2">
          <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ border: `2px dashed ${accentColor}40`, backgroundColor: `${accentColor}08` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={isError ? "#ef4444" : accentColor} strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.div>
          <p className="text-xs font-semibold text-center"
            style={{ color: isError ? "#ef4444" : accentColor }}>
            {isError ? "Wrong component! Try again" : label}
          </p>
          <motion.div className="h-0.5 rounded-full"
            style={{ backgroundColor: accentColor, width: "60%" }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent" style={{ bottom: -6 }}>
        <div className="bullet-handle-source" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
      </Handle>
    </motion.div>
  );
}

export default memo(GhostBulletNode);
