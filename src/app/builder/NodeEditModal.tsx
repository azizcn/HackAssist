import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, Save, HelpCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useTutorialStore, triggerSenseiVoice } from "../dojo/useTutorialStore";
import { getLevelConfig } from "../dojo/levelConfigs";
import { Node } from "@xyflow/react";

interface NodeEditModalProps {
  node: Node | null;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (id: string, updates: any) => void;
}

const AskSenseiButton = ({ topic, onAsk }: { topic: string; onAsk: (topic: string) => void }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onAsk(topic);
    }}
    className="inline-flex items-center justify-center w-5 h-5 ml-2 rounded-full bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_8px_rgba(153,69,255,0.4)] pointer-events-auto"
    title="Ask Solana Sensei"
  >
    <HelpCircle size={12} />
  </button>
);

export default function NodeEditModal({ node, onClose, onSave }: NodeEditModalProps) {
  const { t } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(node.data || {});
    }
  }, [node]);

  if (!node) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const actualType = node.data?.originalType || node.type;

  const handleAskSensei = (topic: string) => {
    const store = useTutorialStore.getState();
    store.triggerSenseiHelp(topic);
    
    if (store.currentLevel === 0 && store.currentStep === 2) {
      store.advanceStep();
      const config = getLevelConfig(0);
      const dialogue = config.dialogue[2];
      if (dialogue) {
        store.setSenseiMessage(dialogue.successMessage, "happy");
        triggerSenseiVoice(t(dialogue.successMessage));
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-card-bg border border-card-border rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-card-border">
                <Settings2 size={16} className="text-neon-purple" />
              </div>
              <h2 className="text-base font-bold text-foreground">{t("node.edit.title")}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Common field: Label */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">{t("node.edit.label")}</label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
              />
              <p className="text-[10px] text-muted-dim mt-1">{t("node.edit.labelHint")}</p>
            </div>

            {/* Struct / Account specific fields */}
            {(actualType === "structNode" || actualType === "accountNode") && (
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">{t("node.edit.accountName")}</label>
                <input
                  type="text"
                  value={formData.structName || formData.accountName || ""}
                  onChange={(e) => handleChange(formData.structName !== undefined ? "structName" : "accountName", e.target.value)}
                  className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                />
                <p className="text-[10px] text-muted-dim mt-1">{t("node.edit.accountNameHint")}</p>
              </div>
            )}

            {/* Function / Instruction specific fields */}
            {(actualType === "functionNode" || actualType === "instructionNode") && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-xs font-semibold text-muted mb-1">
                    {t("node.edit.instructionName")}
                    <AskSenseiButton topic="sensei.topic.instructionName" onAsk={handleAskSensei} />
                  </div>
                  <input
                    type="text"
                    value={formData.functionName || ""}
                    onChange={(e) => handleChange("functionName", e.target.value)}
                    className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  />
                  <p className="text-[10px] text-muted-dim mt-1">{t("node.edit.instructionNameHint")}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">{t("node.edit.arguments") || "Arguments"}</label>
                  <input
                    type="text"
                    value={formData.args || ""}
                    onChange={(e) => handleChange("args", e.target.value)}
                    placeholder="e.g. amount: u64"
                    className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  />
                  <p className="text-[10px] text-muted-dim mt-1">{t("node.edit.argumentsHint") || "Comma-separated arguments"}</p>
                </div>
              </div>
            )}

            {/* Log / Message specific fields */}
            {(actualType === "logNode" || formData.nodeCategory === "log") && (
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">{t("node.edit.messageString") || "Message String"}</label>
                <textarea
                  value={formData.messageString || ""}
                  onChange={(e) => handleChange("messageString", e.target.value)}
                  placeholder='e.g. "Hello from Solana!"'
                  className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors min-h-[80px]"
                />
                <p className="text-[10px] text-muted-dim mt-1">{t("node.edit.messageStringHint") || "The message to log on-chain"}</p>
              </div>
            )}

            {/* Common field: isMut and isSigner toggles for structurally relevant nodes */}
            {(actualType === "structNode" || actualType === "accountNode") && (
              <div className="space-y-3 pt-2">
                <div 
                  onClick={() => handleChange("isSigner", !formData.isSigner)}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface border border-card-border cursor-pointer hover:border-neon-purple transition-colors"
                >
                  <div>
                    <span className="flex items-center text-sm font-bold text-foreground">
                      {t("node.edit.isSigner")}
                      <AskSenseiButton topic="sensei.topic.isSigner" onAsk={handleAskSensei} />
                    </span>
                    <p className="text-[10px] text-muted-dim">{t("node.edit.isSignerHint")}</p>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.isSigner ? 'bg-neon-green' : 'bg-muted'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.isSigner ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>

                <div 
                  onClick={() => handleChange("isMut", !formData.isMut)}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface border border-card-border cursor-pointer hover:border-neon-purple transition-colors"
                >
                  <div>
                    <span className="flex items-center text-sm font-bold text-foreground">
                      {t("node.edit.isMut")}
                      <AskSenseiButton topic="sensei.topic.isMut" onAsk={handleAskSensei} />
                    </span>
                    <p className="text-[10px] text-muted-dim">{t("node.edit.isMutHint")}</p>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.isMut ? 'bg-neon-purple' : 'bg-muted'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.isMut ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>
            )}

            {/* PDA specific fields */}
            {actualType === "pdaNode" && (
              <div>
                <div className="flex items-center text-xs font-semibold text-muted mb-1">
                  PDA Seeds
                  <AskSenseiButton topic="sensei.topic.pdaSeeds" onAsk={handleAskSensei} />
                </div>
                <input
                  type="text"
                  value={formData.pdaSeeds || ""}
                  onChange={(e) => handleChange("pdaSeeds", e.target.value)}
                  className="w-full bg-surface border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder='e.g. "my_seed"'
                />
                <p className="text-[10px] text-muted-dim mt-1">String or reference used to derive PDA.</p>
              </div>
            )}

            {/* In a real scenario, we might also parse `fields` array and allow editing `isMut` and `isSigner` per field. 
                For the Dojo, we can allow editing simple attributes if they existed as top-level booleans, but our nodes use `fields: [{name, type}]`.
                For demo purposes, we will stick to basic info or show read-only warnings. */}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-card-border bg-surface/50">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neon-purple hover:bg-neon-purple/90 font-semibold text-sm text-white transition-colors shadow-lg shadow-neon-purple/20"
            >
              <Save size={16} />
              {t("node.edit.save")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
