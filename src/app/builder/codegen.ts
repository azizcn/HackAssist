import type { Node, Edge } from "@xyflow/react";

export interface StructField {
  name: string;
  type: string;
}

export interface StructNodeData {
  label: string;
  structName: string;
  fields: StructField[];
  nodeCategory: "state" | "context";
  [key: string]: unknown;
}

export interface FunctionNodeData {
  label: string;
  functionName: string;
  body: string;
  connectedContext: string;
  [key: string]: unknown;
}

export interface ActionNodeData {
  label: string;
  actionType: "transfer" | "mint";
  params: StructField[];
  [key: string]: unknown;
}

export interface TemplateNodeData {
  label: string;
  templateType: "basic_coin" | "basic_nft";
  [key: string]: unknown;
}

export interface PDANodeData {
  label: string;
  pdaName: string;
  seeds: string[];
  bump: boolean;
  [key: string]: unknown;
}

export interface CPINodeData {
  label: string;
  targetProgram: string;
  instruction: string;
  accounts: StructField[];
  [key: string]: unknown;
}

export type BuilderNodeData =
  | StructNodeData
  | FunctionNodeData
  | ActionNodeData
  | TemplateNodeData
  | PDANodeData
  | CPINodeData;

// ---------------------------------------------------------------------------
// Helper: indent a block of text
// ---------------------------------------------------------------------------
function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

