"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, ChevronRight, Bot, Variable, Boxes, Cpu, Rocket, Lock, ArrowLeft, Shield, Puzzle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Language } from "../context/AppContext";
import DragDropQuiz from "./DragDropQuiz";
import TTSButton from "./TTSButton";

interface ModuleContent {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  analogies: Record<Language, string[]>;
  codeExample: string;
}

const modules: ModuleContent[] = [
  {
    title: "Variables & Mutability",
    subtitle: "The building blocks of Rust",
    icon: Variable,
    color: "neon-green",
    analogies: {
      javascript: [
        "In JavaScript, you declare variables with `let`, `const`, or `var`. Rust also uses `let` — but here's the twist: **all variables are immutable by default**.",
        "Think of Rust's `let x: i32 = 5` as JavaScript's `const x = 5` — you can't reassign it unless you explicitly say `let mut x = 5`.",
        "Rust has no `null` or `undefined`. Instead, it uses `Option<T>` — think of it as TypeScript's `T | null` but enforced by the compiler.",
      ],
      python: [
        "In Python, you just write `x = 5` and the type is inferred. Rust is similar with `let x = 5`, but you **can** specify types: `let x: i32 = 5`.",
        "Python variables are mutable by default. In Rust, it's the opposite — variables are **immutable** unless you add `mut`: `let mut counter = 0;`.",
        "Instead of Python's `None`, Rust uses `Option<T>`. The compiler won't let you skip the check.",
      ],
      csharp: [
        "C# has `int x = 5;` — Rust is almost identical: `let x: i32 = 5;`. The colon-based type annotation will feel familiar.",
        "In C#, you choose between `readonly` and mutable fields. In Rust, **everything is readonly by default**. Use `let mut x = 5;`.",
        "C#'s nullable types `int?` are like Rust's `Option<i32>`. But Rust forces you to unwrap them — no more `NullReferenceException`!",
      ],
      none: [
        "A **variable** is like a labeled storage box. You give it a name and put a value inside: `let name = \"Alice\";`",
        "By default, once you put something in the box, you can't change it. This is called **immutability**. If you need to change it, add `mut`: `let mut score = 0;`",
        "Every box has a specific **type** — `i32` holds whole numbers, `bool` holds true/false, `String` holds text.",
      ],
    },
    codeExample: `// Immutable variable (can't change)
let name: &str = "Solana Builder";

// Mutable variable (can change)
let mut score: u32 = 0;
score += 10;  // This works because of 'mut'

// Type inference — Rust figures out the type
let is_active = true;  // Rust knows this is bool

// Option type — might or might not have a value
let maybe_balance: Option<u64> = Some(1000);`,
  },
  {
    title: "Structs & Enums",
    subtitle: "Defining your program's data",
    icon: Boxes,
    color: "neon-purple",
    analogies: {
      javascript: [
        "A Rust `struct` is like a JavaScript object with a **fixed shape defined at compile time**. Think TypeScript `interface` that generates the blueprint.",
        "Rust `enum` is way more powerful than just constants — each variant can hold different data! Think of it as a TypeScript discriminated union.",
        "Methods use `impl` blocks — think of it as defining `Person.prototype.greet = function()` but cleaner.",
      ],
      python: [
        "A Rust struct is like a Python `@dataclass` — it defines a blueprint for data with named fields and types.",
        "Rust enums are like Python's `enum.Enum` on steroids — each variant can carry different data types. Perfect for state machines!",
        "Methods are added via `impl Person { ... }` blocks — similar to defining methods inside a Python class.",
      ],
      csharp: [
        "Rust structs are very similar to C# `record` types — they define custom data with named fields.",
        "Rust enums are like C# discriminated unions (or the new `record` pattern matching). Each variant is a distinct case.",
        "Unlike C# classes, Rust structs have **no inheritance**. Use **traits** (like interfaces) for shared behavior.",
      ],
      none: [
        "A **struct** is like a recipe card — it lists all the ingredients (fields) that a thing needs.",
        "An **enum** is like a traffic light — it can only be one of a few specific options: Red, Yellow, or Green.",
        "Once you have a recipe (struct), you can make one: `let alice = Person { name: String::from(\"Alice\"), age: 25 };`",
      ],
    },
    codeExample: `// Define a struct — the blueprint
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub is_frozen: bool,
}

// Define an enum — a set of possibilities
pub enum TransactionStatus {
    Pending,
    Confirmed { slot: u64 },
    Failed(String),
}

// Add methods with an impl block
impl TokenAccount {
    pub fn new(owner: Pubkey) -> Self {
        Self { owner, balance: 0, is_frozen: false }
    }
    pub fn deposit(&mut self, amount: u64) {
        self.balance += amount;
    }
}`,
  },
  {
    title: "Ownership & Borrowing",
    subtitle: "Rust's unique memory model",
    icon: Shield,
    color: "neon-green",
    analogies: {
      javascript: [
        "In JavaScript, the garbage collector handles memory. Rust has **no garbage collector** — instead, it uses **ownership rules** enforced at compile time.",
        "Think of ownership like passing a physical book. In Rust, when you 'give' a value to another variable, the original can no longer use it — this is called a **move**.",
        "**Borrowing** (`&`) is like lending your book — you let someone read it, but you still own it. `&mut` lets them write notes in it (mutable borrow).",
      ],
      python: [
        "Python uses reference counting + GC for memory. Rust achieves memory safety at **compile time** with zero runtime overhead through **ownership**.",
        "When you assign `b = a` in Python, both point to the same object. In Rust, `let b = a;` **moves** ownership — `a` is no longer valid!",
        "**References** (`&value`) are like Python's reading a shared reference — but Rust enforces that you can have many readers OR one writer, never both at once.",
      ],
      csharp: [
        "C#'s GC manages memory at runtime. Rust's **ownership system** does the same at compile time — zero overhead, zero GC pauses.",
        "Think of ownership like C#'s `using` statement but automatic. When a variable goes out of scope, Rust drops it immediately — like `IDisposable` everywhere.",
        "**Borrowing** is like passing a `ref` parameter — the function can use the data without taking ownership. `&mut` is like `ref` for writing.",
      ],
      none: [
        "**Ownership** is Rust's superpower. Every piece of data has exactly ONE owner. When the owner goes away, the data is automatically cleaned up.",
        "Imagine you have a toy. You can **give** it to a friend (move) — now you can't play with it. Or you can **lend** it (borrow) — they use it and give it back.",
        "**Borrowing** with `&` means \"look but don't touch.\" Borrowing with `&mut` means \"you can change it, but only you.\"",
      ],
    },
    codeExample: `// Ownership — each value has one owner
let s1 = String::from("hello");
let s2 = s1;  // s1 is MOVED to s2
// println!("{}", s1);  // ERROR! s1 is no longer valid

// Borrowing — lend without giving up ownership
fn calculate_length(s: &String) -> usize {
    s.len()  // We can read s, but don't own it
}

let my_string = String::from("hello");
let len = calculate_length(&my_string);
// my_string is still valid here!

// Mutable borrow — lend with write access
fn add_world(s: &mut String) {
    s.push_str(", world!");
}`,
  },
  {
    title: "Traits & Implementations",
    subtitle: "Shared behavior and polymorphism",
    icon: Puzzle,
    color: "neon-purple",
    analogies: {
      javascript: [
        "Rust **traits** are like TypeScript interfaces — they define a contract of methods that a type must implement.",
        "Since Rust has no classes, traits replace inheritance. Think of it as implementing multiple interfaces on a struct.",
        "Trait bounds (`fn process<T: Display>(item: T)`) are like TypeScript generics with constraints: `function process<T extends Displayable>(item: T)`.",
      ],
      python: [
        "Traits are like Python's Abstract Base Classes (`ABC`). They define methods a type **must** implement.",
        "Python uses duck typing — if it has `.quack()`, it's a duck. Rust traits make this explicit and checked at compile time.",
        "Deriving traits (`#[derive(Debug, Clone)]`) is like Python's `@dataclass` auto-generating `__repr__` and `__copy__`.",
      ],
      csharp: [
        "Rust **traits** are almost exactly like C# **interfaces** — they define method signatures that types must implement.",
        "Since Rust has no classes or inheritance, think of `impl Trait for Struct` like `class MyStruct : IMyInterface` in C#.",
        "Deriving traits (`#[derive(Debug)]`) is like C# source generators auto-implementing `ToString()` for you.",
      ],
      none: [
        "A **trait** is like a job description — it says what abilities a type must have. \"Must be able to display yourself\" = `Display` trait.",
        "Any struct can 'apply for the job' by implementing the trait. Multiple structs can implement the same trait!",
        "`#[derive(Debug)]` is a magic shortcut — it automatically teaches your struct how to print itself for debugging.",
      ],
    },
    codeExample: `// Define a trait — the contract
pub trait Stakeable {
    fn stake(&mut self, amount: u64) -> Result<(), String>;
    fn unstake(&mut self, amount: u64) -> Result<(), String>;
    fn rewards(&self) -> u64;
}

// Implement the trait for a struct
impl Stakeable for TokenAccount {
    fn stake(&mut self, amount: u64) -> Result<(), String> {
        if self.balance < amount {
            return Err("Insufficient balance".into());
        }
        self.balance -= amount;
        Ok(())
    }
    fn unstake(&mut self, amount: u64) -> Result<(), String> {
        self.balance += amount;
        Ok(())
    }
    fn rewards(&self) -> u64 {
        self.balance / 100  // 1% reward
    }
}`,
  },
  {
    title: "Solana & Anchor",
    subtitle: "Building on the blockchain",
    icon: Cpu,
    color: "neon-yellow",
    analogies: {
      javascript: [
        "A Solana program is like a **serverless function** (Vercel/AWS Lambda) that lives on the blockchain. Anyone can call it.",
        "The `#[program]` macro is like Express.js `app.use()` — it tells the framework these are your endpoints.",
        "Anchor is like Next.js for blockchain — handles boilerplate so you focus on logic. It auto-generates TypeScript client code!",
      ],
      python: [
        "Think of a Solana program like a **FastAPI app** on the blockchain. Each function is an API endpoint anyone can call.",
        "The `#[program]` macro is like Flask's `@app.route()` decorator — it marks functions as publicly callable.",
        "Anchor handles serialization automatically, just like Pydantic models in FastAPI.",
      ],
      csharp: [
        "A Solana program is like an **ASP.NET Web API controller** on the blockchain. Each function is an endpoint.",
        "The `#[program]` attribute is like `[ApiController]` — marks a module as the entry point.",
        "Anchor is like Entity Framework for blockchain — maps Rust structs to on-chain storage.",
      ],
      none: [
        "A Solana **program** is like a vending machine — rules that run automatically. Send a transaction, and it does what it's programmed to do.",
        "Programs live on the blockchain — no single person controls them. Once deployed, they run 24/7.",
        "Anchor is a helpful toolkit that makes building programs much easier. It handles the complicated parts!",
      ],
    },
    codeExample: `use anchor_lang::prelude::*;

declare_id!("YourProgramId11111111111111111");

#[program]
pub mod my_first_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

#[account]
pub struct Counter {
    pub count: u64,
}`,
  },
];

