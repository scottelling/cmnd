import { ListChecks, Play } from "lucide-react";
import { MONO } from "../../design/tokens.js";
import { IconBtn } from "../../ui/IconBtn.jsx";
import { TableBody } from "./TableBody.jsx";
import { CodeBody } from "./CodeBody.jsx";
import { DecisionBody } from "./DecisionBody.jsx";
import { TaskBody } from "./TaskBody.jsx";

export function ArtifactCard({ block, onSave, onToggleTask, onRun, t }) {
  return (
    <div style={{ borderRadius: 16, background: t.surface2, overflow: "hidden", boxShadow: t.shadowSm }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: t.artifact }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMute }}>{block.artifact}</span>
        <span style={{ color: t.textFaint }}>·</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: t.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.title}</span>
        {block.artifact === "code" && onRun && <IconBtn t={t} onClick={() => onRun(block)} title="Run in sandbox"><Play size={15} /></IconBtn>}
        <IconBtn t={t} onClick={onSave} title="Save to Second Brain" active><ListChecks size={16} /></IconBtn>
      </div>
      <div style={{ padding: block.artifact === "code" ? 0 : "0 12px 12px" }}>
        {block.artifact === "table" && <TableBody block={block} t={t} />}
        {block.artifact === "code" && <CodeBody block={block} t={t} />}
        {block.artifact === "decision" && <DecisionBody block={block} t={t} />}
        {block.artifact === "tasklist" && <TaskBody block={block} onToggle={onToggleTask} t={t} />}
      </div>
    </div>
  );
}

export default ArtifactCard;
