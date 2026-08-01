# React Bits Effects Lab — Quiet Chrome, Loud Stage

Reference DESIGN.md for this repo. Format follows the `awesome-claude-design` convention;
the content is specific to this project. Agents: read this before touching any styling.

## 0. Design Read

**Tool UI for developers evaluating and copying effect snippets.** Not a landing page,
not a portfolio, not marketing.

The single constraint everything else follows from: **the effects are the content, the
UI is the frame.** Every visual decision in the chrome — sidebar, list, cards, toolbar —
exists to be ignored. If a reviewer notices the chrome before the effect, the chrome is
wrong. This inverts the usual "make it pop" instinct, and it is the one rule to break
last.

Consequence: the three dials from `.claude/skills/design-taste-frontend` are **split**,
not global.

| Surface | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY |
|---|---|---|---|
| Chrome (sidebar, toolbar, cards) | **3** — predictable, symmetric | **2** — hover/active only | **6** — list-dense |
| Stage (`.preview-stage` contents) | — governed by the effect | **10** — whatever the effect needs | **2** — one effect, centered |

An agent that applies landing-page dials (8/6/4) to the chrome is misreading the brief.

## 1. Visual Theme & Atmosphere

Dark, cool, near-neutral. Sage-tinted grays under a mint accent — a lab bench, not a
showroom. Ink is quiet; the only saturated thing on screen should be the effect running
in the stage.

Mood: precise, unhurried, slightly clinical.

## 2. Color Palette & Roles

