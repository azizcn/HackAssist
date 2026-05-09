"use client";

import { create } from "zustand";

// ── Types ───────────────────────────────────────────────────────────────
export type TutorialLevel = 1 | 2 | 3;
export type NodePlacementState = "ghost" | "placed" | "error";
export type EdgeConnectionState = "pending" | "connected" | "error";
export type SenseiMood = "neutral" | "happy" | "angry" | "excited";

export interface TutorialState {
  // Level & step tracking
  currentLevel: TutorialLevel;
  currentStep: number;
  totalSteps: number;
  completedLevels: number[];
  levelCompleted: boolean;

  // Node / edge validation states
  nodeStates: Record<string, NodePlacementState>;
  edgeStates: Record<string, EdgeConnectionState>;

  // Sensei
  senseiMessage: string;
  senseiMood: SenseiMood;

  // Actions
  startLevel: (level: TutorialLevel, totalSteps: number) => void;
  advanceStep: () => void;
  placeNode: (ghostId: string) => void;
  triggerNodeError: (ghostId: string) => void;
  clearNodeError: (ghostId: string) => void;
  connectEdge: (edgeId: string) => void;
  triggerEdgeError: (edgeId: string) => void;
  setSenseiMessage: (text: string, mood: SenseiMood) => void;
  resetLevel: () => void;
  completeLevel: () => void;
}

// ── Placeholder for ElevenLabs TTS API ──────────────────────────────────
export function triggerSenseiVoice(text: string): void {
  // TODO: Hook up to ElevenLabs TTS API
  // For now, use Web Speech API as fallback
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
  console.log("[Solana Sensei TTS]:", text);
}

// ── Store ───────────────────────────────────────────────────────────────
export const useTutorialStore = create<TutorialState>((set, get) => ({
  currentLevel: 1,
  currentStep: 0,
  totalSteps: 0,
  completedLevels: [],
  levelCompleted: false,

  nodeStates: {},
  edgeStates: {},

  senseiMessage: "Welcome to the Dojo, young builder. Let's forge your first Solana Program! 🥷",
  senseiMood: "neutral",

  startLevel: (level, totalSteps) =>
    set({
      currentLevel: level,
      currentStep: 0,
      totalSteps,
      levelCompleted: false,
      nodeStates: {},
      edgeStates: {},
      senseiMessage: level === 1
        ? "Level 1: Hello World! Every Solana Program starts with a single Instruction. Let's build one, step by step."
        : level === 2
          ? "Level 2: Basic Counter! Now we store state on-chain using a PDA. Compute Units are cheap — let's increment!"
          : "Level 3: Token Transfer! Time to move SOL between accounts. Watch those Signers! 🔐",
      senseiMood: "excited",
    }),

  advanceStep: () => {
    const { currentStep, totalSteps } = get();
    const nextStep = currentStep + 1;
    if (nextStep >= totalSteps) {
      set({
        currentStep: nextStep,
        levelCompleted: true,
        senseiMessage: "Outstanding! You have mastered this level. Your Program is ready to deploy! 🚀",
        senseiMood: "excited",
      });
    } else {
      set({
        currentStep: nextStep,
        senseiMood: "happy",
      });
    }
  },

  placeNode: (ghostId) =>
    set((state) => ({
      nodeStates: { ...state.nodeStates, [ghostId]: "placed" },
    })),

  triggerNodeError: (ghostId) =>
    set((state) => ({
      nodeStates: { ...state.nodeStates, [ghostId]: "error" },
    })),

  clearNodeError: (ghostId) =>
    set((state) => ({
      nodeStates: { ...state.nodeStates, [ghostId]: "ghost" },
    })),

  connectEdge: (edgeId) =>
    set((state) => ({
      edgeStates: { ...state.edgeStates, [edgeId]: "connected" },
    })),

  triggerEdgeError: (edgeId) =>
    set((state) => ({
      edgeStates: { ...state.edgeStates, [edgeId]: "error" },
    })),

  setSenseiMessage: (text, mood) =>
    set({ senseiMessage: text, senseiMood: mood }),

  resetLevel: () => {
    const { currentLevel, totalSteps } = get();
    set({
      currentStep: 0,
      levelCompleted: false,
      nodeStates: {},
      edgeStates: {},
      senseiMessage: "Let's try again. A true builder never gives up! 🥷",
      senseiMood: "neutral",
    });
    // Re-trigger startLevel to reset dialogue
    get().startLevel(currentLevel, totalSteps);
  },

  completeLevel: () =>
    set((state) => ({
      completedLevels: state.completedLevels.includes(state.currentLevel)
        ? state.completedLevels
        : [...state.completedLevels, state.currentLevel],
      levelCompleted: true,
      senseiMessage: "Level complete! You've earned your next belt, builder. 🏆",
      senseiMood: "excited",
    })),
}));
