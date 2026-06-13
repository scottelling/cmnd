import { Square, CheckSquare } from "lucide-react";
import { HUMAN, MONO } from "../../design/tokens.js";

export function TaskBody({ block, onToggle, t }) {
  const groups = block.groups || [];
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const done = groups.reduce((s, g) => s + g.items.filter(i => i.done).length, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", color: t.textMute }}>
        <span>PROGRESS</span><span>{done} / {total}</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: t.hover, marginBottom: 4 }}><div style={{ height: 4, borderRadius: 999, width: total ? `${(done / total) * 100}%` : "0%", background: t.agent, transition: "width .3s" }} /></div>
      {groups.map((g, gi) => (
        <div key={gi}>
          <div style={{ padding: "12px 2px 4px", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMute }}>{g.label}</div>
          {g.items.map((it, ii) => (
            <button key={it.id || ii} onClick={() => onToggle(gi, ii)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 8px", borderRadius: 9, background: "transparent", border: "none", cursor: "pointer", transition: "background 140ms" }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {it.done ? <CheckSquare size={18} color={t.agent} style={{ flexShrink: 0, marginTop: 1 }} /> : <Square size={18} color={t.textMute} style={{ flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontFamily: HUMAN, fontSize: 14, color: it.done ? t.textMute : t.text, textDecoration: it.done ? "line-through" : "none", lineHeight: 1.45 }}>{it.text}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TaskBody;
