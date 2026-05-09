"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Database, Shield, Code2, HelpCircle } from "lucide-react";
import { useTutorialStore } from "../useTutorialStore";

interface TutorialNodeData {
  label: string;
  structName?: string;
  functionName?: string;
  nodeCategory?: string;
  accentColor: string;
  fields?: { name: string; type: string }[];
  body?: string;
  pdaSeeds?: string;
  programName?: string;
  action?: string;
  originalType?: string;
  [key: string]: unknown;
}

type TutorialNodeType = Node<TutorialNodeData>;

function TutorialBulletNode({ data, selected }: NodeProps<TutorialNodeType>) {
  const { label, accentColor, nodeCategory, structName, functionName, fields, body, pdaSeeds, programName, action, originalType } = data;
  const accentMuted = `${accentColor}20`;

  let Icon = Code2;
  let badge = "IX";
  if (nodeCategory === "context") { Icon = Shield; badge = "CTX"; }
  else if (nodeCategory === "state") { Icon = Database; badge = "STATE"; }
  else if (originalType === "pdaNode") { Icon = Shield; badge = "PDA"; }
  else if (originalType === "cpiNode") { Icon = Code2; badge = "CPI"; }

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
      style={{ minWidth: 280 }}
    >
      <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent" style={{ top: -6 }}>
        <div className="bullet-handle-target" style={{ backgroundColor: accentColor }} />
      </Handle>

      {/* Success glow ring */}
      <motion.div className="absolute inset-0 rounded-xl"
        initial={{ opacity: 0.8, scale: 1 }}
        animate={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ border: `2px solid ${accentColor}`, pointerEvents: "none" }} />

      <div className="rounded-xl overflow-hidden transition-shadow duration-200"
        style={{
          background: "var(--card-bg)",
          border: `1.5px solid ${selected ? accentColor : "var(--card-border)"}`,
          boxShadow: `0 0 20px ${accentMuted}`,
        }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ background: `linear-gradient(135deg, ${accentMuted}, transparent)`,
            borderBottom: "1px solid var(--card-border)" }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: accentMuted }}>
            <Icon size={14} style={{ color: accentColor }} />
          </div>
          <div className="bullet-badge"
            style={{ backgroundColor: accentMuted, color: accentColor,
              fontSize: 10, fontWeight: 700, padding: "2px 10px 2px 14px",
              textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            {badge}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              const store = useTutorialStore.getState();
              const topic = nodeCategory === "state" ? "sensei.topic.isMut" 
                : nodeCategory === "context" ? "sensei.topic.isSigner"
                : originalType === "pdaNode" ? "sensei.topic.pdaSeeds"
                : "sensei.topic.instructionName";
              store.triggerSenseiHelp(topic);
            }}
            className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center hover:bg-neon-purple hover:text-white transition-colors"
            title="Ask Sensei"
          >
            <HelpCircle size={10} />
          </button>

          <motion.div className="ml-auto"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <span className="text-sm">✅</span>
          </motion.div>
        </div>

        {/* Name */}
        <div className="px-3 pt-3 pb-1">
          <p className="font-mono font-bold text-sm text-foreground">
            {structName || functionName || label}
          </p>
        </div>

        {/* Fields (read-only) */}
        {fields && fields.length > 0 && (
          <div className="px-3 py-2 space-y-1">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-muted">{f.name}</span>
                <span className="text-muted-dim">:</span>
                <span style={{ color: accentColor }}>{f.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body (read-only) */}
        {body && (
          <div className="px-3 py-2">
            <pre className="text-[10px] font-mono text-muted bg-surface rounded p-2 overflow-hidden">
              {body.replace(/\\n/g, "\n")}
            </pre>
          </div>
        )}

        {/* PDA Seeds */}
        {pdaSeeds && (
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-muted">seeds:</span>
              <span style={{ color: accentColor }}>{pdaSeeds}</span>
            </div>
          </div>
        )}

        {/* CPI Program / Action */}
        {programName && action && (
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-muted">program:</span>
              <span style={{ color: accentColor }}>{programName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-muted">action:</span>
              <span style={{ color: accentColor }}>{action}</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent" style={{ bottom: -6 }}>
        <div className="bullet-handle-source" style={{ backgroundColor: accentColor }} />
      </Handle>
    </motion.div>
  );
}

export default memo(TutorialBulletNode);
