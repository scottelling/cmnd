# CMND

A unified personal workspace — **Second Brain** (infinite-nesting outliner),
**Chat** (multi-thread AI with inline artifacts), and a **Daily Calendar** — in a
scroll-snapped panel row with a cross-panel bridge. Mobile-first, "Purple Rain"
design language, inline-styled with a JS token object (no Tailwind in the app shell).

Live: **https://cmnd.scottelling.com**

## Stack

- **Vite + React** (JSX)
- **Supabase** — auth + persistence (KV `workspace_state` table; local-first today)
- **Vercel** — static hosting + `/api/chat` serverless Anthropic proxy
- **Live Sandbox** — isolated iframe preview of AI-generated code (`src/sandbox/`)

## Project layout

```
api/chat.js              Serverless Anthropic proxy (holds ANTHROPIC_API_KEY)
supabase/migrations/     workspace_state table + RLS
src/
  app/App.jsx            Root: lifted state, persistence, panel row, the bridge
  design/tokens.js       Purple Rain tokens, fonts, model ids, CHAT_SYSTEM
  lib/                   tree.js, artifacts.js, time.js  (load-bearing logic)
  storage/               local-first KV backend, Supabase-ready
  secondbrain/           OutlineView + SelectionBar
  chat/                  ChatView + artifacts/ (Table, Code, Decision, Task, Card)
  calendar/CalendarPanel.jsx
  panels/                Panel shell + in-panel rail
  ui/                    IconBtn, Dot, SaveSheet
  sandbox/               Live Sandbox (drop-in)
```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)

# Chat needs the serverless proxy. Run both:
vercel dev                   # serves /api/chat on :3000
npm run dev                  # Vite on :5173, proxies /api/* -> :3000
```

The app runs **local-first**: without any env vars it persists to `localStorage`
and chat is the only feature that needs the proxy.

## Environment

| Var | Where | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | server only | Held by `/api/chat`. No `VITE_` prefix. |
| `VITE_SUPABASE_URL` | client-safe | Optional today (local-first). |
| `VITE_SUPABASE_ANON_KEY` | client-safe | Optional today. |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Only if a function needs elevated writes. |

## Deploy

Vercel auto-detects the Vite preset (build `vite build`, output `dist`) and deploys
`api/` as serverless functions. Set the env vars in the Vercel project (Production +
Preview) and redeploy.
