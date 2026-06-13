// Persistence layer — the surface the app already calls (loadKey + useDebouncedSave),
// backed by a swappable key/value backend.
//
// Active backend: localStorage (local-first, no login required). This preserves the
// prototype's instant, offline feel exactly.
//
// Ready-to-activate backend: Supabase KV over a per-user `workspace_state` table
// (user_id uuid, key text, value jsonb, updated_at; PK (user_id,key); RLS so a user
// only sees their own rows). Auth is deferred, so this stays dormant until sign-in
// is wired — at which point call setBackend(makeSupabaseBackend(supabase, userId))
// after a one-time migrate-up from local, and the nine cmnd2-* keys sync across
// devices with no change to the call sites.
//
// Every backend deals in the same shape the artifact `window.storage` used:
//   get(key)        -> { value: <stringified JSON> } | null
//   set(key, value) -> void        (value is already JSON.stringify'd by the caller)
import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";

export const PREFIX = "cmnd2";
export const SK = (k) => `${PREFIX}-${k}`;

/* ── localStorage backend (active) ── */
const localBackend = {
  async get(key) {
    try { const v = localStorage.getItem(key); return v === null ? null : { value: v }; }
    catch (e) { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* quota / private mode — best-effort */ }
  },
};

/* ── Supabase KV backend (dormant until auth lands) ──
   Stores the already-stringified value into a jsonb column and returns it back in
   the same { value } envelope, so the two backends are symmetrical. */
export const makeSupabaseBackend = (client, userId) => ({
  async get(key) {
    try {
      const { data, error } = await client
        .from("workspace_state").select("value").eq("user_id", userId).eq("key", key).maybeSingle();
      if (error || !data) return null;
      return { value: data.value };
    } catch (e) { return null; }
  },
  async set(key, value) {
    try {
      await client.from("workspace_state")
        .upsert({ user_id: userId, key, value, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
    } catch (e) { /* best-effort */ }
  },
});

let backend = localBackend;
export const setBackend = (b) => { backend = b || localBackend; };
export const getBackend = () => backend;

// Exposed so a future sign-in flow can activate the Supabase backend; referenced
// here to keep the import meaningful and documented.
export const hasSupabase = () => Boolean(supabase);

export const loadKey = async (key, fallback) => {
  try { const r = await backend.get(key); if (r && r.value != null) return JSON.parse(r.value); }
  catch (e) { /* missing / malformed */ }
  return fallback;
};

export const useDebouncedSave = (key, data, ready, delay = 600) => {
  const timer = useRef(null);
  useEffect(() => {
    if (!ready) return undefined;
    timer.current = setTimeout(async () => {
      try { await backend.set(key, JSON.stringify(data)); } catch (e) { /* best-effort */ }
    }, delay);
    return () => clearTimeout(timer.current);
  }, [key, data, ready, delay]);
};
