import { useState, useEffect, useRef } from "react";
import { Check, Copy, ListChecks, ChevronDown, Globe, ArrowUp, Play } from "lucide-react";
import { HUMAN, MONO, MODELS, DEFAULT_MODEL, CHAT_SYSTEM } from "../design/tokens.js";
import { nextBid, blocksToMessages, parseApiResponse } from "../lib/artifacts.js";
import { IconBtn } from "../ui/IconBtn.jsx";
import { ArtifactCard } from "./artifacts/ArtifactCard.jsx";
import { extractCodeBlock, langToMode, detectMode } from "../sandbox/index.js";

export function ChatView({ thread, onUpdateBlocks, onSaveBlock, onRunInSandbox, webSearch, setWebSearch, accent, t }) {
  const [composer, setComposer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [modelPop, setModelPop] = useState(false);
  const scrollRef = useRef(null);
  const blocks = thread.blocks;
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [blocks.length, thinking, thread.id]);
  const toggleTask = (blockId, gi, ii) => onUpdateBlocks(bs => bs.map(b => { if (b.id !== blockId || b.artifact !== "tasklist") return b; return { ...b, groups: b.groups.map((g, x) => x !== gi ? g : { ...g, items: g.items.map((it, y) => y !== ii ? it : { ...it, done: !it.done }) }) }; }));

  const runMessage = (b) => { if (!onRunInSandbox) return; const found = extractCodeBlock(b); if (found) onRunInSandbox({ code: found.code, mode: found.mode }); };
  const runArtifact = (block) => { if (!onRunInSandbox) return; const mode = langToMode(block.language) || detectMode(block.code); onRunInSandbox({ code: block.code || "", mode }); };

  const send = async () => {
    const text = composer.trim(); if (!text || thinking) return;
    const userBlock = { id: nextBid("u"), type: "message", role: "user", text };
    const next = [...blocks, userBlock];
    onUpdateBlocks(() => next); setComposer(""); setThinking(true);
    try {
      const messages = blocksToMessages(next);
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: thread.model || DEFAULT_MODEL, max_tokens: 1600, system: CHAT_SYSTEM, messages, tools: webSearch ? [{ type: "web_search_20250305", name: "web_search" }] : [] }) });
      const data = await res.json();
      const parsed = parseApiResponse(data);
      onUpdateBlocks(() => [...next, ...(parsed.length ? parsed : [{ id: nextBid(), type: "message", role: "assistant", text: "…" }])]);
    } catch (e) {
      onUpdateBlocks(() => [...next, { id: nextBid("e"), type: "message", role: "assistant", text: "Couldn’t reach the model just now. Try again in a moment." }]);
    } finally { setThinking(false); }
  };
  const cur = MODELS.find(m => m.id === thread.model) || MODELS[1];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 16, padding: "4px 2px" }}>
        {blocks.length === 0 && <div style={{ padding: "28px 4px", fontFamily: MONO, fontSize: 13, color: t.textMute, lineHeight: 1.55 }}>New thread. Ask anything — replies can become artifacts you save into your Second Brain.</div>}
        {blocks.map(b => {
          if (b.type === "agent") return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: t.surface2, borderRadius: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: 999, background: `${t.agent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} color={t.agent} /></div>
              <div style={{ minWidth: 0 }}><div style={{ fontFamily: MONO, fontSize: 12.5, color: t.text }}>{b.title}</div><div style={{ fontFamily: MONO, fontSize: 11, color: t.textMute }}>{b.detail}</div></div>
            </div>
          );
          if (b.type === "artifact") return <ArtifactCard key={b.id} block={b} onSave={() => onSaveBlock(b)} onToggleTask={(gi, ii) => toggleTask(b.id, gi, ii)} onRun={runArtifact} t={t} />;
          const isUser = b.role === "user";
          const codeInMsg = !isUser && onRunInSandbox && extractCodeBlock(b);
          return (
            <div key={b.id} className="cmnd-msg" style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 3 }}>
              <div style={{ maxWidth: isUser ? "82%" : "100%", background: isUser ? accent : "transparent", color: isUser ? "#fff" : t.text, padding: isUser ? "10px 14px" : 0, borderRadius: isUser ? "18px 18px 5px 18px" : 0, fontFamily: HUMAN, fontSize: 15.5, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{b.text}</div>
              <div className="cmnd-msg-act" style={{ display: "flex", gap: 2 }}>
                <IconBtn t={t} onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(b.text || ""); }} title="Copy"><Copy size={13} /></IconBtn>
                {codeInMsg && <IconBtn t={t} onClick={() => runMessage(b)} title="Run in sandbox"><Play size={13} /></IconBtn>}
                <IconBtn t={t} onClick={() => onSaveBlock(b)} title="Save to Second Brain" active><ListChecks size={13} /></IconBtn>
              </div>
            </div>
          );
        })}
        {thinking && <div style={{ display: "flex", gap: 5, padding: "4px 2px" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: t.textMute, animation: `cmnd-blink 1.3s ${i * 0.18}s infinite` }} />)}</div>}
      </div>
      <div style={{ flexShrink: 0, paddingTop: 8 }}>
        <div style={{ background: t.surface2, borderRadius: 20, padding: "11px 13px", boxShadow: t.shadowSm }}>
          <textarea value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1}
            placeholder={thinking ? "Thinking…" : "Ask anything…"} style={{ width: "100%", minHeight: 24, maxHeight: 120, resize: "none", border: "none", outline: "none", background: "transparent", color: t.text, fontFamily: HUMAN, fontSize: 16, lineHeight: 1.5, display: "block" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setModelPop(p => !p)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 11px", borderRadius: 999, background: t.surface, border: "none", cursor: "pointer", boxShadow: t.shadowSm }}>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: t.text }}>{cur.label}</span>
                <ChevronDown size={12} style={{ color: t.textMute, transform: modelPop ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {modelPop && <>
                <div onClick={() => setModelPop(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, minWidth: 200, background: t.surface, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow, zIndex: 6, padding: 4 }}>
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { onUpdateBlocks(bs => bs, m.id); setModelPop(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", padding: "9px 11px", border: "none", borderRadius: 10, background: thread.model === m.id ? t.hover : "transparent", cursor: "pointer", textAlign: "left" }}>
                      <span><span style={{ display: "block", fontFamily: MONO, fontSize: 12.5, color: t.text }}>{m.label}</span><span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: t.textMute, marginTop: 2 }}>{m.tag}</span></span>
                      {thread.model === m.id && <Check size={14} color={accent} />}
                    </button>
                  ))}
                </div>
              </>}
            </div>
            <button onClick={() => setWebSearch(v => !v)} title={webSearch ? "Web search on" : "Web search off"} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 11px", borderRadius: 999, cursor: "pointer", border: "none", background: webSearch ? `${t.system}22` : t.surface, color: webSearch ? t.system : t.textMute, boxShadow: webSearch ? "none" : t.shadowSm }}>
              <Globe size={13} /><span className="cmnd-hide-sm" style={{ fontFamily: MONO, fontSize: 11 }}>Search</span>
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={send} disabled={!composer.trim() || thinking} style={{ width: 36, height: 36, borderRadius: 999, border: "none", cursor: composer.trim() && !thinking ? "pointer" : "default", background: composer.trim() && !thinking ? accent : t.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 160ms" }}>
              <ArrowUp size={18} strokeWidth={2.6} color={composer.trim() && !thinking ? "#fff" : t.textMute} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
