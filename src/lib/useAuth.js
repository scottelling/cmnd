// Auth + sync wiring. Local-first: when Supabase isn't configured (no env vars),
// this is inert and the app stays on localStorage exactly as before. When it is
// configured, magic-link sign-in activates the per-user Supabase backend (with a
// one-time local→cloud seed) so the workspace syncs across devices.
import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigured } from "./supabase.js";
import { activateSupabaseBackend, resetToLocalBackend } from "../storage/index.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    let active = true;
    const apply = async (session) => {
      const u = session?.user ?? null;
      try {
        if (u) await activateSupabaseBackend(u.id);
        else resetToLocalBackend();
      } catch (e) { /* keep app usable on local */ }
      if (active) { setUser(u); setAuthReady(true); }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session)).catch(() => active && setAuthReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email) => {
    if (!supabaseConfigured || !email) return;
    setSending(true); setSent(false); setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
      });
      if (err) setError(err.message || "Could not send the link.");
      else setSent(true);
    } catch (e) {
      setError("Could not send the link.");
    }
    setSending(false);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabaseConfigured) return;
    try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
  }, []);

  return { configured: supabaseConfigured, user, authReady, signIn, signOut, sending, sent, setSent, error };
}
