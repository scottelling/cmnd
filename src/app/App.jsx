import { useState, useEffect, useRef, useCallback } from "react";
import {
  Settings, Plus, X, Layers, PanelLeftClose, PanelLeftOpen, Sun, Moon, Check, Code2,
} from "lucide-react";
import { SANS, HUMAN, MONO, EASE, THEMES, ROLES, ROLE_ORDER, DEFAULT_MODEL } from "../design/tokens.js";
import { SK, loadKey, useDebouncedSave, onStorageEpoch } from "../storage/index.js";
import { useAuth } from "../lib/useAuth.js";
import { materialize, newNodeId } from "../lib/tree.js";
import { nextBid } from "../lib/artifacts.js";
import { Dot } from "../ui/Dot.jsx";
import { IconBtn } from "../ui/IconBtn.jsx";
import { Panel } from "../panels/Panel.jsx";
import { PanelRail } from "../panels/PanelRail.jsx";
import { OutlineView } from "../secondbrain/OutlineView.jsx";
import { ChatView } from "../chat/ChatView.jsx";
import { CalendarPanel } from "../calendar/CalendarPanel.jsx";
import { SaveSheet } from "../ui/SaveSheet.jsx";
import { LiveSandbox } from "../sandbox/index.js";
import { defaultStorage } from "../sandbox/index.js";

/* ════════════════ seed data ════════════════ */
const seedOutlines = () => ([
  { id: "ol_start", title: "Start here", zoomPath: [], collapsedIds: {}, nodes: [
    { id: newNodeId(), text: "This outline is yours — tap any line to edit it. Return starts the next bullet", children: [] },
    { id: newNodeId(), text: "Hold a bullet and drag to reorder — pause over a line to nest inside it", children: [
      { id: newNodeId(), text: "Try dragging this one somewhere else", children: [] },
    ]},
    { id: newNodeId(), text: "While editing, the ⇤ ⇥ buttons (or Tab / Shift-Tab) outdent and indent", children: [] },
    { id: newNodeId(), text: "Long-press a line to select several — then indent, copy, delete, or Ask together", children: [] },
    { id: newNodeId(), text: "Ask sends notes to Chat — and chat replies save back into this brain", children: [] },
  ]},
]);
const seedThreads = () => ([
  { id: "th_first", title: "New thread", model: DEFAULT_MODEL, blocks: [] },
]);
const seedEvents = () => [];

