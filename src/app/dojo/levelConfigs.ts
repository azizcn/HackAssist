// ── Level configurations for Genesis Dojo ───────────────────────────────
// Each level defines ghost nodes, expected edges, sidebar palette, and
// Sensei dialogue per step.

import type { TutorialLevel } from "./useTutorialStore";

// ── Types ───────────────────────────────────────────────────────────────
export interface GhostNodeConfig {
  id: string;
  /** The step at which this ghost appears (0-indexed) */
  step: number;
  /** Expected React Flow node type */
  expectedType: string;
  /** Expected data properties for validation */
  expectedData: Record<string, unknown>;
  /** Display label on the ghost placeholder */
  label: string;
  /** Position on canvas */
  position: { x: number; y: number };
  /** Category color for the ghost outline */
  accentColor: string;
}

export interface GhostEdgeConfig {
  id: string;
  /** The step at which this connection should be made */
  step: number;
  /** Expected source ghost node id */
  sourceGhostId: string;
  /** Expected target ghost node id */
  targetGhostId: string;
}

export interface SidebarItem {
  type: string;
  label: string;
  icon: string; // lucide icon name
  color: string;
  defaultData: Record<string, unknown>;
  /** Only available at this step (-1 = always available) */
  availableAtStep: number;
}

export interface StepDialogue {
  /** Step index (0-based) */
  step: number;
  /** Sensei instruction for the step */
  instruction: string;
  /** On success */
  successMessage: string;
  /** On error */
  errorMessage: string;
}

export interface LevelConfig {
  level: TutorialLevel;
  title: string;
  subtitle: string;
  description: string;
  totalSteps: number;
  ghostNodes: GhostNodeConfig[];
  ghostEdges: GhostEdgeConfig[];
  sidebarItems: SidebarItem[];
  dialogue: StepDialogue[];
}

// ── Level 1: Hello World ────────────────────────────────────────────────
const level1: LevelConfig = {
  level: 1,
  title: "Hello World",
  subtitle: "Log a message to the Solana runtime",
  description:
    "Every Solana Program starts with a single Instruction. Drop a Context struct and an Instruction, then connect them to produce your first on-chain log.",
  totalSteps: 3,
  ghostNodes: [
    {
      id: "ghost-l1-ctx",
      step: 0,
      expectedType: "structNode",
      expectedData: { nodeCategory: "context" },
      label: "Drop Context Struct here",
      position: { x: 300, y: 80 },
      accentColor: "#9945ff",
    },
    {
      id: "ghost-l1-fn",
      step: 1,
      expectedType: "functionNode",
      expectedData: {},
      label: "Drop Instruction here",
      position: { x: 300, y: 360 },
      accentColor: "#f0f056",
    },
  ],
  ghostEdges: [
    {
      id: "ghost-edge-l1-ctx-fn",
      step: 2,
      sourceGhostId: "ghost-l1-ctx",
      targetGhostId: "ghost-l1-fn",
    },
  ],
  sidebarItems: [
    {
      type: "structNode",
      label: "Context Struct",
      icon: "Shield",
      color: "#9945ff",
      defaultData: {
        label: "Hello Context",
        structName: "HelloCtx",
        fields: [{ name: "signer", type: "Signer<'info>" }],
        nodeCategory: "context",
      },
      availableAtStep: 0,
    },
    {
      type: "functionNode",
      label: "Instruction",
      icon: "Code2",
      color: "#f0f056",
      defaultData: {
        label: "fn hello_world",
        functionName: "hello_world",
        body: 'msg!("Hello, Solana!");\\nOk(())',
        connectedContext: "HelloCtx",
      },
      availableAtStep: 1,
    },
  ],
  dialogue: [
    {
      step: 0,
      instruction:
        "First, every Instruction needs accounts. Drag the Context Struct onto the ghost node. A Context defines which accounts your Instruction requires — at minimum, a Signer!",
      successMessage:
        "Perfect! Your Context is set. The Signer account tells the runtime WHO authorized this transaction. Without it, Solana rejects everything. 🔐",
      errorMessage:
        "Hold up! That's not a Context Struct. You need a Context with a Signer account — that's the account that authorizes the transaction!",
    },
    {
      step: 1,
      instruction:
        "Now drop an Instruction node. This is the entry point of your Program — think of it as a function that the Solana runtime executes when invoked.",
      successMessage:
        'Excellent! Your hello_world Instruction is ready. It uses msg!() to log "Hello, Solana!" — this gets written to the transaction log, costing minimal Compute Units. ⚡',
      errorMessage:
        "That's not an Instruction node! Drag the Instruction component — it's the function that executes your Program logic.",
    },
    {
      step: 2,
      instruction:
        "Final step! Connect the Context to the Instruction. Drag from the Context's bottom handle to the Instruction's top handle. This tells Anchor which accounts to validate.",
      successMessage:
        "🎉 YATTA! Your first Solana Program compiles! The Context validates accounts, the Instruction executes logic. That's the Anchor pattern: Context → Instruction. Simple but powerful!",
      errorMessage:
        "Wrong connection! Connect the Context (top) → Instruction (bottom). The data flows top-down — Context provides accounts, Instruction uses them.",
    },
  ],
};