Colors come from [Radix Colors](https://github.com/radix-ui/colors) 12-step dark scales,
imported in `src/styles/global.css`. `sage` is the gray Radix pairs with `mint`.
**`<html>` carries `class="dark"`** — Radix scopes its dark scales to `.dark`.

Never write a hex in this project. Map a semantic token onto a step instead:

```
--page:                 var(--sage-1)     /* app background        */
--sidebar:              var(--sage-2)     /* subtle background     */
--surface:              var(--sage-3)     /* UI element background */
--surface-strong:       var(--sage-4)     /* hovered UI element    */
--surface-translucent:  var(--sage-a3)    /* fills over the stage  */
--line:                 var(--sage-6)     /* subtle border         */
--muted:                var(--sage-11)    /* low-contrast text     */
--text:                 var(--sage-12)    /* high-contrast text    */
--accent:               var(--mint-9)     /* solid fill            */
--accent-text:          var(--mint-11)    /* accent as TEXT        */
--accent-contrast:      var(--mint-1)     /* ink ON an accent fill */
--accent-2:             var(--blue-11)    /* decorative only       */
--warning:              var(--amber-9)
```

**The step number carries the meaning.** Learn these four and the rest follows:

- **9** — solid fill. Bright. `mint-9` needs dark ink on top (`--accent-contrast`).
- **11** — accent or gray used as *text*. Guaranteed readable on steps 1–3.
- **12** — high-contrast text.
- **6 / 7** — subtle border / element border.

Two rules:

1. **Accent as fill uses step 9; accent as text uses step 11.** Painting `--accent` onto
   text is the most common way to break this system.
2. **Decorative tints derive from the token, not a frozen rgba.**
   `color-mix(in srgb, var(--accent) 14%, transparent)`, never `rgba(110, 231, 200, 0.14)`.
   Re-theming must be a one-line change.

## 3. Typography Rules

- **UI + body:** `Inter`, falling back to the system stack. Weights 400 / 700 / 800.
- **Eyebrow labels:** 0.78rem, weight 700, uppercase, `--accent-text`.
- **Body / meta:** 0.84–0.95rem, `--muted`, line-height 1.35–1.5.
- **Stage display type:** `clamp()` against viewport width — `clamp(2.2rem, 7vw, 5.8rem)`
  for hero lines, `clamp(3rem, 9vw, 7rem)` for numerals. Weight 800, line-height ≤ 1.
- **Code:** browser monospace, 0.85rem, line-height 1.5, `--text`.

Display type belongs to the stage. Chrome text never exceeds 1.4rem.

## 4. Component Stylings

**Buttons (chrome)** — 1px `--line`, `--surface` fill, `--text` ink, radius 8, min-height 38.
Selected: border `--accent`, fill `color-mix(in srgb, var(--accent) 14%, var(--surface))`.

**Buttons (stage demos)** — `--accent` fill, `--accent-contrast` ink, radius 999, weight 800.
Pills are for demo affordances only; chrome never uses them.

**Cards** — 1px `--line`, `--surface` fill, radius 8, padding 16. No shadow, no hover lift.

**Inputs** — 1px `--line`, `--surface`, radius 8, min-height 42, `--muted` placeholder.

**Focus** — `2px solid var(--accent)`, offset 2. Never removed, never dimmed.

**Stage** — 1px `--line`, radius 8, min-height 360, flat `--page` fill. A **recessed
well**: darker than the cards around it, and completely untinted. Verified against
`Aurora` and `SpotlightCard` — on `--surface` the translucent demo cards stop separating
from the ground, and any hue in the stage desaturates whatever effect is running on top
of it. The stage contributes no color of its own.

## 5. Layout Principles

- App shell: CSS grid, `minmax(280px, 360px)` sidebar + `minmax(0, 1fr)` stage. Full-bleed,
  no max-width — the stage wants room.
- Base unit 2px, used as 4 / 8 / 10 / 12 / 14 / 18 / 24 / 26.
- Radius: **8 everywhere**, 999 for demo pills, 50% for circular controls. No other values.
- Panel padding 24. Card padding 16–26.

## 6. Depth & Elevation

Border + one tonal step. That is the whole system.

No card shadows, no glows, no glassmorphism in the chrome. The `BorderGlow` effect is the
exception and owns its own shadow stack — it is *content*, not chrome.

## 7. Do's and Don'ts

**Do**
- Map a new color to a Radix step and add a semantic token for it.
- Derive tints with `color-mix` from an existing token.
- Keep new chrome at MOTION_INTENSITY 2 — hover and active states, nothing automatic.
- Honor `prefers-reduced-motion`; the global block in `global.css` already flattens
  animation and the three transform-hover demos.

**Don't**
- Write a raw hex or `rgba()` in `global.css`. (Vendored effects excepted — see §10.)
- Use `--accent` as a text color, or `--accent-text` as a fill.
- Add a shadow to a chrome element.
- Introduce a second accent hue. `--accent-2` is decorative gradient material only —
  it never carries meaning, never marks state.
- Add a radius value outside {8, 50%, 999}.
- Animate the chrome on load. Only the stage animates on its own.
- Put a hue in the stage background. It desaturates whatever effect is running on it.

## 8. Responsive Behavior

- Single breakpoint at **960px**: grid collapses to one column, sidebar border moves from
  right to bottom, `.detail-grid` goes single-column.
- `min-width: 320px` floor on body.
- Stage type is `clamp()`-driven, so it scales continuously without extra breakpoints.

## 9. Agent Prompt Guide

Bias: Radix sage + mint semantic tokens, 8px radius, 1px hairline borders, flat surfaces,
quiet chrome at motion level 2, display type reserved for the stage, `color-mix` for every
tint.

Reject: raw hex values, card shadows, gradient chrome, a second accent hue, pill-shaped
chrome buttons, load animations outside the stage, light-mode-only styling, `--accent`
as text.

## 10. Known Deviations

Recorded, not hidden. Fix or ratify deliberately.

1. **`.border-glow-card` keeps its vendored palette** (`#120f17`, `hsl()` mesh gradients,
   `--glow-color` stack). This is upstream ReactBits identity and `global.test.js` asserts
   on its structure. Leave it alone.
2. **Inter is the UI face.** `redesign-existing-projects` flags Inter as a generic default.
   Kept deliberately: the chrome is supposed to disappear, and a characterful face would
   pull attention off the stage.

**Resolved:** the stage previously carried a mint + blue radial tint, which violated §0.
Flattened to `--page` after rendering `Aurora` and `SpotlightCard` against three candidate
grounds — see §4.
