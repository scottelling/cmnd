# CLAUDE.md — Project Edit

Briefing for Claude Code. Read this first, then operate.

---

## What this is

Project Edit is Scott's cockpit for an empire of AI-powered tools. Every project, every connection, every flywheel — one timeline, one search, one feed. Built mobile-first, dark by default, no framework heavier than React + Vite.

**The apps are never the point.** Outcomes are. Project Edit's outcome: Scott can see, score, tie, and ship every project in his portfolio from one place.

---

## How Scott works

- **Non-technical.** Plain English, no jargon. Show the action, not the explanation.
- **Build-first.** Ship the change, then describe it inline. No preamble.
- **Mobile-first.** Always. 44px touch targets, dark mode, thumb-zone primary actions.
- **Outcome-first framing.** Describe what the user can now DO, not what the code is.
- **Don't claim something is shipped until it actually ships.** No "I've added X" if X isn't in the file.

---

## Stack

- **Vite 5** + **React 18** + **lucide-react** icons
- **Inline styles only.** No Tailwind, no CSS modules, no styled-components.
- **Design tokens live in `T` object** at the top of `src/ProjectEdit.jsx`. Source of truth for every color, every surface, every text shade.
- **localStorage** for persistence. Key: `project-edit-v5`. Legacy keys auto-migrated.

---

## File shape

```
src/ProjectEdit.jsx    ← THE app. 4,000 lines. Single file by design.
src/App.jsx            ← thin wrapper, do not bloat
src/main.jsx           ← React mount
```

The single-file design is intentional for fast iteration with Claude. **Don't split it without asking Scott first.** When the time comes, the natural seams are: Tokens & helpers → Primitives → Views → Modals → Root.

---

## Design tokens (the T object)

```js
T.bg          // #0A0B0F   page background
T.surface     // #13141A   cards, sheets
T.surfaceHi   // #1C1D26   hover, active surface
T.surfaceHi2  // #22232C   pressed
T.border      // #272832   prominent borders
T.borderDim   // #1A1B22   subtle borders
T.borderHair  // #15161D   hairlines
T.text        // #FFFFFF   primary text
T.textMid     // #C5C6CE   secondary text
T.textDim     // #7A7B83   tertiary text
T.textFaint   // #4D4E55   quaternary text

// Domain accent colors (each pillar has one)
T.health, T.self, T.wealth, T.creative,
T.knowledge, T.infra, T.network, T.business

// Status
T.done, T.progress, T.danger

// Priority
T.pCritical, T.pHigh, T.pNormal, T.pLow

// Deploy
T.deployLive, T.deployPending, T.deployFailed, T.deployNone
```

**Never introduce a new color literal.** If T doesn't have it, add it to T first.

---

## Data model

Everything lives in one `data` object, persisted to localStorage:

```
data.domains[]         ← 8 pillars (health, self, wealth, creative, knowledge, infra, network, business)
data.tracks[]          ← sub-lanes within domains
data.projects[]        ← the meat. See PROJECT_DEFAULTS for shape.
data.milestones[]      ← discrete wins per domain
data.keystoneSkills[]  ← skills projects develop
data.builds[]          ← larger systems projects contribute to
data.flywheels[]       ← compounding loops
data.workBlocks[]      ← daily time blocks
data.deployConfig      ← rootDomain, githubOrg, vercelTeam, defaultBranch, autoDeploy
data.vision.global     ← the north star sentence
```

Every project has: `id, domainId, trackId, name, type, status, startDate, endDate, progress, scores, keystoneSkills[], builds[], flywheelStage, chatUrl, description, tags[], priority, images[], techStack[], liveUrl, githubUrl, deployStatus`.

---

## Conventions

- **One return per component.** No early returns for visual variants — branch inside the JSX.
- **Props destructured at the signature.** Defaults inline. No prop drilling more than 2 levels — if it goes deeper, lift state.
- **Mobile breakpoint: 768.** Tablet: 768–1200. `isMobile` and `isTablet` come from `ProjectEdit`'s root state.
- **44px minimum touch target.** Stepper, IconBtn, Chip — all already comply. Keep new ones consistent.
- **Bottom-sheets on mobile, centered modals on desktop.** Pattern repeated across ProjectSheet, AddProjectSheet, SettingsModal, DeployModal.
- **Right-rail context-aware.** It changes contents based on `view` and `selectedDomain`.
- **Inline styles ONLY.** Yes really. No exceptions without asking.

---

## What's mocked (the obvious next builds)

### 1. Real deploy pipeline
`DeployModal` simulates 5 stages with fake logs. To make real:
- Add a Vercel Function at `/api/deploy.js`
- It receives `{ projectId, repo, branch }`, calls Vercel's deploy API with `VERCEL_TOKEN`
- Aliases the deployment to `{projectId}.scottelling.com`
- Streams real logs back via SSE or polling
- Updates `project.deployStatus` to `live` on success

### 2. Image storage beyond localStorage
Currently base64-in-localStorage. Caps at ~5MB total. Swap to:
- Vercel Blob (simplest), or
- Supabase Storage (free tier generous), or
- Cloudinary (best for image transforms)

Store URL strings in `project.images[].url` instead of `dataUrl`.

### 3. Real auth + multi-device sync
Right now data is browser-local. Next step: Supabase auth + Postgres for the data object. Keep the localStorage path as offline cache.

### 4. Search across past Claude conversations
Each project has a `chatUrl`. Future: pull conversation titles and surface them in the project sheet. Requires Anthropic API.

---

## Known sharp edges

- **Single file is unwieldy at 4k lines.** Don't split without asking, but keep new components co-located with their usage.
- **localStorage write happens on every state change.** Fine for prototype. If perf degrades, debounce.
- **`<img>` for images, no lazy loading.** Fine until there are 50+ projects with multiple images each.
- **No undo/redo.** Saves are immediate. Reset wipes everything (with confirmation).

---

## When you make changes

1. **Read the section you're editing first.** Scott's design system is consistent — match it.
2. **Test mobile + desktop.** Use Chrome DevTools device toolbar.
3. **Use only T tokens for color.** If you need a new shade, add it to T.
4. **Match the existing pattern.** If three modals already exist, the fourth should look like them.
5. **Tell Scott what changed in plain English.** Lead with outcomes ("you can now…"), not mechanisms ("I refactored…").

---

## Glossary (Scott's taxonomy — respect it)

- **Engine** — you run it. (Oracle, Genome, MindScript)
- **OS** — you live in it. (Eagle Eye / Legend)
- **Framework** — you build with it. (Project Edit itself)
- **App** — a user-facing product. (Peptide Companion)
- **Tool** — a single-purpose utility. (Constellation Map)
- **Skill** — a capability codified into a file or process.
- **Content** — output from a Genome-style generator.
- **Game** — interactive, replayable, score-based.

Don't blur these.

---

v0.5 · May 2026