// ---------------------------------------------------------------------------
// Generate Anchor Rust code from the canvas state
// ---------------------------------------------------------------------------
export function generateAnchorCode(nodes: Node[], edges: Edge[]): string {
  const lines: string[] = [];

  lines.push("use anchor_lang::prelude::*;");
  lines.push("");
  lines.push('declare_id!("YOUR_PROGRAM_ID_HERE");');
  lines.push("");

  // ── Collect nodes by type ───────────────────────────────────────────
  const stateStructs = nodes.filter(
    (n) => n.type === "structNode" && (n.data as StructNodeData).nodeCategory === "state"
  );
  const contextStructs = nodes.filter(
    (n) => n.type === "structNode" && (n.data as StructNodeData).nodeCategory === "context"
  );
  const functionNodes = nodes.filter((n) => n.type === "functionNode");
  const actionNodes = nodes.filter((n) => n.type === "actionNode");
  const pdaNodes = nodes.filter((n) => n.type === "pdaNode");

  // ── PDA seed constants ──────────────────────────────────────────────
  for (const node of pdaNodes) {
    const d = node.data as PDANodeData;
    const name = d.pdaName || "my_pda";
    lines.push(`// ── PDA: ${name} ──`);
    lines.push(`// Seeds: [${d.seeds.map((s) => `b"${s}"`).join(", ")}]`);
    if (d.seeds.length > 0) {
      lines.push(`pub const ${name.toUpperCase()}_SEED: &[u8] = b"${d.seeds[0]}";`);
    }
    lines.push("");
  }

  // ── State structs (Accounts) ────────────────────────────────────────
  for (const node of stateStructs) {
    const d = node.data as StructNodeData;
    const name = d.structName || "MyState";
    lines.push("#[account]");
    lines.push(`pub struct ${name} {`);
    for (const f of d.fields) {
      if (f.name && f.type) {
        lines.push(`    pub ${f.name}: ${f.type},`);
      }
    }
    lines.push("}");
    lines.push("");
  }

  // ── Context structs (#[derive(Accounts)]) ───────────────────────────
  for (const node of contextStructs) {
    const d = node.data as StructNodeData;
    const name = d.structName || "MyContext";

    // Check if any PDA node is connected to this context
    const connectedPdas = pdaNodes.filter((pda) =>
      edges.some(
        (e) =>
          (e.source === pda.id && e.target === node.id) ||
          (e.target === pda.id && e.source === node.id)
      )
    );

    lines.push("#[derive(Accounts)]");
    lines.push(`pub struct ${name}<'info> {`);

    // Add PDA account constraints if connected
    for (const pda of connectedPdas) {
      const pd = pda.data as PDANodeData;
      const seedsStr = pd.seeds.map((s) => `b"${s}"`).join(", ");
      if (pd.bump) {
        lines.push(`    #[account(seeds = [${seedsStr}], bump)]`);
      } else {
        lines.push(`    #[account(seeds = [${seedsStr}])]`);
      }
      lines.push(`    pub ${pd.pdaName || "pda_account"}: AccountInfo<'info>,`);
    }

    for (const f of d.fields) {
      if (f.name && f.type) {
        lines.push(`    pub ${f.name}: ${f.type},`);
      }
    }
    lines.push("}");
    lines.push("");
  }

  // ── Build a map: function node id → connected context struct name ───
  const fnToCtx: Record<string, string> = {};
  for (const edge of edges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (
      sourceNode?.type === "structNode" &&
      (sourceNode.data as StructNodeData).nodeCategory === "context" &&
      targetNode?.type === "functionNode"
    ) {
      fnToCtx[targetNode.id] = (sourceNode.data as StructNodeData).structName || "MyContext";
    }
    if (
      targetNode?.type === "structNode" &&
      (targetNode.data as StructNodeData).nodeCategory === "context" &&
      sourceNode?.type === "functionNode"
    ) {
      fnToCtx[sourceNode.id] = (targetNode.data as StructNodeData).structName || "MyContext";
    }
  }

  // ── Collect CPI code blocks for functions ───────────────────────────
  const fnToCpi: Record<string, CPINodeData[]> = {};
  for (const edge of edges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (sourceNode?.type === "cpiNode" && targetNode?.type === "functionNode") {
      if (!fnToCpi[targetNode.id]) fnToCpi[targetNode.id] = [];
      fnToCpi[targetNode.id].push(sourceNode.data as CPINodeData);
    }
    if (targetNode?.type === "cpiNode" && sourceNode?.type === "functionNode") {
      if (!fnToCpi[sourceNode.id]) fnToCpi[sourceNode.id] = [];
      fnToCpi[sourceNode.id].push(targetNode.data as CPINodeData);
    }
  }

  // ── Program module ──────────────────────────────────────────────────
  if (functionNodes.length > 0 || actionNodes.length > 0) {
    lines.push("#[program]");
    lines.push("pub mod my_program {");
    lines.push("    use super::*;");
    lines.push("");

    for (const node of functionNodes) {
      const d = node.data as FunctionNodeData;
      const fname = d.functionName || "my_function";
      const ctxName = fnToCtx[node.id] || d.connectedContext || "MyContext";
      const body = d.body?.trim() || "Ok(())";
      lines.push(`    pub fn ${fname}(ctx: Context<${ctxName}>) -> Result<()> {`);

      // Insert CPI invocations if connected
      const cpis = fnToCpi[node.id];
      if (cpis && cpis.length > 0) {
        for (const cpi of cpis) {
          lines.push(`        // CPI: invoke ${cpi.instruction} on ${cpi.targetProgram}`);
          lines.push(`        let cpi_program = ctx.accounts.${cpi.targetProgram.toLowerCase().replace(/\s+/g, "_")}.to_account_info();`);
          lines.push(`        let cpi_accounts = ${cpi.instruction}CpiAccounts {`);
          for (const acc of cpi.accounts) {
            lines.push(`            ${acc.name}: ctx.accounts.${acc.name}.to_account_info(),`);
          }
          lines.push("        };");
          lines.push(`        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);`);
          lines.push(`        ${cpi.targetProgram.toLowerCase().replace(/\s+/g, "_")}::${cpi.instruction}(cpi_ctx)?;`);
          lines.push("");
        }
      }

      lines.push(indent(body, 8));
      lines.push("    }");
      lines.push("");
    }

    for (const node of actionNodes) {
      const d = node.data as ActionNodeData;
      if (d.actionType === "transfer") {
        lines.push("    pub fn transfer_sol(ctx: Context<TransferCtx>, amount: u64) -> Result<()> {");
        lines.push("        let ix = anchor_lang::solana_program::system_instruction::transfer(");
        lines.push("            &ctx.accounts.from.key(),");
        lines.push("            &ctx.accounts.to.key(),");
        lines.push("            amount,");
        lines.push("        );");
        lines.push("        anchor_lang::solana_program::program::invoke(");
        lines.push("            &ix,");
        lines.push("            &[");
        lines.push("                ctx.accounts.from.to_account_info(),");
        lines.push("                ctx.accounts.to.to_account_info(),");
        lines.push("            ],");
        lines.push("        )?;");
        lines.push("        Ok(())");
        lines.push("    }");
        lines.push("");
      } else if (d.actionType === "mint") {
        lines.push("    pub fn mint_token(ctx: Context<MintCtx>, amount: u64) -> Result<()> {");
        lines.push("        // Mint tokens using the SPL Token Program");
        lines.push("        token::mint_to(");
        lines.push("            CpiContext::new(");
        lines.push("                ctx.accounts.token_program.to_account_info(),");
        lines.push("                token::MintTo {");
        lines.push("                    mint: ctx.accounts.mint.to_account_info(),");
        lines.push("                    to: ctx.accounts.token_account.to_account_info(),");
        lines.push("                    authority: ctx.accounts.authority.to_account_info(),");
        lines.push("                },");
        lines.push("            ),");
        lines.push("            amount,");
        lines.push("        )?;");
        lines.push("        Ok(())");
        lines.push("    }");
        lines.push("");
      }
    }

    lines.push("}");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Parse raw Rust/Anchor code into nodes + edges (mock AI parser)
// ---------------------------------------------------------------------------
export function parseRustToNodes(code: string): { nodes: Node[]; edges: Edge[] } {
  const parsedNodes: Node[] = [];
  const parsedEdges: Edge[] = [];
  let nodeIndex = 0;
  const col = 0;

  // ── Parse #[account] structs ──────────────────────────────────────────
  const accountStructRegex = /#\[account\]\s*pub\s+struct\s+(\w+)\s*\{([^}]*)\}/g;
  let match;
  while ((match = accountStructRegex.exec(code)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseFields(body);
    parsedNodes.push({
      id: `parsed-state-${nodeIndex}`,
      type: "structNode",
      position: { x: col, y: nodeIndex * 280 },
      data: {
        label: `State: ${name}`,
        structName: name,
        fields,
        nodeCategory: "state",
      },
    });
    nodeIndex++;
  }

  // ── Parse #[derive(Accounts)] structs ─────────────────────────────────
  const ctxStructRegex = /#\[derive\(Accounts\)\]\s*pub\s+struct\s+(\w+)(?:<[^>]*>)?\s*\{([^}]*)\}/g;
  while ((match = ctxStructRegex.exec(code)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseFields(body);
    const nodeId = `parsed-ctx-${nodeIndex}`;
    parsedNodes.push({
      id: nodeId,
      type: "structNode",
      position: { x: col + 420, y: (nodeIndex - 1) * 280 },
      data: {
        label: `Context: ${name}`,
        structName: name,
        fields,
        nodeCategory: "context",
      },
    });
    nodeIndex++;
  }

  // ── Parse pub fn inside #[program] ────────────────────────────────────
  const fnRegex = /pub\s+fn\s+(\w+)\s*\(\s*ctx\s*:\s*Context<(\w+)>/g;
  while ((match = fnRegex.exec(code)) !== null) {
    const fname = match[1];
    const ctxName = match[2];
    const fnNodeId = `parsed-fn-${nodeIndex}`;
    parsedNodes.push({
      id: fnNodeId,
      type: "functionNode",
      position: { x: col + 840, y: (nodeIndex - 2) * 280 },
      data: {
        label: `fn ${fname}`,
        functionName: fname,
        body: "Ok(())",
        connectedContext: ctxName,
      },
    });

    // find matching context node and connect
    const ctxNode = parsedNodes.find(
      (n) => n.type === "structNode" && (n.data as StructNodeData).structName === ctxName
    );
    if (ctxNode) {
      parsedEdges.push({
        id: `edge-${ctxNode.id}-${fnNodeId}`,
        source: ctxNode.id,
        target: fnNodeId,
        animated: true,
        style: { stroke: "#14f195", strokeWidth: 2 },
      });
    }

    nodeIndex++;
  }

  return { nodes: parsedNodes, edges: parsedEdges };
}

// Utility: extract fields from a struct body
function parseFields(body: string): StructField[] {
  const fields: StructField[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/#\[.*?\]/g, "").trim();
    const fieldMatch = trimmed.match(/^pub\s+(\w+)\s*:\s*(.+?),?\s*$/);
    if (fieldMatch) {
      fields.push({ name: fieldMatch[1], type: fieldMatch[2].replace(/,\s*$/, "") });
    }
  }
  return fields;
}
