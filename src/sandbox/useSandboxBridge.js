import { useEffect, useRef, useState, useCallback } from "react";

// Wires the parent side of the sandbox bridge to one iframe.
//
//   const { error, clearError, logs, clearLogs, ready } = useSandboxBridge(iframeRef, storage, runId);
//
// - storage: an async adapter { get, set, delete, list } (see defaultStorage.js).
//   Storage requests from inside the iframe are proxied here and answered back.
// - runId: bump it whenever you reload the iframe so error/log state resets.
// Messages are validated by event.source identity (the iframe runs cross-origin
// with an opaque "null" origin, so origin checks are not usable here).

export function useSandboxBridge(iframeRef, storage, runId) {
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [ready, setReady] = useState(false);
  const storageRef = useRef(storage);
  storageRef.current = storage;

  const clearError = useCallback(() => setError(null), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  // reset transient state on each run
  useEffect(() => { setError(null); setLogs([]); setReady(false); }, [runId]);

  useEffect(() => {
    const onMessage = async (event) => {
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return; // identity check, not origin
      const d = event.data;
      if (!d || typeof d !== "object") return;

      if (d.type === "sandbox-ready") { setReady(true); return; }

      if (d.type === "sandbox-error") {
        setError({ phase: d.phase || "runtime", message: d.message || "Unknown error", stack: d.stack || "" });
        return;
      }

      if (d.type === "sandbox-console") {
        setLogs((prev) => [...prev.slice(-199), { level: d.level || "log", text: d.text || "", at: Date.now() }]);
        return;
      }

      if (d.type === "storage-req") {
        const store = storageRef.current;
        const reply = (result, err) => {
          try { iframe.contentWindow.postMessage({ type: "storage-res", id: d.id, result, error: err }, "*"); } catch (e) { /* iframe gone */ }
        };
        if (!store || typeof store[d.op] !== "function") { reply(null, `storage.${d.op} is not available`); return; }
        try {
          const result = await store[d.op](d.key, d.op === "set" ? d.value : d.shared, d.op === "set" ? d.shared : undefined);
          reply(result, null);
        } catch (e) {
          reply(null, (e && e.message) || String(e));
        }
        return;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeRef]);

  return { error, clearError, logs, clearLogs, ready };
}

export default useSandboxBridge;
