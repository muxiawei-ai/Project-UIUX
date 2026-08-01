# React Bits Curated Effects

Vite + React 19 + TypeScript. A single-page lab for browsing curated ReactBits effects:
sidebar catalog on the left, live preview stage plus usage snippet on the right.

## Layout

- `src/effects/catalog.tsx` — the effect registry (metadata + which adapter renders it)
- `src/effects/snippets.ts` — the copy-paste usage snippet per effect
- `src/reactbits/adapters/` — one demo component per effect
- `src/pages/EffectLab.tsx` — the shell (search, category tabs, stage, detail cards)
- `src/styles/global.css` — all styling. No CSS modules, no utility framework.

Adding an effect means: an adapter, a catalog entry, a snippet, and any styles it needs
in `global.css`.

## Styling

**Read `DESIGN.md` before changing anything visual.** Colors come from Radix Colors
12-step scales through semantic tokens — never write a raw hex or `rgba()` in
`global.css`. `<html>` carries `class="dark"`; Radix scopes its dark scales to `.dark`.

Two skills in `.claude/skills/` back this up (vendored from
[taste-skill](https://github.com/Leonxlnx/taste-skill), MIT — see `.claude/skills/NOTICE`):

- `design-taste-frontend` — anti-slop design rules. Written for landing pages and
  portfolios; this is a tool UI, so `DESIGN.md` §0 overrides its default dials.
- `redesign-existing-projects` — audit-first upgrades to existing code.

## Commands

```
npm run dev     # vite, bound to 127.0.0.1
npm run build   # tsc -b && vite build
npm test        # vitest run
```

`src/styles/global.test.js` asserts on the `.border-glow-card` CSS as text — it reads the
stylesheet with `readFileSync` and matches rule bodies, so reformatting those rules breaks
the test even when the CSS is still valid.
