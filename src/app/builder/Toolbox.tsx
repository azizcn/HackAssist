"use client";

import { motion } from "framer-motion";
import {
  Database,
  Shield,
  Code2,
  ArrowRightLeft,
  Coins,
  Image,
  ChevronDown,
  ChevronRight,
  Blocks,
  KeyRound,
  Link2,
} from "lucide-react";
import { useState, type DragEvent } from "react";
import { useApp } from "../context/AppContext";

interface ToolboxItem {
  type: string;
  label: string;
  labelTr: string;
  icon: React.ElementType;
  color: string;
  defaultData: Record<string, unknown>;
}

interface ToolboxCategory {
  key: string;
  labelKey: string;
  items: ToolboxItem[];
}

const CATEGORIES: ToolboxCategory[] = [
  {
    key: "templates",
    labelKey: "builder.cat.templates",
    items: [
      {
        type: "templateNode",
        label: "Basic Coin",
        labelTr: "Temel Coin",
        icon: Coins,
        color: "#14f195",
        defaultData: { label: "Basic Coin", templateType: "basic_coin" },
      },
      {
        type: "templateNode",
        label: "Basic NFT",
        labelTr: "Temel NFT",
        icon: Image,
        color: "#9945ff",
        defaultData: { label: "Basic NFT", templateType: "basic_nft" },
      },
    ],
  },
  {
    key: "structures",
    labelKey: "builder.cat.structures",
    items: [
      {
        type: "structNode",
        label: "State Account",
        labelTr: "State Hesabı",
        icon: Database,
        color: "#14f195",
        defaultData: {
          label: "State Account",
          structName: "MyState",
          fields: [{ name: "id", type: "u64" }],
          nodeCategory: "state",
        },
      },
      {
        type: "structNode",
        label: "Context Struct",
        labelTr: "Context Struct",
        icon: Shield,
        color: "#9945ff",
        defaultData: {
          label: "Context Struct",
          structName: "MyContext",
          fields: [{ name: "signer", type: "Signer<'info>" }],
          nodeCategory: "context",
        },
      },
    ],
  },
  {
    key: "logic",
    labelKey: "builder.cat.logic",
    items: [
      {
        type: "functionNode",
        label: "Instruction",
        labelTr: "Talimat",
        icon: Code2,
        color: "#f0f056",
        defaultData: {
          label: "Instruction",
          functionName: "my_instruction",
          body: "Ok(())",
          connectedContext: "",
        },
      },
    ],
  },
  {
    key: "advanced",
    labelKey: "builder.cat.advanced",
    items: [
      {
        type: "pdaNode",
        label: "PDA (Program Derived Address)",
        labelTr: "PDA (Program Türetilmiş Adres)",
        icon: KeyRound,
        color: "#06b6d4",
        defaultData: {
          label: "PDA",
          pdaName: "my_pda",
          seeds: ["seed"],
          bump: true,
        },
      },
      {
        type: "cpiNode",
        label: "CPI (Cross-Program Invocation)",
        labelTr: "CPI (Çapraz Program Çağrısı)",
        icon: Link2,
        color: "#f43f5e",
        defaultData: {
          label: "CPI",
          targetProgram: "Token Program",
          instruction: "transfer",
          accounts: [{ name: "from", type: "AccountInfo<'info>" }],
        },
      },
    ],
  },
  {
    key: "actions",
    labelKey: "builder.cat.actions",
    items: [
      {
        type: "actionNode",
        label: "Transfer SOL",
        labelTr: "SOL Transferi",
        icon: ArrowRightLeft,
        color: "#38bdf8",
        defaultData: {
          label: "Transfer SOL",
          actionType: "transfer",
          params: [
            { name: "amount", type: "u64" },
            { name: "recipient", type: "Pubkey" },
          ],
        },
      },
      {
        type: "actionNode",
        label: "Mint Token",
        labelTr: "Token Basımı",
        icon: Coins,
        color: "#fb923c",
        defaultData: {
          label: "Mint Token",
          actionType: "mint",
          params: [{ name: "amount", type: "u64" }],
        },
      },
    ],
  },
];

export default function Toolbox() {
  const { t, locale } = useApp();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    templates: true,
    structures: true,
    logic: true,
    advanced: true,
    actions: true,
  });

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onDragStart = (e: DragEvent, item: ToolboxItem) => {
    e.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: item.type, data: item.defaultData })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        borderRight: "1px solid var(--card-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-card-border">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center">
          <Blocks size={15} className="text-background" />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{t("builder.toolbox")}</div>
          <div className="text-[10px] text-muted-dim">{t("builder.toolboxHint")}</div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {CATEGORIES.map((cat) => (
          <div key={cat.key}>
            <button
              onClick={() => toggleCategory(cat.key)}
              className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-muted
                         hover:text-foreground transition-colors uppercase tracking-wider"
            >
              {openCategories[cat.key] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {t(cat.labelKey)}
            </button>

            {openCategories[cat.key] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 pb-2"
              >
                {cat.items.map((item) => (
                  <motion.div
                    key={item.label}
                    draggable
                    onDragStart={(e) => onDragStart(e as unknown as DragEvent, item)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing
                               transition-colors border border-transparent hover:border-card-border"
                    style={{
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {locale === "tr" ? item.labelTr : item.label}
                      </div>
                    </div>
                    <div
                      className="bullet-badge-sm"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
