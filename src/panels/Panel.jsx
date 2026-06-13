import { useState, useEffect } from "react";
import { Minimize2, Maximize2, X } from "lucide-react";
import { SANS } from "../design/tokens.js";
import { ROLES } from "../design/tokens.js";
import { IconBtn } from "../ui/IconBtn.jsx";

// Panel shell: header (drag-reorder handle, min/full/remove), body, and the
// desktop resize handle. Fullscreen renders a fixed-position takeover.
export function Panel({ role, width, onResize, onMinimize, onRemove, onDragStart, isDragging, fullscreen, onToggleFull, leading, resizable = true, t, accent, children }) {
  const meta = ROLES[role];
  const [resizing, setResizing] = useState(null);
  useEffect(() => { if (!resizing) return undefined; const onMove = (e) => onResize(Math.max(meta.min, Math.min(820, resizing.w + (e.clientX - resizing.x)))); const onUp = () => setResizing(null); document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp); return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }; }, [resizing, onResize, meta.min]);

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px 9px 10px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        {leading}
        <div onPointerDown={fullscreen ? undefined : onDragStart} title={fullscreen ? undefined : "Drag to reorder"} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, cursor: fullscreen ? "default" : "grab", touchAction: "none" }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${accent}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accent }}><meta.Icon size={15} /></span>
          <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.label}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        {!fullscreen && <IconBtn t={t} onClick={onMinimize} title="Minimize"><Minimize2 size={16} /></IconBtn>}
        <IconBtn t={t} onClick={onToggleFull} title={fullscreen ? "Restore" : "Full screen"} active={fullscreen}>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</IconBtn>
        {!fullscreen && <IconBtn t={t} onClick={onRemove} title="Remove (data is kept)" danger><X size={17} /></IconBtn>}
      </div>
    </div>
  );

  if (fullscreen) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: t.bg, display: "flex", flexDirection: "column" }}>
      {header}
      <div style={{ flex: 1, minHeight: 0, padding: "8px 16px 16px", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ width, minWidth: width, height: "100%", background: t.surface, borderRadius: 16, display: "flex", overflow: "hidden", boxShadow: isDragging ? `${t.shadow}, 0 0 0 2px ${accent}` : t.shadow, opacity: isDragging ? 0.6 : 1, transform: isDragging ? "scale(0.99)" : "none", transition: "opacity .15s, transform .15s" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {header}
        <div style={{ flex: 1, minHeight: 0, padding: "4px 12px 12px", display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
      {resizable && <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setResizing({ x: e.clientX, w: width }); }} style={{ width: 7, flexShrink: 0, cursor: "col-resize", touchAction: "none" }} />}
    </div>
  );
}

export default Panel;
