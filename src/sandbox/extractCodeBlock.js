// Pulls the most recent fenced code block out of an assistant message and
// resolves which sandbox render mode it should open in.

const FENCE = /```([\w-]*)\n([\s\S]*?)```/g;

// Accepts either a raw string or a CMND message/block object.
const toText = (message) => {
  if (typeof message === "string") return message;
  if (!message) return "";
  if (typeof message.text === "string") return message.text;
  if (Array.isArray(message.blocks)) {
    return message.blocks
      .filter((b) => b.type === "message" && b.role === "assistant")
      .map((b) => b.text)
      .join("\n\n");
  }
  return "";
};

export const langToMode = (lang) => {
  const l = (lang || "").toLowerCase();
  if (["jsx", "tsx", "react", "js", "javascript", "ts", "typescript"].includes(l)) return "react";
  if (["html", "htm"].includes(l)) return "html";
  if (l === "svg") return "svg";
  if (["md", "markdown"].includes(l)) return "markdown";
  return "";
};

// Heuristic when there is no fence language or for pasted code.
export const detectMode = (code) => {
  const s = (code || "").trim();
  if (/^<svg[\s>]/i.test(s)) return "svg";
  if (/^<!doctype html|^<html[\s>]/i.test(s)) return "html";
  if (/export\s+default|React\.|from\s+['"]react['"]|=>\s*\(?\s*</.test(s)) return "react";
  if (/^#{1,6}\s|^\s*[-*]\s|\]\(/.test(s)) return "markdown";
  if (/^</.test(s)) return "html";
  return "react";
};

// Returns { code, lang, mode } for the LAST fenced block, or null if none.
export const extractCodeBlock = (message) => {
  const text = toText(message);
  let match, last = null;
  FENCE.lastIndex = 0;
  while ((match = FENCE.exec(text)) !== null) last = match;
  if (!last) {
    // No fence: treat the whole message as code if it looks like code.
    const trimmed = text.trim();
    if (/export\s+default|^</.test(trimmed)) return { code: trimmed, lang: "", mode: detectMode(trimmed) };
    return null;
  }
  const lang = last[1] || "";
  const code = last[2].replace(/\n+$/, "");
  const mode = langToMode(lang) || detectMode(code);
  return { code, lang, mode };
};

export default extractCodeBlock;
