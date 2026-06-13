// Purple Rain design tokens + workspace constants.
// Depth is fills + soft shadow, never hairline strokes — an explicit product
// decision; do not reintroduce borders for separation.
import { ListChecks, MessageSquare, Calendar as CalendarIcon } from "lucide-react";

export const EASE = "cubic-bezier(0.22,1,0.36,1)";

export const SANS = "'Outfit',-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif";
export const HUMAN = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif";
export const MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace";

/* ── tokens — Purple Rain, refined. depth via fills + shadow, never strokes ── */
export const THEMES = {
  dark: {
    bg: "#0C0C11", surface: "#16161F", surface2: "#1F1F2C", hover: "rgba(255,255,255,0.05)",
    text: "#ECECF2", textDim: "rgba(255,255,255,0.56)", textMute: "rgba(255,255,255,0.36)", textFaint: "rgba(255,255,255,0.2)",
    inputBg: "rgba(255,255,255,0.06)", railBg: "#101017", overlay: "rgba(6,6,10,0.66)",
    accent: "#BB86FC", system: "#82B1FF", agent: "#69F0AE", warn: "#FFD740", danger: "#FF6B6B", artifact: "#BB86FC",
    sb: "#BB86FC", chat: "#82B1FF", cal: "#69F0AE",
    shadow: "0 18px 48px -22px rgba(0,0,0,0.75)", shadowSm: "0 6px 18px -10px rgba(0,0,0,0.6)",
  },
  light: {
    bg: "#EFEFF4", surface: "#FFFFFF", surface2: "#F1F1F6", hover: "rgba(20,18,40,0.045)",
    text: "#15151E", textDim: "rgba(20,18,40,0.6)", textMute: "rgba(20,18,40,0.44)", textFaint: "rgba(20,18,40,0.28)",
    inputBg: "rgba(20,18,40,0.05)", railBg: "#E7E7EE", overlay: "rgba(20,18,40,0.34)",
    accent: "#6E56CF", system: "#3B6EF5", agent: "#1FA971", warn: "#C8860B", danger: "#E5484D", artifact: "#6E56CF",
    sb: "#6E56CF", chat: "#3B6EF5", cal: "#1FA971",
    shadow: "0 18px 48px -24px rgba(20,18,40,0.32)", shadowSm: "0 6px 18px -12px rgba(20,18,40,0.22)",
  },
};

export const ROLES = {
  secondbrain: { label: "Second Brain", Icon: ListChecks, accentKey: "sb", min: 280, def: 400, rail: true },
  chat:        { label: "Chat",          Icon: MessageSquare, accentKey: "chat", min: 320, def: 460, rail: true },
  calendar:    { label: "Daily Calendar",Icon: CalendarIcon, accentKey: "cal", min: 300, def: 400, rail: false },
};
export const ROLE_ORDER = ["secondbrain", "chat", "calendar"];

// Model picker. ids are the current, pinned Anthropic model ids and are passed
// straight through to the /api/chat proxy.
export const MODELS = [
  { id: "claude-opus-4-8", label: "Opus 4.8", tag: "Most capable" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", tag: "Balanced" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5", tag: "Fastest" },
];
// Default model used for new threads — matches the Sonnet picker id above.
export const DEFAULT_MODEL = "claude-sonnet-4-6";

export const FORMATS = [{ id: "outline", label: "List" }, { id: "md", label: "Markdown" }, { id: "json", label: "JSON" }];
export const EVENT_COLORS = ["#BB86FC", "#82B1FF", "#69F0AE", "#FFD740", "#F48FB1", "#FF8A65"];

export const CHAT_SYSTEM = `You are CMND — a workspace co-author, not a chatbot. Be concise, direct, and substantive; editorial tone, no filler.
When a structured object serves better than prose, emit artifacts inline using this EXACT format, each on its own lines:
<artifact type="table" title="...">{"columns":[{"key":"k","label":"L","align":"left","prefix":"","suffix":""}],"rows":[{"k":"v"}]}</artifact>
<artifact type="code" title="..." language="ts">{"code":"source as one string"}</artifact>
<artifact type="decision" title="...">{"options":[{"key":"a","label":"L","order":"summary","upside":"gain","downside":"loss","meta":"timing"}]}</artifact>
<artifact type="tasklist" title="...">{"groups":[{"label":"G","items":[{"id":"t1","text":"t","done":false}]}]}</artifact>
Prose first. Artifacts only when structure genuinely helps. JSON inside the tags must be strictly valid. Use web_search when the request needs current information.`;
