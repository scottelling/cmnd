# Project Edit

The empire cockpit. Every project, every connection, every flywheel from one timeline.

---

## Run it locally (3 commands)

You need Node 18+ installed. If you have it, this works:

```bash
npm install
npm run dev
```

That's it. Open the URL it prints (usually `http://localhost:5173`).

---

## Ship it to Vercel + a subdomain (one-time, ~5 min)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Project Edit v0.5"
git branch -M main
git remote add origin https://github.com/scottelling/project-edit.git
git push -u origin main
```

Replace the remote URL with your real repo. Create the empty repo on GitHub first if needed.

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Pick the `project-edit` repo
3. Vercel auto-detects Vite. Click **Deploy**.
4. Wait ~30 seconds. You get a `project-edit-xxx.vercel.app` URL.

### 3. Alias to a subdomain

In Vercel's project settings → **Domains**:

1. Click **Add**
2. Type `edit.scottelling.com` (or whatever subdomain you want)
3. Vercel tells you the DNS record to add
4. Add it in your domain registrar (Cloudflare, Namecheap, wherever scottelling.com lives)
5. Wait for SSL (usually a minute)

Done. `edit.scottelling.com` now points at the live app.

---

## After that: Claude Code takes over

Open the project in Claude Code:

```bash
cd ~/Projects/project-edit
claude
```

Then read `CLAUDE.md` — it briefs Claude Code on what's here, what's mocked, and what to build next.

---

## Project shape

```
project-edit/
├── index.html              ← HTML entry, dark theme baked in
├── package.json
├── vite.config.js
├── vercel.json             ← framework hint
├── CLAUDE.md               ← briefing for Claude Code
├── README.md               ← you are here
└── src/
    ├── main.jsx            ← React mount point
    ├── App.jsx             ← thin wrapper
    └── ProjectEdit.jsx     ← THE app (4,000 lines, single file)
```

The single-file component is intentional for now — easier to copy, paste, and iterate with Claude. Splitting into modules is a planned future refactor.

---

## Tech

- **Vite 5** — instant dev server, fast builds
- **React 18** — strict mode on
- **lucide-react** — icons
- **inline styles + design tokens** — no Tailwind, no CSS files; the `T` object in `ProjectEdit.jsx` is the source of truth
- **localStorage** — data persists in the browser. No backend yet.

---

## What's working

- Timeline / Feed / Dailies / Vision views
- 22 seed projects across 8 domains
- Score breakdowns, compound ties, milestones, flywheels
- JSON import / export / template
- Image uploads (stored as data URLs)
- Filters, search, sort
- Mocked deploy flow

## What's mocked (real next step)

- The Deploy button simulates the GitHub → Vercel → subdomain flow with logs. To make it real, add a server function (Vercel Function or Cloudflare Worker) that:
  1. Reads a project's `githubUrl`
  2. Triggers Vercel's deploy API with your token
  3. Aliases to `{projectId}.scottelling.com`

That's the only piece blocking real one-click deploy.

---

## Storage caveat

localStorage caps around 5MB per origin. A handful of full-resolution screenshots will hit that. Move image storage to S3 / Vercel Blob / Supabase Storage when you outgrow it.

---

v0.5 · May 2026