export default function LearningHub() {
  const { selectedLanguage, languageLabel, setView, completedModules, completeModule, t } = useApp();
  const lang = selectedLanguage || "none";
  const [activeModule, setActiveModule] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedAnalogy, setExpandedAnalogy] = useState(0);

  const mod = modules[activeModule];
  const analogies = mod.analogies[lang];

  const handleModuleChange = (index: number) => {
    setActiveModule(index);
    setShowQuiz(false);
    setExpandedAnalogy(0);
  };

  const handleQuizComplete = () => {
    completeModule(activeModule);
    setShowQuiz(false);
    if (activeModule < modules.length - 1) {
      setTimeout(() => handleModuleChange(activeModule + 1), 800);
    }
  };

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    "neon-green": { bg: "bg-neon-green/10", text: "text-neon-green", border: "border-neon-green/30" },
    "neon-purple": { bg: "bg-neon-purple/10", text: "text-neon-purple", border: "border-neon-purple/30" },
    "neon-yellow": { bg: "bg-neon-yellow/10", text: "text-neon-yellow", border: "border-neon-yellow/30" },
  };

  return (
    <section className="min-h-screen relative">
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-neon-purple/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-green/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setView("onboarding")} className="p-2 rounded-lg bg-card-bg border border-card-border text-muted hover:text-foreground transition-colors">
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold"><span className="gradient-text">{t("hub.title")}</span></h1>
            </div>
            <p className="text-muted text-sm">
              {t("hub.personalizedFor")} <span className="text-neon-green font-semibold">{languageLabel}</span> {t("hub.developers")}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setView("idea-agent")} className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-neon-green to-neon-purple text-background flex items-center gap-2 text-sm shadow-lg shadow-neon-green/10">
            <Rocket size={16} /> {t("hub.colosseumCopilot")}
          </motion.button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 shrink-0">
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <BookOpen size={16} className="text-neon-purple" />
                <span className="text-sm font-semibold">{t("hub.modules")}</span>
              </div>
              <div className="space-y-1">
                {modules.map((m, i) => {
                  const isCompleted = completedModules.includes(i);
                  const isActive = activeModule === i;
                  const colors = colorMap[m.color];
                  return (
                    <button key={i} id={`module-${i}`} onClick={() => handleModuleChange(i)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-all duration-200 ${isActive ? `${colors.bg} ${colors.text} ${colors.border} border` : "text-muted hover:text-foreground hover:bg-surface"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? "bg-neon-green/20 text-neon-green" : isActive ? `${colors.bg} ${colors.text}` : "bg-surface text-muted-dim"}`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{t(`module.${i}.title`)}</p>
                        {isActive && <p className="text-xs opacity-60 truncate">{t(`module.${i}.subtitle`)}</p>}
                      </div>
                      {isActive && <ChevronRight size={14} className="ml-auto shrink-0 opacity-50" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 px-3">
                <div className="flex items-center justify-between text-xs text-muted-dim mb-2">
                  <span>{t("hub.progress")}</span>
                  <span>{completedModules.length}/{modules.length}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-neon-green to-neon-purple rounded-full" initial={{ width: 0 }} animate={{ width: `${(completedModules.length / modules.length) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                </div>
              </div>
              {completedModules.length === modules.length && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20 text-center">
                  <p className="text-sm font-bold text-neon-green">{t("hub.allComplete")}</p>
                  <p className="text-xs text-muted mt-1">{t("hub.readyForProject")}</p>
                  <button onClick={() => setView("idea-agent")} className="mt-2 px-4 py-1.5 rounded-lg bg-neon-green text-background text-xs font-semibold hover:brightness-110 transition-all">{t("hub.getProjectIdea")}</button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="glass-card rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${colorMap[mod.color].bg} ${colorMap[mod.color].text} flex items-center justify-center`}>
                      <mod.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t("hub.module")} {activeModule + 1}: {t(`module.${activeModule}.title`)}</h2>
                      <p className="text-sm text-muted">{t(`module.${activeModule}.subtitle`)}</p>
                    </div>
                  </div>
                  {completedModules.includes(activeModule) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-medium">
                      <CheckCircle2 size={12} /> {t("hub.completed")}
                    </div>
                  )}
                </div>

                {/* AI Teacher Messages */}
                <div className="space-y-4 mb-6">
                  {analogies.map((text, i) => (
                    <motion.div key={`${activeModule}-${i}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                      <div role="button" tabIndex={0} onClick={() => setExpandedAnalogy(expandedAnalogy === i ? -1 : i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedAnalogy(expandedAnalogy === i ? -1 : i); }} className="w-full text-left cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-purple flex items-center justify-center shrink-0 shadow-lg shadow-neon-green/10">
                            <Bot size={20} className="text-background" />
                          </div>
                          <div className={`glass-card rounded-2xl rounded-tl-sm px-5 py-4 flex-1 transition-all duration-200 ${expandedAnalogy === i ? "border border-neon-green/20" : ""}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neon-green">{t("hub.geminiTeacher")}</span>
                                <span className="text-xs text-muted-dim">•</span>
                                <span className="text-xs text-muted-dim">{t("hub.step")} {i + 1}</span>
                              </div>
                              <TTSButton size={14} />
                            </div>
                            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                              {text.split("`").map((part, pi) =>
                                pi % 2 === 1 ? (
                                  <code key={pi} className="text-neon-yellow font-mono bg-neon-yellow/10 px-1.5 py-0.5 rounded text-xs">{part}</code>
                                ) : (
                                  <span key={pi}>{part.split("**").map((boldPart, bi) =>
                                    bi % 2 === 1 ? <strong key={bi} className="text-foreground">{boldPart}</strong> : <span key={bi}>{boldPart}</span>
                                  )}</span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Code Example */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
                  <div className="code-block rounded-2xl p-6 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-xs text-muted-dim font-mono">example.rs</span>
                    </div>
                    <pre className="text-sm leading-relaxed text-foreground/80 whitespace-pre overflow-x-auto"><code>{mod.codeExample}</code></pre>
                  </div>
                </motion.div>

                {/* Quiz Section */}
                {!showQuiz ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex justify-center">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowQuiz(true)} className={`px-6 py-3 rounded-xl font-semibold ${colorMap[mod.color].bg} ${colorMap[mod.color].text} border ${colorMap[mod.color].border} flex items-center gap-2 text-sm hover:brightness-110 transition-all`}>
                      {completedModules.includes(activeModule) ? (<><Lock size={16} /> {t("hub.retakeQuiz")}</>) : (<>{t("hub.takeQuiz")} <ChevronRight size={16} /></>)}
                    </motion.button>
                  </motion.div>
                ) : (
                  <DragDropQuiz moduleIndex={activeModule} onComplete={handleQuizComplete} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
