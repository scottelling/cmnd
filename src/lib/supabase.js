// Supabase client. Created only when the client-safe env vars are present, so the
// app runs locally (localStorage-only) with no Supabase project configured yet.
//
// Auth is deferred for now (the app is local-first). When sign-in lands, this same
// client powers both auth and the workspace_state KV sync — see src/storage/index.js.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
