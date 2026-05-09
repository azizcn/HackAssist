"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { motion } from "framer-motion";
import DojoCanvas from "./DojoCanvas";
import DojoSidebar from "./DojoSidebar";
import SolanaSensei from "./SolanaSensei";
import DeployButton from "./DeployButton";
import { useTutorialStore } from "./useTutorialStore";
import { getLevelConfig } from "./levelConfigs";

export default function DojoPage() {
  const { currentLevel, startLevel, completedLevels } = useTutorialStore();
  const config = getLevelConfig(currentLevel);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!currentLevel) {
      startLevel(1, getLevelConfig(1).totalSteps);
    } else {
      startLevel(currentLevel, config.totalSteps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Level Selector Header */}
      <div className="h-12 border-b border-card-border flex items-center px-4 bg-glass-bg z-10 shrink-0 gap-4">
        <div className="font-bold text-sm">🥷 Genesis Dojo</div>
        <div className="h-4 w-px bg-card-border" />
        
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((level) => {
            const isActive = currentLevel === level;
            const isCompleted = completedLevels.includes(level);
            return (
              <button
                key={level}
                onClick={() => startLevel(level as 1 | 2 | 3, getLevelConfig(level as 1 | 2 | 3).totalSteps)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative overflow-hidden
                  ${isActive ? "text-background" : isCompleted ? "text-neon-green" : "text-muted hover:text-foreground"}`}
                style={{
                  background: isActive ? "linear-gradient(135deg, var(--neon-purple), var(--neon-green))" : isCompleted ? "rgba(20,241,149,0.1)" : "transparent",
                  border: `1px solid ${isActive ? "transparent" : isCompleted ? "var(--neon-green)" : "var(--card-border)"}`
                }}
              >
                {isCompleted && !isActive && <span className="mr-1.5">✓</span>}
                Level {level}
                
                {isActive && (
                  <motion.div className="absolute inset-0 opacity-30"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-[280px] shrink-0 z-10">
          <DojoSidebar />
        </div>

        {/* Canvas */}
        <ReactFlowProvider>
          <DojoCanvas />
          <DeployButton />
        </ReactFlowProvider>
      </div>

      <SolanaSensei />
    </div>
  );
}