// ── Level 2: Basic Counter ──────────────────────────────────────────────
const level2: LevelConfig = {
  level: 2,
  title: "Basic Counter",
  subtitle: "Increment a u64 variable stored in a PDA",
  description:
    "Now you'll store persistent state on-chain. Create a State Account to hold a counter, wire it through a Context, and write an Instruction to increment it.",
  totalSteps: 5,
  ghostNodes: [
    {
      id: "ghost-l2-state",
      step: 0,
      expectedType: "structNode",
      expectedData: { nodeCategory: "state" },
      label: "Drop State Account here",
      position: { x: 300, y: 60 },
      accentColor: "#14f195",
    },
    {
      id: "ghost-l2-ctx",
      step: 1,
      expectedType: "structNode",
      expectedData: { nodeCategory: "context" },
      label: "Drop Context Struct here",
      position: { x: 300, y: 300 },
      accentColor: "#9945ff",
    },
    {
      id: "ghost-l2-fn",
      step: 2,
      expectedType: "functionNode",
      expectedData: {},
      label: "Drop Instruction here",
      position: { x: 300, y: 540 },
      accentColor: "#f0f056",
    },
  ],
  ghostEdges: [
    {
      id: "ghost-edge-l2-state-ctx",
      step: 3,
      sourceGhostId: "ghost-l2-state",
      targetGhostId: "ghost-l2-ctx",
    },
    {
      id: "ghost-edge-l2-ctx-fn",
      step: 4,
      sourceGhostId: "ghost-l2-ctx",
      targetGhostId: "ghost-l2-fn",
    },
  ],
  sidebarItems: [
    {
      type: "structNode",
      label: "State Account",
      icon: "Database",
      color: "#14f195",
      defaultData: {
        label: "CounterState",
        structName: "CounterState",
        fields: [{ name: "count", type: "u64" }],
        nodeCategory: "state",
      },
      availableAtStep: 0,
    },
    {
      type: "structNode",
      label: "Context Struct",
      icon: "Shield",
      color: "#9945ff",
      defaultData: {
        label: "Increment Context",
        structName: "IncrementCtx",
        fields: [
          { name: "counter", type: "Account<'info, CounterState>" },
          { name: "signer", type: "Signer<'info>" },
        ],
        nodeCategory: "context",
      },
      availableAtStep: 1,
    },
    {
      type: "functionNode",
      label: "Instruction",
      icon: "Code2",
      color: "#f0f056",
      defaultData: {
        label: "fn increment",
        functionName: "increment",
        body: "ctx.accounts.counter.count += 1;\\nOk(())",
        connectedContext: "IncrementCtx",
      },
      availableAtStep: 2,
    },
  ],
  dialogue: [
    {
      step: 0,
      instruction:
        "Let's store data on-chain! Drag a State Account — this is where Solana keeps your counter value. Under the hood, it's an Account with a discriminator and your u64 field, stored in a PDA.",
      successMessage:
        "Your CounterState is on the canvas! This struct gets serialized into an Account on Solana. The #[account] macro tells Anchor to manage its discriminator — 8 bytes of overhead per account. Compute Units well spent! 💾",
      errorMessage:
        "That's not a State Account! You need one with nodeCategory 'state' — this is the on-chain data structure, not a Context.",
    },
    {
      step: 1,
      instruction:
        "Now add a Context Struct. It must reference both the CounterState account AND a Signer. The Context is how Anchor validates that the right accounts are passed to your Instruction.",
      successMessage:
        "Context set! Notice it has TWO accounts: the counter (mutable, so we can write to it) and a signer (who pays for the transaction). Solana enforces this at the runtime level — no Signer, no execution! 🛡️",
      errorMessage:
        "Hold up! You can't modify an account without making it mutable and providing a Signer. That's a strict Solana rule! Drop a Context Struct.",
    },
    {
      step: 2,
      instruction:
        "Drop the Instruction node. This function increments `ctx.accounts.counter.count` by 1. Simple, but it's writing to on-chain state — real blockchain mutation! 🔥",
      successMessage:
        "Your increment function is ready! Each call to this Instruction costs roughly 200 Compute Units — Solana processes it in ~400ms. Try doing THAT on Ethereum! ⚡",
      errorMessage:
        "That's not an Instruction! Drag the Instruction component to define the increment logic.",
    },
    {
      step: 3,
      instruction:
        "Connect State Account → Context. This tells Anchor that the Context needs access to the CounterState account. Drag from the State's bottom handle to the Context's top handle.",
      successMessage:
        "Connected! Anchor will now deserialize the CounterState account and validate it belongs to your Program. If anyone passes a fake account, the runtime will reject it immediately. Security by default! 🔐",
      errorMessage:
        "Wrong connection! State Account must connect to the Context Struct. The flow is: State → Context → Instruction (top to bottom).",
    },
    {
      step: 4,
      instruction:
        "Last connection! Link Context → Instruction. This is the final piece — the Instruction function receives the validated Context, reads/writes accounts through it.",
      successMessage:
        "🏆 INCREDIBLE! You just built a fully functional counter Program! State → Context → Instruction. This is the Anchor holy trinity. You're ready to deploy to Devnet!",
      errorMessage:
        "Almost there! Connect the Context (source) to the Instruction (target). Top-down flow, always!",
    },
  ],
};

// ── Level 3: Token Transfer (Stub) ──────────────────────────────────────
const level3: LevelConfig = {
  level: 3,
  title: "Token Transfer",
  subtitle: "Move SOL between two accounts",
  description:
    "The final challenge! Build a Program that transfers SOL using a Cross-Program Invocation (CPI) to the System Program. This is how real DeFi works.",
  totalSteps: 0,
  ghostNodes: [],
  ghostEdges: [],
  sidebarItems: [],
  dialogue: [],
};

// ── Export ───────────────────────────────────────────────────────────────
export const LEVEL_CONFIGS: Record<TutorialLevel, LevelConfig> = {
  1: level1,
  2: level2,
  3: level3,
};

export function getLevelConfig(level: TutorialLevel): LevelConfig {
  return LEVEL_CONFIGS[level];
}
