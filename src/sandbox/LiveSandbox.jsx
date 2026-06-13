import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { buildSrcDoc } from "./buildSrcDoc.js";
import { useSandboxBridge } from "./useSandboxBridge.js";
import { detectMode } from "./extractCodeBlock.js";
import { defaultStorage } from "./defaultStorage.js";
import { themeFor, FONT_UI, FONT_CODE, TOUCH } from "./tokens.js";

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "react", label: "React" },
  { id: "html", label: "HTML" },
  { id: "svg", label: "SVG" },
  { id: "markdown", label: "MD" },
];
const EXT = { react: "jsx", html: "html", svg: "svg", markdown: "md" };

// tiny inline icons (swap for Material Icons Rounded in the repo if preferred)
const Ico = ({ d, size = 20, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IconCopy = (p) => <Ico {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />;
const IconDownload = (p) => <Ico {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />;
const IconClose = (p) => <Ico {...p} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />;
const IconRefresh = (p) => <Ico {...p} d={<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>} />;
const IconTerminal = (p) => <Ico {...p} d={<><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>} />;

export default function LiveSandbox({
  open,
  onClose,
  initialCode = "",
  initialMode = "auto",
  storage = defaultStorage,
  themeMode = "dark",
  title = "Live Sandbox",
}) {
  const t = themeFor(themeMode);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const [code, setCode] = useState(initialCode);
  const [mode, setMode] = useState(initialMode);
  const [tab, setTab] = useState("preview");
  const [runId, setRunId] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");
  const [width, setWidth] = useState(Math.min(560, typeof window !== "undefined" ? window.innerWidth * 0.46 : 560));
  const [showConsole, setShowConsole] = useState(false);

  const iframeRef = useRef(null);
  const { error, clearError, logs, clearLogs, ready } = useSandboxBridge(iframeRef, storage, runId);

  const resolvedMode = mode === "auto" ? detectMode(code) : mode;

  // load new code/mode when the drawer is (re)opened with fresh input
  useEffect(() => { if (open) { setCode(initialCode); setMode(initialMode); setTab("preview"); } }, [open, initialCode, initialMode]);

  // debounce -> rebuild + full reload
  useEffect(() => {
    if (!open) return undefined;
    const id = setTimeout(() => {
      setSrcDoc(buildSrcDoc(code, resolvedMode, t));
      setRunId((n) => n + 1);
    }, 380);
    return () => clearTimeout(id);
  }, [code, resolvedMode, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const rerun = () => { setSrcDoc(buildSrcDoc(code, resolvedMode, t)); setRunId((n) => n + 1); };

  // ---- nuclear-lock resize (desktop only) ----
  const dragRef = useRef(null);
  const onResizeDown = useCallback((e) => {
    if (isMobile) return;
    e.preventDefault();
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;cursor:col-resize;touch-action:none";
    overlay.setAttribute("data-no-drag", "true");
    document.body.appendChild(overlay);
    const prevSel = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const startX = e.clientX, startW = width;
    const move = (ev) => { ev.preventDefault(); const nx = startW + (startX - ev.clientX); setWidth(Math.max(360, Math.min(window.innerWidth * 0.92, nx))); };
    const up = () => {
      document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up);
      document.removeEventListener("touchmove", move); document.removeEventListener("touchend", up);
      overlay.remove(); document.body.style.userSelect = prevSel; dragRef.current = null;
    };
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
    document.addEventListener("touchmove", move, { passive: false }); document.addEventListener("touchend", up);
    dragRef.current = up;
  }, [isMobile, width]);
  useEffect(() => () => { if (dragRef.current) dragRef.current(); }, []);

  const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(code); };
  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sandbox.${EXT[resolvedMode] || "txt"}`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const onCodeKey = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target, s = el.selectionStart, en = el.selectionEnd;
      const next = code.slice(0, s) + "  " + code.slice(en);
      setCode(next);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
    }
  };

  if (!open) return null;

  const drawerWidth = isMobile ? "100vw" : width;
  const seg = (active) => ({
    padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer",
    fontFamily: FONT_UI, fontSize: 13, fontWeight: 600,
    background: active ? t.accent : "transparent", color: active ? "#0C0C11" : t.textDim,
    minHeight: 34,
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end", fontFamily: FONT_UI }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: t.overlay }} />
      <div data-no-drag="true" style={{ position: "relative", width: drawerWidth, maxWidth: "100vw", height: "100%", background: t.surface, display: "flex", flexDirection: "column", boxShadow: t.shadow, animation: "cmnd-sb-in 240ms cubic-bezier(0.22,1,0.36,1)" }}>
        <style>{`
          @keyframes cmnd-sb-in { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
          .cmnd-sb-ib { width:${TOUCH}px; height:${TOUCH}px; display:flex; align-items:center; justify-content:center; border:none; background:transparent; cursor:pointer; border-radius:10px; color:${t.textDim}; }
          .cmnd-sb-ib:hover { background:${t.hover}; color:${t.text}; }
          .cmnd-sb-ta::placeholder { color:${t.textMute}; }
        `}</style>

        {/* resize handle (desktop) */}
        {!isMobile && <div onMouseDown={onResizeDown} onTouchStart={onResizeDown} title="Drag to resize"
          style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 8, cursor: "col-resize", touchAction: "none", zIndex: 2 }} />}

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: error ? t.danger : ready ? t.teal : t.accent, flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 15, color: t.text, marginRight: 4 }}>{title}</span>
          <div style={{ display: "flex", gap: 2, background: t.surfaceAlt, borderRadius: 11, padding: 3, marginLeft: 4 }}>
            <button style={seg(tab === "preview")} onClick={() => setTab("preview")}>Preview</button>
            <button style={seg(tab === "code")} onClick={() => setTab("code")}>Code</button>
          </div>
          <div style={{ flex: 1 }} />
          <button className="cmnd-sb-ib" onClick={rerun} title="Re-run"><IconRefresh /></button>
          <button className="cmnd-sb-ib" onClick={copy} title="Copy code"><IconCopy /></button>
          <button className="cmnd-sb-ib" onClick={download} title="Download"><IconDownload /></button>
          <button className="cmnd-sb-ib" onClick={onClose} title="Close"><IconClose /></button>
        </div>

        {/* mode selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px 8px", flexShrink: 0, overflowX: "auto" }}>
          {MODES.map((mm) => {
            const on = mode === mm.id;
            return <button key={mm.id} onClick={() => setMode(mm.id)} style={{ padding: "5px 11px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: FONT_CODE, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", background: on ? `${t.accent}24` : t.surfaceAlt, color: on ? t.accent : t.textMute }}>{mm.label}{mm.id === "auto" && on ? ` · ${resolvedMode}` : ""}</button>;
          })}
        </div>

        {/* body */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", background: t.bg }}>
          {tab === "code" ? (
            <textarea
              className="cmnd-sb-ta"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onCodeKey}
              spellCheck={false}
              placeholder="Paste or write a component, then switch to Preview…"
              style={{ width: "100%", height: "100%", resize: "none", border: "none", outline: "none", background: t.bg, color: t.text, fontFamily: FONT_CODE, fontSize: 16, lineHeight: 1.55, padding: 16, boxSizing: "border-box", whiteSpace: "pre", overflowWrap: "normal", overflow: "auto" }}
            />
          ) : (
            <>
              <iframe
                ref={iframeRef}
                key={runId}
                title="sandbox-preview"
                sandbox="allow-scripts"
                srcDoc={srcDoc}
                style={{ width: "100%", height: "100%", border: "none", background: t.bg, display: "block" }}
              />
              {error && (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "60%", overflow: "auto", background: t.surface, borderTop: `2px solid ${t.danger}`, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: FONT_CODE, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: t.danger }}>{error.phase} error</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={clearError} style={{ border: "none", background: "transparent", color: t.textDim, cursor: "pointer", fontFamily: FONT_CODE, fontSize: 12 }}>dismiss</button>
                  </div>
                  <div style={{ fontFamily: FONT_CODE, fontSize: 13, color: t.text, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error.message}</div>
                  {error.stack && <pre style={{ marginTop: 8, fontFamily: FONT_CODE, fontSize: 11, color: t.textMute, whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto" }}>{error.stack}</pre>}
                </div>
              )}
            </>
          )}
        </div>

        {/* console drawer */}
        <div style={{ flexShrink: 0, background: t.surfaceAlt }}>
          <button onClick={() => setShowConsole((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", color: t.textDim, fontFamily: FONT_CODE, fontSize: 11 }}>
            <IconTerminal size={15} /> Console{logs.length ? ` · ${logs.length}` : ""}
            <div style={{ flex: 1 }} />
            {logs.length > 0 && <span onClick={(e) => { e.stopPropagation(); clearLogs(); }} style={{ color: t.textMute }}>clear</span>}
            <span style={{ transform: showConsole ? "rotate(180deg)" : "none", transition: "transform .18s" }}>▾</span>
          </button>
          {showConsole && (
            <div style={{ maxHeight: 160, overflow: "auto", padding: "0 14px 10px" }}>
              {logs.length === 0
                ? <div style={{ fontFamily: FONT_CODE, fontSize: 12, color: t.textMute, padding: "4px 0" }}>No output yet.</div>
                : logs.map((l, i) => <div key={i} style={{ fontFamily: FONT_CODE, fontSize: 12, padding: "3px 0", color: l.level === "error" ? t.danger : l.level === "warn" ? "#FFD740" : t.textDim, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{l.text}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
