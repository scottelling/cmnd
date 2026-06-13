import { ListChecks, Plus } from "lucide-react";
import { SANS, HUMAN, MONO, EASE } from "../design/tokens.js";

// Bottom sheet for "Save to Second Brain": pick an existing outline or make a new one.
export function SaveSheet({ outlines, label, onPick, onNew, onClose, t, accent }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: t.overlay, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", width: "min(460px,96vw)", maxHeight: "64vh", background: t.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: "hidden", boxShadow: t.shadow, display: "flex", flexDirection: "column", animation: `cmnd-sheet 240ms ${EASE}` }}>
        <div style={{ padding: "18px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><ListChecks size={16} color={accent} /><span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: t.text }}>Save to Second Brain</span></div>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: t.textMute, marginTop: 6 }}>Drops this {label} into an outline as nodes.</div>
        </div>
        <div style={{ overflow: "auto", padding: "0 8px 8px" }}>
          {outlines.map(o => (
            <button key={o.id} onClick={() => onPick(o.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <ListChecks size={14} color={accent} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: HUMAN, fontSize: 14.5, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.title}</span>
            </button>
          ))}
        </div>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "16px 20px", border: "none", background: t.surface2, cursor: "pointer", color: accent, fontFamily: SANS, fontSize: 14.5, fontWeight: 600, textAlign: "left" }}>
          <Plus size={16} /> New outline
        </button>
      </div>
    </div>
  );
}

export default SaveSheet;