/* ════════════════ ROOT ════════════════ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [panels, setPanels] = useState([{ role: "secondbrain", width: 460 }, { role: "chat", width: 380 }]);
  const [minimized, setMinimized] = useState([]);
  const [fullscreen, setFullscreen] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const auth = useAuth();
  const [authEmail, setAuthEmail] = useState("");
  const [railOpen, setRailOpen] = useState({ secondbrain: false, chat: false });

  const [outlines, setOutlines] = useState(seedOutlines);
  const [threads, setThreads] = useState(seedThreads);
  const [events, setEvents] = useState(seedEvents);
  const [activeOutlineId, setActiveOutlineId] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [calDate, setCalDate] = useState(new Date());

  const [saveTarget, setSaveTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [sandbox, setSandbox] = useState(null); // { code, mode } | null
  const [addMenu, setAddMenu] = useState(false); // top-bar "add a panel" popover
  const toastTimer = useRef(null);
  const showToast = useCallback((m) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2400); }, []);

  const hydrate = useCallback(async () => {
    setReady(false);
    const [th, lay, mn, ro, ol, tr, ev, ao, at] = await Promise.all([
      loadKey(SK("theme"), "dark"), loadKey(SK("layout"), null), loadKey(SK("minimized"), []), loadKey(SK("railOpen"), null),
      loadKey(SK("outlines"), null), loadKey(SK("threads"), null), loadKey(SK("events"), null),
      loadKey(SK("activeOutline"), null), loadKey(SK("activeThread"), null),
    ]);
    setTheme(th || "dark");
    if (Array.isArray(lay) && lay.length) setPanels(lay);
    if (Array.isArray(mn)) setMinimized(mn);
    if (ro && typeof ro === "object") setRailOpen({ secondbrain: !!ro.secondbrain, chat: !!ro.chat });
    if (Array.isArray(ol) && ol.length) setOutlines(ol);
    if (Array.isArray(tr) && tr.length) setThreads(tr);
    if (Array.isArray(ev)) setEvents(ev);
    if (ao) setActiveOutlineId(ao);
    if (at) setActiveThreadId(at);
    setReady(true);
  }, []);
  // Hydrate on boot, and again whenever the storage backend swaps (sign in / out).
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => onStorageEpoch(() => { hydrate(); }), [hydrate]);

  useDebouncedSave(SK("theme"), theme, ready);
  useDebouncedSave(SK("layout"), panels, ready);
  useDebouncedSave(SK("minimized"), minimized, ready);
  useDebouncedSave(SK("railOpen"), railOpen, ready);
  useDebouncedSave(SK("outlines"), outlines, ready);
  useDebouncedSave(SK("threads"), threads, ready);
  useDebouncedSave(SK("events"), events, ready);
  useDebouncedSave(SK("activeOutline"), activeOutlineId, ready);
  useDebouncedSave(SK("activeThread"), activeThreadId, ready);

  const t = THEMES[theme];
  const activeOutlineIdSafe = activeOutlineId && outlines.find(o => o.id === activeOutlineId) ? activeOutlineId : (outlines[0] && outlines[0].id);
  const activeThreadIdSafe = activeThreadId && threads.find(x => x.id === activeThreadId) ? activeThreadId : (threads[0] && threads[0].id);
  const activeOutline = outlines.find(o => o.id === activeOutlineIdSafe) || outlines[0];
  const activeThread = threads.find(x => x.id === activeThreadIdSafe) || threads[0];

  const updateOutline = useCallback((id, patch) => setOutlines(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o)), []);
  const newOutline = () => { const id = `ol_${Date.now()}`; setOutlines(prev => [{ id, title: "New outline", zoomPath: [], collapsedIds: {}, nodes: [] }, ...prev]); setActiveOutlineId(id); };
  const renameOutline = useCallback((id, title) => setOutlines(prev => prev.map(o => o.id === id ? { ...o, title } : o)), []);
  const deleteOutline = (id) => { setOutlines(prev => { const next = prev.filter(o => o.id !== id); return next.length ? next : [{ id: `ol_${Date.now()}`, title: "New outline", zoomPath: [], collapsedIds: {}, nodes: [] }]; }); setActiveOutlineId(cur => cur === id ? null : cur); showToast("Outline deleted"); };
  const reorderOutlines = useCallback((from, to) => setOutlines(prev => { const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }), []);
  const updateThreadBlocks = useCallback((id, updater, model) => setThreads(prev => prev.map(x => { if (x.id !== id) return x; const blocks = updater ? updater(x.blocks) : x.blocks; let title = x.title; if (title === "New thread") { const fm = blocks.find(b => b.type === "message" && b.role === "user"); if (fm && fm.text) title = fm.text.slice(0, 40); } return { ...x, title, blocks, model: model || x.model }; })), []);
  const newThread = () => { const id = `th_${Date.now()}`; setThreads(prev => [{ id, title: "New thread", model: DEFAULT_MODEL, blocks: [] }, ...prev]); setActiveThreadId(id); };
  const renameThread = useCallback((id, title) => setThreads(prev => prev.map(x => x.id === id ? { ...x, title } : x)), []);
  const deleteThread = (id) => { setThreads(prev => { const next = prev.filter(x => x.id !== id); return next.length ? next : [{ id: `th_${Date.now()}`, title: "New thread", model: DEFAULT_MODEL, blocks: [] }]; }); setActiveThreadId(cur => cur === id ? null : cur); showToast("Thread deleted"); };
  const reorderThreads = useCallback((from, to) => setThreads(prev => { const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }), []);

  const ensurePanel = useCallback((role) => { setMinimized(m => m.filter(r => r !== role)); setPanels(prev => prev.find(p => p.role === role) ? prev : [...prev, { role, width: ROLES[role].def }]); }, []);
  const toggleRail = (role) => setRailOpen(r => ({ ...r, [role]: !r[role] }));

  /* ── THE BRIDGE ── */
  const buildNodesFromBlock = (b) => {
    if (b.type === "message") return [{ text: (b.text || "").trim(), children: [] }];
    const title = b.title || "Artifact";
    if (b.artifact === "tasklist") return [{ text: title, children: (b.groups || []).map(g => ({ text: g.label, children: (g.items || []).map(it => ({ text: it.text, children: [] })) })) }];
    if (b.artifact === "decision") return [{ text: title, children: (b.options || []).map(o => ({ text: `${o.label}${o.order ? " — " + o.order : ""}`, children: [] })) }];
    if (b.artifact === "table") { const cols = (b.data && b.data.columns) || [], rows = (b.data && b.data.rows) || []; return [{ text: title, children: rows.map(r => ({ text: cols.map(c => `${c.label}: ${c.prefix || ""}${r[c.key]}${c.suffix || ""}`).join(" · "), children: [] })) }]; }
    if (b.artifact === "code") { const first = (b.code || "").split("\n").find(l => l.trim()) || ""; return [{ text: title, children: [{ text: `${b.language || "code"}: ${first}`.slice(0, 200), children: [] }] }]; }
    return [{ text: title, children: [] }];
  };
  const saveBlockToOutline = (b) => setSaveTarget({ nodes: buildNodesFromBlock(b), label: b.type === "artifact" ? b.artifact : "note" });
  const commitSave = (outlineId) => { if (!saveTarget) return; const nn = materialize(saveTarget.nodes); let title = "outline"; setOutlines(prev => prev.map(o => { if (o.id !== outlineId) return o; title = o.title; return { ...o, nodes: [...o.nodes, ...nn] }; })); ensurePanel("secondbrain"); setActiveOutlineId(outlineId); setSaveTarget(null); showToast(`Saved to ${title}`); };
  const commitSaveNew = () => { if (!saveTarget) return; const id = `ol_${Date.now()}`; const nn = materialize(saveTarget.nodes); setOutlines(prev => [{ id, title: "New outline", zoomPath: [], collapsedIds: {}, nodes: nn }, ...prev]); ensurePanel("secondbrain"); setActiveOutlineId(id); setSaveTarget(null); showToast("Saved to new outline"); };

  const askInChat = (input) => {
    const arr = Array.isArray(input) ? input : [input];
    const id = `th_${Date.now()}`;
    const blockOf = (n) => { const kids = (n.children || []).map(c => `  - ${c.text}`).join("\n"); return `- ${n.text}${kids ? "\n" + kids : ""}`; };
    const seed = arr.length === 1
      ? `Help me think about this note:\n\n"${arr[0].text}"${(arr[0].children || []).length ? "\n" + (arr[0].children || []).map(c => `- ${c.text}`).join("\n") : ""}`
      : `Help me think about these notes:\n\n${arr.map(blockOf).join("\n")}`;
    setThreads(prev => [{ id, title: ((arr[0] && arr[0].text) || "New thread").slice(0, 40), model: DEFAULT_MODEL, blocks: [{ id: nextBid("u"), type: "message", role: "user", text: seed }] }, ...prev]);
    ensurePanel("chat"); setActiveThreadId(id); showToast(arr.length > 1 ? `Started a chat from ${arr.length} notes` : "Started a chat from your note");
  };

  const removePanel = (role) => { setPanels(prev => prev.filter(p => p.role !== role)); if (fullscreen === role) setFullscreen(null); };
  const minimizePanel = (role) => { setMinimized(m => m.includes(role) ? m : [...m, role]); if (fullscreen === role) setFullscreen(null); };
  const restorePanel = (role) => setMinimized(m => m.filter(r => r !== role));
  const addBackPanel = (role) => { ensurePanel(role); setSettingsOpen(false); };
  const resizePanel = (role, w) => setPanels(prev => prev.map(p => p.role === role ? { ...p, width: w } : p));
  const reorder = useCallback((from, to) => setPanels(prev => { if (from === to) return prev; const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }), []);

  const [dragState, setDragState] = useState(null);
  const dragRef = useRef(null);
  const rowRef = useRef(null); const rectsRef = useRef([]);
  useEffect(() => { dragRef.current = dragState; }, [dragState]);
  const onPanelDragStart = (idx, e) => {
    e.preventDefault();
    setDragState({ from: idx, cur: idx });
    if (rowRef.current) rectsRef.current = Array.from(rowRef.current.children).filter(c => c.dataset.pidx !== undefined).map(c => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; });
  };
  useEffect(() => {
    if (!dragState) return undefined;
    const onMove = (e) => { const cx = e.clientX; let cl = dragState.from, md = Infinity; rectsRef.current.forEach((c, i) => { const d = Math.abs(cx - c); if (d < md) { md = d; cl = i; } }); setDragState(p => p ? { ...p, cur: cl } : null); };
    const onUp = () => { const d = dragRef.current; if (d && d.from !== d.cur) reorder(d.from, d.cur); setDragState(null); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [dragState, reorder]);

  const [containerW, setContainerW] = useState(0);
  useEffect(() => {
    const el = rowRef.current; if (!el) return undefined;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(measure); ro.observe(el); }
    window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // Faster left/right panel scrolling: amplify horizontal-intent wheel/trackpad
  // deltas (and shift+wheel) into the row. Vertical scrolling inside panels is
  // left untouched, so it never hijacks the outline/chat lists.
  useEffect(() => {
    const el = rowRef.current; if (!el) return undefined;
    const onWheel = (e) => {
      const horiz = e.shiftKey ? e.deltaY : (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0);
      if (!horiz) return;
      e.preventDefault();
      el.scrollLeft += horiz * 1.6;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const avail = (containerW || (typeof window !== "undefined" ? window.innerWidth : 1200)) - 28;
  const fitWidth = (w) => avail > 120 ? Math.min(w, avail) : w;

  const visiblePanels = panels.filter(p => !minimized.includes(p.role));

  const runInSandbox = ({ code, mode }) => setSandbox({ code, mode });
  const openSandbox = () => setSandbox({ code: "", mode: "auto" });
  // Panels not currently on screen (removed OR minimized) — the top-bar + adds these.
  const addableRoles = ROLE_ORDER.filter(r => !visiblePanels.find(p => p.role === r));

  const renderPanelContent = (role) => {
    const accent = t[ROLES[role].accentKey];
    if (role === "secondbrain") return (
      <PanelRail items={outlines} activeId={activeOutlineIdSafe} onSelect={setActiveOutlineId} onNew={newOutline} onReorder={reorderOutlines} onRename={renameOutline} onDelete={deleteOutline} newLabel="Outline" accent={accent} t={t} open={railOpen.secondbrain}>
        {activeOutline ? <OutlineView outline={activeOutline} onUpdate={(patch) => updateOutline(activeOutline.id, patch)} onAskInChat={askInChat} onToast={showToast} accent={accent} t={t} />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, color: t.textMute }}>No outlines</div>}
      </PanelRail>
    );
    if (role === "chat") return (
      <PanelRail items={threads} activeId={activeThreadIdSafe} onSelect={setActiveThreadId} onNew={newThread} onReorder={reorderThreads} onRename={renameThread} onDelete={deleteThread} newLabel="Thread" accent={accent} t={t} open={railOpen.chat}>
        {activeThread ? <ChatView thread={activeThread} onUpdateBlocks={(updater, model) => updateThreadBlocks(activeThread.id, updater, model)} onSaveBlock={saveBlockToOutline} onRunInSandbox={runInSandbox} webSearch={webSearch} setWebSearch={setWebSearch} accent={accent} t={t} />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, color: t.textMute }}>No threads</div>}
      </PanelRail>
    );
    if (role === "calendar") return <CalendarPanel events={events} onUpdate={(updater) => setEvents(updater)} date={calDate} setDate={setCalDate} accent={accent} t={t} />;
    return null;
  };

  const railToggle = (role) => ROLES[role].rail ? (
    <IconBtn t={t} onClick={() => toggleRail(role)} title={railOpen[role] ? "Hide sidebar" : "Show sidebar"} active={railOpen[role]}>
      {railOpen[role] ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
    </IconBtn>
  ) : null;

  const fsRole = fullscreen && panels.find(p => p.role === fullscreen) ? fullscreen : null;

  return (
    <div style={{ width: "100vw", height: "100dvh", background: t.bg, display: "flex", flexDirection: "column", fontFamily: SANS, color: t.text, overflow: "hidden", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input, textarea, select { font-size: 16px; }
        @keyframes cmnd-blink { 0%,60%,100%{opacity:.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }
        @keyframes cmnd-pulse { 0%{opacity:1} 70%{opacity:.4} 100%{opacity:1} }
        @keyframes cmnd-sheet { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes cmnd-toast { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .cmnd-noscroll::-webkit-scrollbar{display:none} .cmnd-noscroll{scrollbar-width:none}
        .cmnd-msg .cmnd-msg-act{opacity:0;transition:opacity .15s} .cmnd-msg:hover .cmnd-msg-act{opacity:1}
        @media (hover:none){ .cmnd-msg .cmnd-msg-act{opacity:.6} }
        ::-webkit-scrollbar{width:8px;height:8px} ::-webkit-scrollbar-thumb{background:${t.hover};border-radius:8px} ::-webkit-scrollbar-track{background:transparent}
        @media (max-width:600px){ .cmnd-hide-sm{display:none} }
        textarea::placeholder, input::placeholder { color: ${t.textMute}; }
      `}</style>

      <div style={{ height: 52, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: t.railBg, flexShrink: 0, boxShadow: t.shadowSm, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: t.accent, letterSpacing: "0.05em" }}>CMND</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Dot color={t.agent} pulse /><span style={{ fontFamily: MONO, fontSize: 10.5, color: t.agent, letterSpacing: "0.06em" }}>LIVE</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <IconBtn t={t} onClick={() => setAddMenu(v => !v)} title="Add a panel" active={addMenu}><Plus size={19} /></IconBtn>
            {addMenu && <>
              <div onClick={() => setAddMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 5 }} />
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 196, background: t.surface, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow, zIndex: 6, padding: 4 }}>
                {addableRoles.length === 0
                  ? <div style={{ padding: "10px 12px", fontFamily: MONO, fontSize: 11.5, color: t.textMute }}>All panels open</div>
                  : addableRoles.map(role => { const meta = ROLES[role]; const accent = t[meta.accentKey]; const isMin = minimized.includes(role); return (
                      <button key={role} onClick={() => { ensurePanel(role); setAddMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 11px", border: "none", borderRadius: 9, background: "transparent", cursor: "pointer", textAlign: "left" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = t.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <span style={{ width: 24, height: 24, borderRadius: 7, background: `${accent}1f`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}><meta.Icon size={14} /></span>
                        <span style={{ flex: 1, fontFamily: HUMAN, fontSize: 13.5, color: t.text }}>{meta.label}</span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: t.textMute }}>{isMin ? "restore" : "add"}</span>
                      </button>
                    ); })}
              </div>
            </>}
          </div>
          <IconBtn t={t} onClick={openSandbox} title="Live Sandbox"><Code2 size={18} /></IconBtn>
          <IconBtn t={t} onClick={() => setTheme(m => m === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to light" : "Switch to dark"}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</IconBtn>
          <IconBtn t={t} onClick={() => setSettingsOpen(true)} title="Settings"><Settings size={18} /></IconBtn>
        </div>
      </div>

      <div ref={rowRef} style={{ flex: 1, minHeight: 0, display: "flex", gap: 12, padding: 14, overflowX: "auto", overflowY: "hidden", scrollSnapType: "x proximity", scrollPaddingLeft: 14, scrollPaddingRight: 14, WebkitOverflowScrolling: "touch" }}>
        {visiblePanels.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: t.textMute }}>
            <Layers size={30} /><span style={{ fontFamily: MONO, fontSize: 13 }}>All panels closed — add one from Settings.</span>
          </div>
        )}
        {visiblePanels.map((p) => {
          const idx = panels.findIndex(x => x.role === p.role);
          const accent = t[ROLES[p.role].accentKey];
          return (
            <div key={p.role} data-pidx={idx} style={{ display: "flex", alignItems: "stretch", height: "100%", scrollSnapAlign: "start", scrollSnapStop: "normal" }}>
              {dragState && dragState.cur === idx && dragState.from > idx && <div style={{ width: 3, borderRadius: 2, background: t.accent, marginRight: 6 }} />}
              <Panel role={p.role} width={fitWidth(p.width)} accent={accent} t={t} leading={railToggle(p.role)} resizable={fitWidth(p.width) >= p.width}
                onResize={(w) => resizePanel(p.role, w)} onMinimize={() => minimizePanel(p.role)} onRemove={() => removePanel(p.role)}
                onDragStart={(e) => onPanelDragStart(idx, e)} isDragging={dragState && dragState.from === idx}
                fullscreen={false} onToggleFull={() => setFullscreen(p.role)}>
                {renderPanelContent(p.role)}
              </Panel>
              {dragState && dragState.cur === idx && dragState.from < idx && <div style={{ width: 3, borderRadius: 2, background: t.accent, marginLeft: 6 }} />}
            </div>
          );
        })}
      </div>

      {minimized.length > 0 && (
        <div style={{ flexShrink: 0, padding: "8px 14px", background: t.railBg, display: "flex", alignItems: "center", gap: 8, boxShadow: `0 -6px 18px -12px rgba(0,0,0,0.4)`, position: "relative", zIndex: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>Minimized</span>
          {minimized.filter(r => panels.find(p => p.role === r)).map(role => { const meta = ROLES[role]; const accent = t[meta.accentKey]; return (
            <button key={role} onClick={() => restorePanel(role)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 10, border: "none", background: `${accent}1a`, cursor: "pointer" }}>
              <meta.Icon size={13} color={accent} /><span style={{ fontFamily: HUMAN, fontSize: 12.5, fontWeight: 500, color: t.text }}>{meta.label}</span>
            </button>
          ); })}
        </div>
      )}

      {fsRole && (
        <Panel role={fsRole} width={0} accent={t[ROLES[fsRole].accentKey]} t={t} leading={railToggle(fsRole)}
          onResize={() => {}} onMinimize={() => {}} onRemove={() => {}} onDragStart={() => {}} isDragging={false}
          fullscreen onToggleFull={() => setFullscreen(null)}>
          {renderPanelContent(fsRole)}
        </Panel>
      )}

      {settingsOpen && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 250, display: "flex", justifyContent: "flex-end" }} onClick={() => setSettingsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 320, height: "100%", background: t.surface, boxShadow: t.shadow, display: "flex", flexDirection: "column", animation: `cmnd-sheet 220ms ${EASE}` }}>
            <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: t.text }}>Settings</span>
              <IconBtn t={t} onClick={() => setSettingsOpen(false)} title="Close"><X size={20} /></IconBtn>
            </div>
            <div style={{ padding: "0 20px 20px", overflow: "auto" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: t.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Appearance</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {["dark", "light"].map(m => (
                  <button key={m} onClick={() => setTheme(m)} style={{ flex: 1, padding: 14, borderRadius: 14, cursor: "pointer", border: "none", background: m === "dark" ? "#16161F" : "#FFFFFF", boxShadow: theme === m ? `0 0 0 2px ${t.accent}` : t.shadowSm, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    {m === "dark" ? <Moon size={18} color="#ECECF2" /> : <Sun size={18} color="#15151E" />}
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: m === "dark" ? "#ECECF2" : "#15151E", textTransform: "capitalize" }}>{m}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: t.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Panels</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ROLE_ORDER.map(role => { const meta = ROLES[role]; const present = panels.find(p => p.role === role); const isMin = minimized.includes(role); const accent = t[meta.accentKey]; return (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, background: t.surface2 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: `${accent}1f`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}><meta.Icon size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: t.text }}>{meta.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: t.textMute }}>{present ? (isMin ? "minimized" : "open") : "removed · data kept"}</div>
                    </div>
                    {present
                      ? (isMin
                        ? <button onClick={() => restorePanel(role)} style={{ padding: "7px 13px", borderRadius: 9, border: "none", background: `${accent}1f`, color: accent, fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Restore</button>
                        : <button onClick={() => removePanel(role)} style={{ padding: "7px 13px", borderRadius: 9, border: "none", background: `${t.danger}1f`, color: t.danger, fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Remove</button>)
                      : <button onClick={() => addBackPanel(role)} style={{ padding: "7px 13px", borderRadius: 9, border: "none", background: `${accent}1f`, color: accent, fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>}
                  </div>
                ); })}
              </div>
              <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 10.5, color: t.textFaint, lineHeight: 1.6 }}>
                Removing a panel only hides the view. Its data is preserved and reattaches when you add it back.
              </div>

              {auth.configured && (
                <>
                  <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 10, color: t.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Account</div>
                  {auth.user ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "13px 14px", borderRadius: 12, background: t.surface2 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, color: t.text }}>Signed in as <span style={{ fontWeight: 700 }}>{auth.user.email}</span></div>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, color: t.textMute }}>Synced to your account across devices.</div>
                      <button onClick={auth.signOut} style={{ alignSelf: "flex-start", padding: "8px 14px", borderRadius: 9, border: "none", background: `${t.danger}1f`, color: t.danger, fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Sign out</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input value={authEmail} onChange={(e) => { setAuthEmail(e.target.value); auth.setSent(false); }} placeholder="you@email.com" type="email" autoComplete="email" inputMode="email"
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "none", background: t.surface2, color: t.text, fontFamily: SANS, outline: "none" }} />
                      <button onClick={() => auth.signIn(authEmail.trim())} disabled={auth.sending || !authEmail.trim()}
                        style={{ padding: "11px 14px", borderRadius: 12, border: "none", background: `${t.accent}1f`, color: t.accent, fontFamily: SANS, fontSize: 13, fontWeight: 700, cursor: auth.sending ? "default" : "pointer", opacity: (auth.sending || !authEmail.trim()) ? 0.5 : 1 }}>
                        {auth.sending ? "Sending…" : "Send magic link"}
                      </button>
                      {auth.sent && <div style={{ fontFamily: MONO, fontSize: 10.5, color: t.agent }}>Check your email for a sign-in link.</div>}
                      {auth.error && <div style={{ fontFamily: MONO, fontSize: 10.5, color: t.danger }}>{auth.error}</div>}
                      <div style={{ fontFamily: MONO, fontSize: 10.5, color: t.textFaint, lineHeight: 1.6 }}>Sign in to sync across devices. Your local data uploads on first sign-in.</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {saveTarget && <SaveSheet outlines={outlines} label={saveTarget.label} onPick={commitSave} onNew={commitSaveNew} onClose={() => setSaveTarget(null)} t={t} accent={t.sb} />}
      {toast && <div style={{ position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)", zIndex: 320, background: t.text, color: t.bg, fontFamily: MONO, fontSize: 12.5, padding: "10px 18px", borderRadius: 999, boxShadow: t.shadow, display: "flex", alignItems: "center", gap: 8, animation: "cmnd-toast 200ms ease" }}><Check size={14} strokeWidth={3} />{toast}</div>}

      <LiveSandbox
        open={!!sandbox}
        onClose={() => setSandbox(null)}
        initialCode={sandbox?.code || ""}
        initialMode={sandbox?.mode || "auto"}
        themeMode={theme}
        storage={defaultStorage}
      />
    </div>
  );
}
