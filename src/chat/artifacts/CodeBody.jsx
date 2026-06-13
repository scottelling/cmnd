import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { MONO } from "../../design/tokens.js";

const CODE_KW = /\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|async|await|try|catch|finally|throw|typeof|instanceof|of|in|do|switch|case|break|continue|yield|this|super|static|get|set|null|true|false|undefined|void|def|elif|lambda|None|True|False|self|print|public|private|fn|impl|struct|enum|match|use|pub)\b/;

const colorizeLine = (line, t) => {
  const out = []; let i = 0, key = 0;
  const re = /(\/\/.*$|#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|\s+|[^\w\s])/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const tok = m[0]; let color = null;
    if (/^(\/\/|#)/.test(tok)) color = t.textMute;
    else if (/^["'`]/.test(tok)) color = t.agent;
    else if (/^\d/.test(tok)) color = t.warn;
    else if (CODE_KW.test(tok)) color = t.accent;
    else if (/^[A-Za-z_$]/.test(tok) && line[re.lastIndex] === "(") color = t.system;
    out.push(color ? <span key={key++} style={{ color }}>{tok}</span> : <span key={key++}>{tok}</span>);
    i = re.lastIndex;
  }
  if (i < line.length) out.push(<span key={key++}>{line.slice(i)}</span>);
  return out;
};

export function CodeBody({ block, t }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(block.code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const lines = (block.code || "").split("\n");
  return (
    <div style={{ position: "relative" }}>
      <button onClick={copy} style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: t.surface, border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 11, color: copied ? t.agent : t.textDim, boxShadow: t.shadowSm, zIndex: 1 }}>
        {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}
      </button>
      <pre style={{ margin: 0, padding: "14px", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, color: t.text, overflowX: "auto", whiteSpace: "pre" }}><code>{lines.map((ln, i) => <div key={i}>{ln ? colorizeLine(ln, t) : "\u00A0"}</div>)}</code></pre>
    </div>
  );
}

export default CodeBody;
