# React Bits Curated Effects Design

Date: 2026-07-07

## Goal

Build a lightweight internal React effects toolbox based on selected React Bits components. The first version combines:

- An in-project component toolbox for direct use in pages.
- A local preview and selection experience for exploring effects before adopting them.

The work is an exploration prototype, not a public component library. React Bits uses an MIT + Commons Clause license, so the implementation must keep the components for project/application use and must not repackage, sell, sublicense, or redistribute the components as a standalone bundle.

## Context

The current workspace has no existing application source, package manifest, or git repository. The first deliverable should therefore be a standalone Vite React prototype that can later be migrated into a real product codebase.

React Bits provides copy-ready React components and supports shadcn/jsrepo installation flows. The project exposes component variants such as JS/CSS, JS/Tailwind, TS/CSS, and TS/Tailwind. The prototype should prefer TypeScript + CSS modules or plain CSS files to keep dependencies and styling explicit.

References:

- https://reactbits.dev/
- https://github.com/DavidHDev/react-bits
- https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

## Recommended Approach

Use a "Lean Explorer" architecture:

- Create a Vite + React + TypeScript app in this workspace.
- Add a curated catalog of selected effects.
- Implement a preview page as the first screen.
- Wrap each selected effect behind a small local adapter.
- Track usage snippets, dependencies, category, and practical notes in a typed catalog.

This is faster and more useful than starting with an installer script, because the first need is judging which effects feel useful. It also avoids the cost and risk of mirroring the entire React Bits library.

## First Curated Pack

Text effects:

- BlurText
- SplitText
- CountUp

Interaction effects:

- FadeContent
- Magnet
- ClickSpark

UI components:

- SpotlightCard
- AnimatedList
- Dock
- Border Glow
- Stepper
- Flowing Menu

Background effects:

- Aurora
- DotGrid
- Threads

These fifteen effects cover hero text, metric displays, card emphasis, micro-interactions, lists, navigation, workflow steps, menus, and atmospheric backgrounds. If a selected component turns out to require heavy 3D or runtime dependencies, it can be replaced by the closest lighter React Bits option during implementation while preserving the same category balance.

## Application Structure

Target structure:

```text
src/
  App.tsx
  main.tsx
  styles/
    global.css
  effects/
    catalog.ts
    types.ts
    snippets.ts
  pages/
    EffectLab.tsx
  reactbits/
    adapters/
      BlurTextDemo.tsx
      SplitTextDemo.tsx
      CountUpDemo.tsx
      FadeContentDemo.tsx
      MagnetDemo.tsx
      ClickSparkDemo.tsx
      SpotlightCardDemo.tsx
      AnimatedListDemo.tsx
      DockDemo.tsx
      BorderGlowDemo.tsx
      StepperDemo.tsx
      FlowingMenuDemo.tsx
      AuroraDemo.tsx
      DotGridDemo.tsx
      ThreadsDemo.tsx
```

The adapters provide stable demo-facing props and isolate raw React Bits component details. This keeps the preview page simple and gives future product pages a clean integration point.

## Preview Experience

The app opens directly into `EffectLab`.

The preview page includes:

- Category tabs or segmented controls for Text, Interaction, UI, and Background.
- A searchable list of selected effects.
- A main preview area with the currently selected effect.
- A compact detail panel with use case, dependency notes, and a copyable usage snippet.
- A reset button for effects that have hover, click, cursor, or timed animations.

The page should feel like a working tool rather than a marketing page. The layout should be dense enough for scanning, with restrained styling and clear hierarchy.

## Data Model

Each catalog item should include:

- `id`: stable identifier.
- `name`: display name.
- `category`: text, interaction, ui, or background.
- `summary`: short practical description.
- `bestFor`: concrete use cases.
- `dependencies`: required packages beyond React.
- `component`: demo adapter reference.
- `snippet`: copyable usage example.
- `sourceUrl`: React Bits source or docs URL.
- `motionIntensity`: low, medium, or high.

This catalog is the source of truth for navigation, preview metadata, and usage examples.

## Accessibility And Motion

The preview app must respect `prefers-reduced-motion`.

Behavior:

- If reduced motion is enabled, timed animations should pause, reduce distance, or use static fallbacks where reasonable.
- Interactive effects should remain usable with keyboard and pointer input.
- Preview controls must be reachable by keyboard.
- Text must not overlap or overflow in mobile or desktop viewports.

## Error Handling

Each effect preview should render inside a lightweight error boundary. If an effect fails, the page should keep working and show a concise fallback message for that item.

For effects with browser-only APIs, adapters should guard against missing APIs. If SSR is later introduced, browser-only effects should be dynamically loaded or wrapped so they do not execute during server render.

## Dependencies

Start with the smallest dependency set needed for the curated pack.

Expected baseline:

- React
- React DOM
- Vite
- TypeScript
- lucide-react for UI icons if needed

Potential effect dependencies:

- motion or framer-style animation package if required by selected React Bits components
- gsap only for components that explicitly require it
- three/react-three only if a chosen background requires it and is worth the cost

Implementation should avoid installing large dependencies for one low-priority preview if a lighter selected component can serve the same purpose.

## Testing And Verification

Verification should include:

- Install/build check for the Vite app.
- TypeScript check.
- Browser smoke test of the preview page.
- Desktop and mobile visual inspection.
- Reduced-motion behavior check.

If full browser automation is available, use it to verify the page renders without blank previews or overlapping controls.

## Out Of Scope For Version 1

- Full React Bits library mirroring.
- Publishing a package.
- A public marketplace or downloadable redistributed bundle.
- A generic installer CLI.
- Persistence, accounts, or backend services.

## Implementation Defaults

Use these defaults unless implementation discovers a concrete blocker:

- Scaffold the Vite app at the workspace root.
- Use React + TypeScript.
- Prefer React Bits TS/CSS variants for copied component source.
- Keep React Bits-derived code inside `src/reactbits/` and local preview glue inside `src/effects/` and `src/pages/`.
- Replace a selected effect only when the original requires a large dependency that does not justify its value in the first curated pack.

Given the empty workspace, root-level Vite app scaffolding is the simplest default.
