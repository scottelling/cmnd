import { useState } from "react";
import { Check } from "lucide-react";
import { HUMAN, MONO } from "../../design/tokens.js";

export function DecisionBody({ block, t }) {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(block.options || []).map((o) => { const on = sel === o.key; return (
        <button key={o.key} onClick={() => setSel(o.key)} style={{ textAlign: "left", padding: "12px 13px", cursor: "pointer", background: on ? t.surface : t.hover, borderRadius: 12, border: "none", transition: "background 140ms" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
            <span style={{ fontFamily: HUMAN, fontSize: 14.5, fontWeight: 600, color: t.text }}>{o.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: t.textMute }}>{o.meta}</span>
            {on && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 11, textTransform: "uppercase", color: t.warn }}><Check size={13} />Picked</span>}
          </div>
          {o.order && <div style={{ fontFamily: MONO, fontSize: 12.5, color: t.textDim, marginBottom: 7 }}>{o.order}</div>}
          {(o.upside || o.downside) && <div style={{ display: "flex", gap: 16, fontFamily: HUMAN, fontSize: 13 }}>
            {o.upside && <span style={{ color: t.textDim }}><span style={{ color: t.agent, marginRight: 5 }}>+</span>{o.upside}</span>}
            {o.downside && <span style={{ color: t.textDim }}><span style={{ color: t.warn, marginRight: 5 }}>−</span>{o.downside}</span>}
          </div>}
        </button>
      ); })}
    </div>
  );
}

export default DecisionBody;
