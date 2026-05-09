import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 300;
const NODE_HEIGHT = 180;

/**
 * Apply a dagre-based top-to-bottom auto-layout to React Flow nodes.
 * Returns a new array of nodes with updated positions.
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options?: { ranksep?: number; nodesep?: number }
): Node[] {
  if (nodes.length === 0) return nodes;

  const { ranksep = 100, nodesep = 60 } = options || {};

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB", // Top-to-Bottom
    ranksep,
    nodesep,
    marginx: 40,
    marginy: 40,
  });

  // Estimate node dimensions based on type
  for (const node of nodes) {
    const w = NODE_WIDTH;
    let h = NODE_HEIGHT;
    // Template nodes are shorter
    if (node.type === "templateNode") h = 150;
    // Function nodes with body might be taller
    if (node.type === "functionNode") h = 200;
    // PDA nodes have seeds list + bump toggle
    if (node.type === "pdaNode") h = 220;
    // CPI nodes have accounts + program/instruction fields
    if (node.type === "cpiNode") h = 240;
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;

    return {
      ...node,
      position: {
        x: dagreNode.x - (dagreNode.width ?? NODE_WIDTH) / 2,
        y: dagreNode.y - (dagreNode.height ?? NODE_HEIGHT) / 2,
      },
    };
  });
}
