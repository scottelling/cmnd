import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChevronRight, ChevronDown, Check, Copy, IndentIncrease, IndentDecrease, Plus } from "lucide-react";
import { HUMAN, MONO, FORMATS } from "../design/tokens.js";
import {
  makeNode, findNodeIn, findParentAndIndex, updateNodeInTree, removeNodeFromTree,
  insertSiblingInTree, appendChildInTree, buildPathTo, serializeMd, selectionRoots,
  indentNodePure, outdentNodePure, moveNodePure,
} from "../lib/tree.js";
import { useDragLock } from "../hooks/useDragLock.js";
import { SelectionBar } from "./SelectionBar.jsx";

export function OutlineView({ outline, onUpdate, onAskInChat, onToast, accent, t }) {
  const nodes = outline.nodes; const zoomPath = outline.zoomPath || []; const collapsedIds = outline.collapsedIds || {};
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [viewMode, setViewMode] = useState("outline");
  const [fmtMenu, setFmtMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const commitRename = () => { const v = titleDraft.trim(); if (v) onUpdate({ title: v }); setRenaming(false); };
  const taRefs = useRef(new Map());
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const setNodes = useCallback((u) => { const next = typeof u === "function" ? u(nodesRef.current) : u; nodesRef.current = next; onUpdate({ nodes: next }); }, [onUpdate]);
  const setZoom = (u) => onUpdate({ zoomPath: typeof u === "function" ? u(zoomPath) : u });
  const setCollapsed = (u) => onUpdate({ collapsedIds: typeof u === "function" ? u(collapsedIds) : u });
  const updateNode = (id, up) => setNodes(p => updateNodeInTree(p, id, up));
  const deleteNode = (id) => setNodes(p => removeNodeFromTree(p, id)[0]);

  const visible = useMemo(() => { let cur = nodes; for (const id of zoomPath) { const n = cur.find(x => x.id === id); if (!n) return nodes; cur = n.children || []; } return cur; }, [nodes, zoomPath]);
  const zoomTarget = zoomPath.length ? findNodeIn(nodes, zoomPath[zoomPath.length - 1]) : null;
  const crumbs = useMemo(() => { const c = [{ id: null, text: outline.title }]; let cur = nodes; for (const id of zoomPath) { const n = cur.find(x => x.id === id); if (n) { c.push({ id: n.id, text: n.text || "Untitled" }); cur = n.children || []; } } return c; }, [nodes, zoomPath, outline.title]);

  const pendingFocus = useRef(null); const creating = useRef(false);
  const release = () => setTimeout(() => { creating.current = false; }, 180);
  const focusNode = (id, atEnd = false) => { pendingFocus.current = { id, atEnd }; setActiveNodeId(id); };
  useEffect(() => { if (!pendingFocus.current) return; const { id, atEnd } = pendingFocus.current; pendingFocus.current = null; requestAnimationFrame(() => { const el = taRefs.current.get(id); if (!el) return; el.focus(); const p = atEnd ? el.value.length : 0; el.selectionStart = el.selectionEnd = p; }); });
  const autoSize = (el) => { el.style.height = "0px"; el.style.height = Math.max(el.scrollHeight, 24) + "px"; };
  const setTaRef = (id, el) => { if (!el) return; taRefs.current.set(id, el); autoSize(el); };
  const findPrev = (id) => { const flat = []; const walk = (l) => l.forEach(n => { flat.push(n.id); if (n.children && n.children.length && !collapsedIds[n.id]) walk(n.children); }); walk(visible); const i = flat.indexOf(id); return i > 0 ? flat[i - 1] : null; };

  const handleEnter = (id, el) => {
    const text = el.value, st = el.selectionStart, en = el.selectionEnd; creating.current = true;
    if (st === 0 && en === 0 && text.length > 0) { const nn = makeNode(); setNodes(p => insertSiblingInTree(p, id, "above", nn)); focusNode(nn.id); }
    else if (st >= text.length && en >= text.length) { const nn = makeNode(); setNodes(p => insertSiblingInTree(p, id, "below", nn)); focusNode(nn.id); }
    else { const nn = makeNode({ text: text.slice(en) }); setNodes(p => insertSiblingInTree(updateNodeInTree(p, id, { text: text.slice(0, st) }), id, "below", nn)); focusNode(nn.id); }
    release();
  };
  const indentOne = (id) => { const ctx = findParentAndIndex(nodesRef.current, id); if (!ctx || ctx.index === 0) return; const prev = ctx.siblings[ctx.index - 1]; creating.current = true; setNodes(p => indentNodePure(p, id)); setCollapsed(c => { if (!c[prev.id]) return c; const n = { ...c }; delete n[prev.id]; return n; }); focusNode(id, true); release(); };
  const outdentOne = (id) => { const ctx = findParentAndIndex(nodesRef.current, id); if (!ctx || ctx.parent === null) return; creating.current = true; setNodes(p => outdentNodePure(p, id)); focusNode(id, true); release(); };
  const onKey = (e, node) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnter(node.id, e.target); }
    else if (e.key === "Backspace" && node.text === "") { e.preventDefault(); const p = findPrev(node.id); deleteNode(node.id); if (p) focusNode(p, true); else setActiveNodeId(null); }
    else if (e.key === "Tab") { e.preventDefault(); if (e.shiftKey) outdentOne(node.id); else indentOne(node.id); }
  };
  const onBlur = (id) => { if (creating.current) return; setTimeout(() => { if (creating.current) return; const n = findNodeIn(nodesRef.current, id); if (n && !n.text.trim()) deleteNode(id); setActiveNodeId(p => (p === id ? null : p)); }, 110); };

  /* ── multi-select (long-press a row) ── */
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const rowPress = useRef(null);
  const suppressClick = useRef(false);
  const enterSelect = (id) => { setActiveNodeId(null); setSelectMode(true); setSelected(new Set([id])); if (navigator.vibrate) navigator.vibrate(12); };
  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); if (n.size === 0) setSelectMode(false); return n; });
  useEffect(() => { if (!selectMode) return undefined; const onEsc = (e) => { if (e.key === "Escape") exitSelect(); }; window.addEventListener("keydown", onEsc); return () => window.removeEventListener("keydown", onEsc); }, [selectMode]);
  const onRowDown = (node, e) => {
    if (selectMode) return;
    const x = e.clientX, y = e.clientY;
    const rec = { id: node.id, x, y, fired: false, timer: null };
    rec.timer = setTimeout(() => {
      if (!rowPress.current || rowPress.current.id !== node.id) return;
      rowPress.current.fired = true; suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 500);
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      enterSelect(node.id);
    }, 400);
    rowPress.current = rec;
  };
  const onRowMove = (e) => { const p = rowPress.current; if (!p || p.fired) return; if (Math.abs(e.clientX - p.x) > 9 || Math.abs(e.clientY - p.y) > 9) { clearTimeout(p.timer); rowPress.current = null; } };
  const onRowUp = () => { const p = rowPress.current; if (p && !p.fired) clearTimeout(p.timer); rowPress.current = null; };

  /* ── drag a bullet to nest/reorder ── */
  const [lock, unlock] = useDragLock();
  const [drag, setDrag] = useState(null);
  const [dropT, setDropT] = useState(null);
  const dragRef = useRef(null); const dropRef = useRef(null);
  const bulletPress = useRef(null);
  const rowEls = useRef(new Map());
  const rowRects = useRef(new Map());
  const dwellTimer = useRef(null); const dwellNode = useRef(null);
  useEffect(() => { dragRef.current = drag; }, [drag]);
  useEffect(() => { dropRef.current = dropT; }, [dropT]);

  const onBulletDown = (node, e) => {
    e.stopPropagation();
    if (selectMode) return;
    if (e.currentTarget.setPointerCapture) try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
    const x = e.clientX, y = e.clientY;
    const rec = { id: node.id, x, y, activated: false, timer: null };
    rec.timer = setTimeout(() => {
      if (!bulletPress.current || bulletPress.current.id !== node.id) return;
      bulletPress.current.activated = true;
      if (window.getSelection) { const s = window.getSelection(); if (s) s.removeAllRanges(); }
      rowRects.current.clear(); rowEls.current.forEach((el, id) => { if (el) rowRects.current.set(id, el.getBoundingClientRect()); });
      lock(); setDrag({ nodeId: node.id });
    }, 230);
    bulletPress.current = rec;
  };
  const onBulletMove = (e) => { const p = bulletPress.current; if (!p || p.activated) return; if (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8) { clearTimeout(p.timer); bulletPress.current = null; } };
  const onBulletUp = (e) => {
    e.stopPropagation(); const p = bulletPress.current; bulletPress.current = null; if (!p) return;
    clearTimeout(p.timer);
    if (!p.activated && !selectMode && !suppressClick.current) { const path = buildPathTo(nodesRef.current, p.id); if (path.length) setZoom(path); }
  };
  useEffect(() => {
    if (!drag) return undefined;
    const onMove = (e) => {
      e.preventDefault(); if (window.getSelection) { const s = window.getSelection(); if (s) s.removeAllRanges(); }
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      let closest = null, cd = Infinity;
      rowRects.current.forEach((rect, id) => { if (id === drag.nodeId) return; const d = Math.abs(y - (rect.top + rect.height / 2)); if (d < cd) { cd = d; closest = { id, rect }; } });
      if (closest && cd < 44) {
        const zone = (y - closest.rect.top) / closest.rect.height;
        if (dwellNode.current !== closest.id) { dwellNode.current = closest.id; clearTimeout(dwellTimer.current); dwellTimer.current = setTimeout(() => { if (dwellNode.current === closest.id) setDropT({ nodeId: closest.id, position: "child" }); }, 600); }
        const cur = dropRef.current;
        const isChild = cur && cur.nodeId === closest.id && cur.position === "child" && dwellNode.current === closest.id;
        if (!isChild) setDropT({ nodeId: closest.id, position: zone < 0.35 ? "above" : "below" });
      } else { setDropT(null); dwellNode.current = null; clearTimeout(dwellTimer.current); }
    };
    const onEnd = () => { clearTimeout(dwellTimer.current); dwellNode.current = null; const d = dragRef.current, dp = dropRef.current; if (d && dp) { setNodes(p => moveNodePure(p, d.nodeId, dp.nodeId, dp.position)); } setDrag(null); setDropT(null); unlock(); };
    const opts = { capture: true };
    document.addEventListener("mousemove", onMove, opts); document.addEventListener("mouseup", onEnd, opts);
    document.addEventListener("touchmove", onMove, { passive: false, capture: true }); document.addEventListener("touchend", onEnd, opts);
    return () => { document.removeEventListener("mousemove", onMove, opts); document.removeEventListener("mouseup", onEnd, opts); document.removeEventListener("touchmove", onMove, opts); document.removeEventListener("touchend", onEnd, opts); clearTimeout(dwellTimer.current); };
  }, [drag, setNodes, unlock]);

  const startEdit = (node) => { if (selectMode || suppressClick.current) return; focusNode(node.id, true); };

  /* ── bulk actions ── */
  const selRootIds = () => selectionRoots(nodesRef.current, selected);
  const doIndent = () => { let tr = nodesRef.current; selRootIds().forEach(id => { tr = indentNodePure(tr, id); }); setNodes(tr); };
  const doOutdent = () => { let tr = nodesRef.current; selRootIds().slice().reverse().forEach(id => { tr = outdentNodePure(tr, id); }); setNodes(tr); };
  const doDelete = () => { let tr = nodesRef.current; const c = selected.size; [...selected].forEach(id => { tr = removeNodeFromTree(tr, id)[0]; }); setNodes(tr); if (onToast) onToast(`Deleted ${c} ${c === 1 ? "bullet" : "bullets"}`); exitSelect(); };
  const doCopy = () => { const ids = selRootIds(); const text = ids.map(id => { const n = findNodeIn(nodesRef.current, id); return n ? serializeMd(n) : ""; }).join(""); if (navigator.clipboard) navigator.clipboard.writeText(text); if (onToast) onToast(`Copied ${ids.length} ${ids.length === 1 ? "bullet" : "bullets"}`); };
  const doAsk = () => { const ids = selRootIds(); const ns = ids.map(id => findNodeIn(nodesRef.current, id)).filter(Boolean); if (ns.length && onAskInChat) onAskInChat(ns); exitSelect(); };

  /* ── capture + exports ── */
  const [composer, setComposer] = useState("");
  const capture = () => { const v = composer.trim(); if (!v) return; const nn = makeNode({ text: v }); creating.current = true; if (zoomPath.length === 0) setNodes(p => [...p, nn]); else setNodes(p => appendChildInTree(p, zoomPath[zoomPath.length - 1], nn)); focusNode(nn.id, true); release(); setComposer(""); };
  const renderMD = (list, depth = 0) => { let md = ""; for (const n of list) { md += `${"  ".repeat(depth)}- ${n.text || "(empty)"}\n`; if (n.children && n.children.length && !collapsedIds[n.id]) md += renderMD(n.children, depth + 1); } return md; };
  const renderJSON = (list) => { const clean = (l) => l.map(n => { const o = { text: n.text }; if (n.children && n.children.length) o.children = clean(n.children); return o; }); return JSON.stringify(clean(list), null, 2); };
  const copyVisible = () => { const c = viewMode === "json" ? renderJSON(visible) : `# ${zoomTarget ? zoomTarget.text : outline.title}\n\n${renderMD(visible)}`; if (navigator.clipboard) navigator.clipboard.writeText(c); if (onToast) onToast("Copied outline"); };

  const renderNode = (node, depth = 0) => {
    const has = node.children && node.children.length > 0; const col = collapsedIds[node.id];
    const sel = selected.has(node.id);
    const editing = !selectMode && activeNodeId === node.id;
    const isDragging = drag && drag.nodeId === node.id;
    const dChild = dropT && dropT.nodeId === node.id && dropT.position === "child";
    const dAbove = dropT && dropT.nodeId === node.id && dropT.position === "above";
    const dBelow = dropT && dropT.nodeId === node.id && dropT.position === "below";
    const indentPx = 2 + depth * 18;
    return (
      <div key={node.id}>
        {dAbove && <div style={{ height: 2, background: t.agent, borderRadius: 2, margin: `1px 4px 1px ${12 + depth * 18}px` }} />}
        <div className="cmnd-ol-row" ref={(el) => { if (el) rowEls.current.set(node.id, el); }}
          onPointerDown={(e) => onRowDown(node, e)} onPointerMove={onRowMove} onPointerUp={onRowUp} onPointerCancel={onRowUp}
          onContextMenu={(e) => e.preventDefault()}
          onClick={selectMode ? () => { if (suppressClick.current) return; toggleSelect(node.id); } : undefined}
          style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: `5px 6px 5px ${indentPx}px`, borderRadius: 9, cursor: selectMode ? "pointer" : "default", background: dChild ? `${accent}24` : sel ? `${accent}1c` : "transparent", opacity: isDragging ? 0.32 : 1, transition: "background 160ms, opacity 120ms", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}>
          <button onPointerDown={(e) => onBulletDown(node, e)} onPointerMove={onBulletMove} onPointerUp={onBulletUp} onPointerCancel={onBulletUp}
            title={selectMode ? "Select" : "Tap to zoom · hold to drag"}
            style={{ width: 26, height: 26, marginTop: 0, marginLeft: -6, border: "none", background: "transparent", cursor: selectMode ? "pointer" : "grab", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "none" }}>
            {selectMode
              ? <span style={{ width: 18, height: 18, borderRadius: 999, background: sel ? accent : t.hover, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 140ms" }}>{sel && <Check size={12} strokeWidth={3.5} color="#fff" />}</span>
              : <span style={{ width: has && col ? 13 : 7, height: has && col ? 13 : 7, borderRadius: "50%", background: isDragging ? t.agent : (has ? t.text : t.textMute), boxShadow: has && col ? `0 0 0 4px ${accent}33` : "none", transition: "all 140ms" }} />}
          </button>
          {editing
            ? <textarea ref={(el) => setTaRef(node.id, el)} value={node.text} placeholder="Type here…" rows={1} autoFocus
                onChange={(e) => { updateNode(node.id, { text: e.target.value }); autoSize(e.target); }}
                onFocus={() => setActiveNodeId(node.id)} onKeyDown={(e) => onKey(e, node)} onBlur={() => onBlur(node.id)}
                style={{ flex: 1, border: "none", outline: "none", resize: "none", overflow: "hidden", background: "transparent", color: t.text, fontFamily: HUMAN, fontSize: 16, lineHeight: 1.45, height: 24, minHeight: 24, padding: 0, wordBreak: "break-word", WebkitUserSelect: "text", userSelect: "text" }} />
            : <div onClick={() => startEdit(node)} style={{ flex: 1, minWidth: 0, fontFamily: HUMAN, fontSize: 16, lineHeight: 1.45, minHeight: 24, paddingTop: 1, color: node.text ? t.text : t.textMute, whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: selectMode ? "pointer" : "text" }}>{node.text || "Type here…"}</div>}
          {editing && (
            <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
              <button onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); outdentOne(node.id); }} title="Outdent"
                style={{ width: 28, height: 26, border: "none", background: "transparent", cursor: "pointer", color: t.textMute, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7 }}><IndentDecrease size={16} /></button>
              <button onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); indentOne(node.id); }} title="Indent"
                style={{ width: 28, height: 26, border: "none", background: "transparent", cursor: "pointer", color: t.textMute, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7 }}><IndentIncrease size={16} /></button>
            </div>
          )}
          {has && <button onClick={(e) => { e.stopPropagation(); setCollapsed(p => ({ ...p, [node.id]: !p[node.id] })); }} onPointerDown={(e) => e.stopPropagation()}
            style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", color: t.textMute, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronDown size={15} style={{ transform: col ? "rotate(-90deg)" : "none", transition: "transform .15s" }} /></button>}
        </div>
        {dBelow && <div style={{ height: 2, background: t.agent, borderRadius: 2, margin: `1px 4px 1px ${12 + depth * 18}px` }} />}
        {has && !col && node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, marginBottom: 4, flexShrink: 0 }}>
        <div className="cmnd-noscroll" style={{ flex: 1, display: "flex", alignItems: "center", overflowX: "auto", minWidth: 0 }}>
          {crumbs.map((c, i) => (
            <div key={c.id || "root"} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && <ChevronRight size={13} style={{ color: t.textMute, margin: "0 1px" }} />}
              {i === 0 && renaming
                ? <input autoFocus value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
                    onBlur={commitRename}
                    style={{ width: 160, border: "none", outline: "none", background: t.surface2, borderRadius: 8, padding: "4px 9px", fontFamily: HUMAN, fontSize: 16, color: t.text }} />
                : <button onClick={() => { if (i === 0 && zoomPath.length === 0) { setTitleDraft(outline.title); setRenaming(true); } else setZoom(zoomPath.slice(0, i)); }}
                    title={i === 0 && zoomPath.length === 0 ? "Tap to rename" : undefined}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 7, fontFamily: MONO, fontSize: 12.5, fontWeight: i === crumbs.length - 1 ? 600 : 400, color: i === crumbs.length - 1 ? t.text : t.textDim, whiteSpace: "nowrap", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{c.text}</button>}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setFmtMenu(v => !v)} title="View format" style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", borderRadius: 9, border: "none", background: t.surface2, cursor: "pointer", color: t.textDim }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600 }}>{(FORMATS.find(f => f.id === viewMode) || FORMATS[0]).label}</span>
            <ChevronDown size={13} style={{ transform: fmtMenu ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
          </button>
          {fmtMenu && <>
            <div onClick={() => setFmtMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 170, background: t.surface, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow, zIndex: 6, padding: 4 }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => { setViewMode(f.id); setFmtMenu(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", padding: "9px 11px", border: "none", borderRadius: 9, background: viewMode === f.id ? t.hover : "transparent", cursor: "pointer", textAlign: "left", fontFamily: HUMAN, fontSize: 14, color: t.text }}>
                  {f.label}{viewMode === f.id && <Check size={14} color={accent} />}
                </button>
              ))}
              <button onClick={() => { copyVisible(); setFmtMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", marginTop: 4, padding: "9px 11px", border: "none", borderRadius: 9, background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: HUMAN, fontSize: 14, color: t.text }}>
                <Copy size={14} color={t.textMute} /> Copy outline
              </button>
            </div>
          </>}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {viewMode === "outline" && (visible.length === 0
          ? <div style={{ padding: "36px 12px", textAlign: "center", fontFamily: MONO, fontSize: 13, color: t.textMute }}>{zoomTarget ? "No children yet — capture below." : "Empty outline — capture below."}</div>
          : visible.map(n => renderNode(n)))}
        {viewMode === "md" && <pre style={{ margin: 0, padding: "4px 2px", fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: t.text, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{`# ${zoomTarget ? zoomTarget.text : outline.title}\n\n${renderMD(visible)}`}</pre>}
        {viewMode === "json" && <pre style={{ margin: 0, padding: "4px 2px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, color: accent, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{renderJSON(visible)}</pre>}
      </div>
      {selectMode
        ? <SelectionBar count={selected.size} onOutdent={doOutdent} onIndent={doIndent} onAsk={doAsk} onCopy={doCopy} onDelete={doDelete} onDone={exitSelect} accent={accent} t={t} />
        : (
          <div style={{ flexShrink: 0, paddingTop: 8, display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1, display: "flex", background: t.surface2, borderRadius: 14, padding: "9px 13px" }}>
              <input value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); capture(); } }}
                placeholder={zoomTarget ? "Capture under this node…" : "Capture a thought…"} style={{ flex: 1, border: "none", background: "transparent", color: t.text, fontFamily: HUMAN, fontSize: 16, outline: "none" }} />
            </div>
            <button onClick={capture} disabled={!composer.trim()} style={{ width: 38, height: 38, borderRadius: 999, border: "none", flexShrink: 0, cursor: composer.trim() ? "pointer" : "default", background: composer.trim() ? accent : t.surface2, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 160ms" }}>
              <Plus size={19} strokeWidth={2.6} color={composer.trim() ? "#fff" : t.textMute} />
            </button>
          </div>
        )}
    </div>
  );
}

export default OutlineView;
