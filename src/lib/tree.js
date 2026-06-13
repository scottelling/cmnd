// Outliner tree model — pure functions over arrays of { id, text, children:[] }.
// These encode the Second Brain's structural operations (insert/remove/move/
// indent/outdent) and are the load-bearing logic behind every gesture.

let _seq = 0;
export const newNodeId = () => `n_${Date.now()}_${_seq++}`;
export const makeNode = (over = {}) => ({ id: newNodeId(), text: "", children: [], ...over });

export const findNodeIn = (nodes, id) => { for (const n of nodes) { if (n.id === id) return n; if (n.children && n.children.length) { const f = findNodeIn(n.children, id); if (f) return f; } } return null; };

export const findParentAndIndex = (nodes, id, parent = null) => {
  for (let i = 0; i < nodes.length; i++) { const n = nodes[i];
    if (n.id === id) return { parent, index: i, siblings: nodes };
    if (n.children && n.children.length) { const r = findParentAndIndex(n.children, id, n); if (r) return r; } }
  return null;
};

export const isDescendant = (node, id) => { if (!node.children) return false; for (const c of node.children) { if (c.id === id || isDescendant(c, id)) return true; } return false; };

export const updateNodeInTree = (nodes, id, u) => nodes.map(n => n.id === id ? { ...n, ...u } : (n.children && n.children.length ? { ...n, children: updateNodeInTree(n.children, id, u) } : n));

export const removeNodeFromTree = (nodes, id) => {
  let removed = null;
  const prune = (list) => { const out = []; for (const n of list) { if (n.id === id) { removed = n; continue; } out.push(n.children && n.children.length ? { ...n, children: prune(n.children) } : n); } return out; };
  return [prune(nodes), removed];
};

export const insertSiblingInTree = (nodes, refId, pos, nn) => {
  const walk = (list) => { const out = []; for (const n of list) { if (n.id === refId && pos === "above") out.push(nn); out.push(n.children && n.children.length ? { ...n, children: walk(n.children) } : n); if (n.id === refId && pos === "below") out.push(nn); } return out; };
  return walk(nodes);
};

export const appendChildInTree = (nodes, pid, child) => nodes.map(n => n.id === pid ? { ...n, children: [...(n.children || []), child] } : (n.children && n.children.length ? { ...n, children: appendChildInTree(n.children, pid, child) } : n));

export const buildPathTo = (nodes, target) => {
  const walk = (list, path) => { for (const n of list) { if (n.id === target) return [...path, n.id]; if (n.children && n.children.length) { const f = walk(n.children, [...path, n.id]); if (f) return f; } } return null; };
  return walk(nodes, []) || [];
};

export const materialize = (list) => list.map(n => makeNode({ text: n.text, children: materialize(n.children || []) }));

export const selectionRoots = (nodes, sel) => { const out = []; const walk = (list, anc) => { for (const n of list) { const s = sel.has(n.id); if (s && !anc) out.push(n.id); if (n.children && n.children.length) walk(n.children, anc || s); } }; walk(nodes, false); return out; };

export const indentNodePure = (tree, id) => { const ctx = findParentAndIndex(tree, id); if (!ctx || ctx.index === 0) return tree; const prev = ctx.siblings[ctx.index - 1]; const [tr, rm] = removeNodeFromTree(tree, id); return rm ? appendChildInTree(tr, prev.id, rm) : tree; };

export const outdentNodePure = (tree, id) => { const ctx = findParentAndIndex(tree, id); if (!ctx || ctx.parent === null) return tree; const pid = ctx.parent.id; const [tr, rm] = removeNodeFromTree(tree, id); return rm ? insertSiblingInTree(tr, pid, "below", rm) : tree; };

export const moveNodePure = (tree, nodeId, targetId, position) => { if (nodeId === targetId) return tree; const node = findNodeIn(tree, nodeId); if (node && (targetId === nodeId || isDescendant(node, targetId))) return tree; const [t1, rm] = removeNodeFromTree(tree, nodeId); if (!rm) return tree; return position === "child" ? appendChildInTree(t1, targetId, rm) : insertSiblingInTree(t1, targetId, position, rm); };

export const serializeMd = (node, depth = 0) => { let str = `${"  ".repeat(depth)}- ${node.text || ""}\n`; (node.children || []).forEach(c => { str += serializeMd(c, depth + 1); }); return str; };
