"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Volume2, VolumeX, Minimize2 } from "lucide-react";
import { useTutorialStore, triggerSenseiVoice } from "./useTutorialStore";

export default function SolanaSensei() {
  const { senseiMessage, senseiMood, levelCompleted } = useTutorialStore();
  const [minimized, setMinimized] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const prevMsgRef = useRef(senseiMessage);
  const typewriterRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Typewriter effect when message changes
  useEffect(() => {
    if (senseiMessage === prevMsgRef.current) return;
    prevMsgRef.current = senseiMessage;

    setDisplayedText("");
    let i = 0;
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayedText(senseiMessage.slice(0, i));
      if (i >= senseiMessage.length) {
        clearInterval(typewriterRef.current);
      }
    }, 20);

    return () => { if (typewriterRef.current) clearInterval(typewriterRef.current); };
  }, [senseiMessage]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    triggerSenseiVoice(senseiMessage);
    const check = setInterval(() => {
      if (!window.speechSynthesis?.speaking) {
        setIsSpeaking(false);
        clearInterval(check);
      }
    }, 200);
  };

  const moodColor = senseiMood === "happy" ? "#14f195"
    : senseiMood === "angry" ? "#ef4444"
    : senseiMood === "excited" ? "#f0f056"
    : "#9945ff";

  const moodEmoji = senseiMood === "happy" ? "😊"
    : senseiMood === "angry" ? "😤"
    : senseiMood === "excited" ? "🎉"
    : "🥷";

  if (minimized) {
    return (
      <motion.button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center
                   shadow-2xl cursor-pointer"
        style={{
          background: "var(--card-bg)",
          border: `2px solid ${moodColor}`,
          boxShadow: `0 0 20px ${moodColor}30`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity } }}
      >
        <span className="text-2xl">🥷</span>
        {levelCompleted && (
          <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}>
            <span className="text-[8px]">✓</span>
          </motion.div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-50 w-[340px] sensei-bubble"
    >
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "var(--glass-bg)",
          border: `1.5px solid ${moodColor}40`,
          boxShadow: `0 0 30px ${moodColor}15, 0 8px 32px rgba(0,0,0,0.3)`,
          backdropFilter: "blur(20px)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: `1px solid ${moodColor}20` }}>
          <div className="flex items-center gap-2">
            <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${moodColor}20, ${moodColor}05)`,
                border: `1.5px solid ${moodColor}30`,
              }}
              animate={senseiMood === "angry"
                ? { rotate: [-3, 3, -3], x: [-2, 2, -2] }
                : senseiMood === "excited"
                  ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : { y: [0, -2, 0] }}
              transition={{ duration: senseiMood === "angry" ? 0.3 : 2, repeat: Infinity }}>
              <Swords size={16} style={{ color: moodColor }} />
              <motion.div className="absolute inset-0 rounded-xl"
                style={{ border: `2px solid ${moodColor}` }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>{moodEmoji}</span>
                <span>Solana Sensei</span>
              </div>
              <div className="text-[10px] font-mono font-semibold" style={{ color: moodColor }}>
                {senseiMood === "angry" ? "⚠️ ERROR" : senseiMood === "excited" ? "✨ LEVEL UP" : "📡 ACTIVE"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSpeak}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors">
              <Minimize2 size={14} />
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="px-4 py-3">
          <AnimatePresence mode="wait">
            <motion.p key={senseiMessage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-foreground leading-relaxed"
              style={{ minHeight: 48 }}>
              {displayedText}
              {displayedText.length < senseiMessage.length && (
                <motion.span className="inline-block w-0.5 h-3 ml-0.5 bg-neon-green"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }} />
              )}
            </motion.p>
          </AnimatePresence>

          {/* Audio waveform when speaking */}
          {isSpeaking && (
            <div className="flex items-end gap-[2px] mt-2 h-4">
              {[0,1,2,3,4,5,6,7].map((i) => (
                <motion.div key={i}
                  className="w-[2px] rounded-full"
                  style={{ backgroundColor: moodColor }}
                  animate={{ height: [3, 12, 3] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
