// Default persistence adapter for the sandbox storage bridge.
//
// The shapes returned here mirror Claude's artifact `window.storage` exactly, so
// AI-generated code that targets that API behaves identically when run in CMND:
//   get(key)        -> { key, value, shared } | null
//   set(key, value) -> { key, value, shared }
//   delete(key)     -> { key, deleted: true, shared }
//   list(prefix)    -> { keys: string[], prefix, shared }
//
// Swap this out for your real backend (Supabase, etc.) by passing a `storage`
// prop to <LiveSandbox/> with the same four async methods.

const NS = "cmnd-sandbox:";
const scope = (shared) => NS + (shared ? "shared:" : "user:");

export const makeLocalStorageAdapter = (namespace = NS) => {
  const pre = (shared) => namespace + (shared ? "shared:" : "user:");
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };

  return {
    async get(key, shared = false) {
      const raw = safe(() => localStorage.getItem(pre(shared) + key), null);
      return raw === null ? null : { key, value: raw, shared };
    },
    async set(key, value, shared = false) {
      safe(() => localStorage.setItem(pre(shared) + key, String(value)), null);
      return { key, value: String(value), shared };
    },
    async delete(key, shared = false) {
      safe(() => localStorage.removeItem(pre(shared) + key), null);
      return { key, deleted: true, shared };
    },
    async list(prefix = "", shared = false) {
      const full = pre(shared) + prefix;
      const keys = safe(() => {
        const out = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(full)) out.push(k.slice(pre(shared).length));
        }
        return out;
      }, []);
      return { keys, prefix, shared };
    },
  };
};

// An in-memory adapter (handy for tests or ephemeral previews).
export const makeMemoryAdapter = () => {
  const mem = new Map();
  const k = (key, shared) => scope(shared) + key;
  return {
    async get(key, shared = false) { return mem.has(k(key, shared)) ? { key, value: mem.get(k(key, shared)), shared } : null; },
    async set(key, value, shared = false) { mem.set(k(key, shared), String(value)); return { key, value: String(value), shared }; },
    async delete(key, shared = false) { mem.delete(k(key, shared)); return { key, deleted: true, shared }; },
    async list(prefix = "", shared = false) {
      const p = scope(shared) + prefix; const keys = [];
      for (const key of mem.keys()) if (key.startsWith(p)) keys.push(key.slice(scope(shared).length));
      return { keys, prefix, shared };
    },
  };
};

export const defaultStorage = makeLocalStorageAdapter();
