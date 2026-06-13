import { IndentDecrease, IndentIncrease, MessageSquare, Copy, Trash2, X } from "lucide-react";
import { MONO } from "../design/tokens.js";

// Floating toolbar shown while multi-selecting outline rows (long-press to enter).
export function SelectionBar({ count, onOutdent, onIndent, onAsk, onCopy, onDelete, onDone, accent, t }) {
  const Btn = ({ icon: Icon, label, onClick, danger }) => (
    <button onClick={onClick} title={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", padding: "5px 9px", borderRadius: 10, color: danger ? t.danger : t.text, transition: "background 140ms" }}
      onMouseEnter={(e) => e.currentTarget.style.background = t.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
      <Icon size={18} strokeWidth={2} />
      <span className="cmnd-hide-sm" style={{ fontFamily: MONO, fontSize: 10 }}>{label}</span>
    </button>
  );
  return (
    <div style={{ flexShrink: 0, paddingTop: 8 }}>
      <div style={{ background: t.surface2, borderRadius: 18, padding: 8, display: "flex", alignItems: "center", gap: 2, boxShadow: t.shadowSm }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 8px", flexShrink: 0 }}>
          <span style={{ minWidth: 22, height: 22, padding: "0 7px", borderRadius: 999, background: accent, color: "#fff", fontFamily: MONO, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
          <span className="cmnd-hide-sm" style={{ fontFamily: MONO, fontSize: 12, color: t.textDim }}>selected</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-around", gap: 2 }}>
          <Btn icon={IndentDecrease} label="Outdent" onClick={onOutdent} />
          <Btn icon={IndentIncrease} label="Indent" onClick={onIndent} />
          <Btn icon={MessageSquare} label="Ask" onClick={onAsk} />
          <Btn icon={Copy} label="Copy" onClick={onCopy} />
          <Btn icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
        <button onClick={onDone} title="Done" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, border: "none", background: t.hover, cursor: "pointer", color: t.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export default SelectionBar;
