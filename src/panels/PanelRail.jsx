import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { HUMAN, MONO, EASE } from "../design/tokens.js";
import { IconBtn } from "../ui/IconBtn.jsx";

// In-panel list↔detail rail: a collapsible sidebar of items (outlines/threads)
// with drag-reorder and long-press rename/delete, opened from the panel header.
export function PanelRail({ items, activeId, onSelect, onNew, onReorder, onRename, onDelete, newLabel, accent, t, open, children }) {
  const [width, setWidth] = useState(168);
  const [resizing, setResizing] = useState(null);
  const [itemMenu, setItemMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [draft, setDraft] = useState("");
  useEffect(() => { if (!resizing) return undefined; const onMove = (e) => setWidth(Math.max(140, Math.min(280, resizing.w + (e.clientX - resizing.x)))); const onUp = () => setResizing(null); document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp); return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }; }, [resizing]);

  /* list drag-reorder */
  const press = useRef(null);
  const [dnd, setDnd] = useState(null);
  const itemEls = useRef(new Map());
  const itemRects = useRef([]);
  const onItemDown = (idx, id, e) => { if (e.currentTarget.setPointerCapture) try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* noop */ } const rec = { idx, id, x: e.clientX, y: e.clientY, dragging: false, lp: false, timer: null }; rec.timer = setTimeout(() => { const p = press.current; if (!p || p.id !== id || p.dragging) return; p.lp = true; if (navigator.vibrate) navigator.vibrate(12); setItemMenu(id); }, 450); press.current = rec; };
  const onItemMove = (e) => {
    const p = press.current; if (!p || p.lp) return;
    if (!p.dragging) { if (Math.abs(e.clientY - p.y) > 6 || Math.abs(e.clientX - p.x) > 6) { clearTimeout(p.timer); p.dragging = true; itemRects.current = items.map(it => { const el = itemEls.current.get(it.id); return el ? el.getBoundingClientRect() : null; }); setDnd({ from: p.idx, over: p.idx }); } else return; }
    const y = e.clientY; let over = p.idx, md = Infinity;
    itemRects.current.forEach((r, i) => { if (!r) return; const c = r.top + r.height / 2; const d = Math.abs(y - c); if (d < md) { md = d; over = i; } });
    setDnd(d => d ? { ...d, over } : null);
  };
  const onItemUp = () => { const p = press.current; press.current = null; if (!p) return; clearTimeout(p.timer); if (p.lp) return; if (p.dragging) { const over = dnd ? dnd.over : p.idx; setDnd(null); if (p.idx !== over && onReorder) onReorder(p.idx, over); } else { setItemMenu(null); onSelect(p.id); } };
  const startRename = (it) => { setItemMenu(null); setDraft(it.title || ""); setRenamingId(it.id); };
  const commitRename = () => { const v = draft.trim(); if (v && renamingId && onRename) onRename(renamingId, v); setRenamingId(null); };

  const w = open ? width : 0;
  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, minWidth: 0, position: "relative" }}>
      <div style={{ width: w, flexShrink: 0, overflow: "hidden", transition: resizing ? "none" : `width 300ms ${EASE}` }}>
        <div style={{ width, height: "100%", display: "flex", flexDirection: "column", paddingRight: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, marginBottom: 4, flexShrink: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textFaint }}>{newLabel}s</span>
            <IconBtn t={t} onClick={onNew} title={`New ${newLabel.toLowerCase()}`}><Plus size={16} /></IconBtn>
          </div>
          <div style={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((it, idx) => { const on = it.id === activeId; const isOver = dnd && dnd.over === idx && dnd.from !== idx; const isDragging = dnd && dnd.from === idx; return (
              <div key={it.id} ref={(el) => { if (el) itemEls.current.set(it.id, el); }}>
                {isOver && dnd.from > idx && <div style={{ height: 2, background: accent, borderRadius: 2, margin: "1px 4px" }} />}
                {renamingId === it.id
                  ? <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} onBlur={commitRename}
                      style={{ width: "100%", border: "none", outline: "none", background: t.surface2, borderRadius: 10, padding: "8px 11px", fontFamily: HUMAN, fontSize: 16, color: t.text, boxSizing: "border-box" }} />
                  : <button onPointerDown={(e) => onItemDown(idx, it.id, e)} onPointerMove={onItemMove} onPointerUp={onItemUp} onPointerCancel={onItemUp}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ display: "block", width: "100%", padding: "8px 11px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", background: on ? `${accent}1f` : "transparent", opacity: isDragging ? 0.4 : 1, transition: "background 150ms, opacity 120ms", touchAction: "none", WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
                      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = t.hover; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                      <span style={{ display: "block", fontFamily: HUMAN, fontSize: 14, fontWeight: on ? 600 : 500, color: on ? t.text : t.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title || "Untitled"}</span>
                    </button>}
                {itemMenu === it.id && <>
                  <div onClick={() => setItemMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
                  <div style={{ position: "relative", zIndex: 6, display: "flex", gap: 6, padding: "5px 6px 7px" }}>
                    <button onClick={() => startRename(it)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: t.surface2, color: t.text, fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: "pointer", boxShadow: t.shadowSm }}>Rename</button>
                    <button onClick={() => { setItemMenu(null); if (onDelete) onDelete(it.id); }} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: `${t.danger}1f`, color: t.danger, fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                  </div>
                </>}
                {isOver && dnd.from < idx && <div style={{ height: 2, background: accent, borderRadius: 2, margin: "1px 4px" }} />}
              </div>
            ); })}
          </div>
        </div>
      </div>
      {open && <div onMouseDown={(e) => { e.preventDefault(); setResizing({ x: e.clientX, w: width }); }} style={{ width: 6, flexShrink: 0, cursor: "col-resize", touchAction: "none" }} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", paddingLeft: open ? 4 : 0 }}>{children}</div>
    </div>
  );
}

export default PanelRail;
