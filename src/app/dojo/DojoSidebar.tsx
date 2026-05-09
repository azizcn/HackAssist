"use client";

import { useState, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Database, Code2, Lock, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { useTutorialStore } from "./useTutorialStore";
import { getLevelConfig, type SidebarItem } from "./levelConfigs";

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Database, Code2,
};

export default function DojoSidebar() {
  const { currentLevel, currentStep } = useTutorialStore();
  const config = getLevelConfig(currentLevel);
  const [open, setOpen] = useState(true);

  const onDragStart = (e: DragEvent, item: SidebarItem) => {
    e.dataTransfer.setData("application/reactflow-dojo",
      JSON.stringify({ type: item.type, data: item.defaultData }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: "var(--glass-bg)", borderRight: "1px solid var(--card-border)" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-card-border">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple to-neon-green flex items-center justify-center">
          <GraduationCap size={15} className="text-background" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">Dojo Toolbox</div>
          <div className="text-[10px] text-muted-dim">Step {currentStep + 1} of {config.totalSteps}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-purple"
            initial={{ width: 0 }}
            animate={{ width: `${config.totalSteps > 0 ? ((currentStep) / config.totalSteps) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>
      </div>

      {/* Components */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-muted
                     hover:text-foreground transition-colors uppercase tracking-wider">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Components
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 pb-2">
              {config.sidebarItems.map((item) => {
                const isAvailable = item.availableAtStep <= currentStep;
                const isNext = item.availableAtStep === currentStep;
                const IconComp = ICON_MAP[item.icon] || Code2;

                return (
                  <motion.div key={item.label}
                    draggable={isAvailable}
                    onDragStart={(e) => {
                      if (isAvailable) onDragStart(e as unknown as DragEvent, item);
                    }}
                    whileHover={isAvailable ? { scale: 1.02, x: 4 } : {}}
                    whileTap={isAvailable ? { scale: 0.98 } : {}}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors
                      border ${isNext ? "border-neon-green/40" : "border-transparent"}
                      ${isAvailable ? "cursor-grab active:cursor-grabbing hover:border-card-border" : "cursor-not-allowed opacity-40"}`}
                    style={{ background: isNext ? "rgba(20,241,149,0.05)" : "var(--surface)" }}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 relative"
                      style={{ backgroundColor: `${item.color}20` }}>
                      <IconComp size={14} style={{ color: item.color }} />
                      {!isAvailable && (
                        <div className="absolute inset-0 rounded-md bg-background/60 flex items-center justify-center">
                          <Lock size={10} className="text-muted-dim" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{item.label}</div>
                    </div>
                    {isNext && (
                      <motion.div className="w-2 h-2 rounded-full bg-neon-green"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                    <div className="bullet-badge-sm"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Level info footer */}
      <div className="px-4 py-3 border-t border-card-border">
        <div className="text-[10px] text-muted-dim uppercase tracking-wider mb-1">Current Level</div>
        <div className="text-sm font-bold gradient-text">{config.title}</div>
        <p className="text-[10px] text-muted mt-0.5">{config.subtitle}</p>
      </div>
    </div>
  );
}
