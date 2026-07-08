# React Bits Curated Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite React prototype that exposes a curated React Bits-inspired effects toolbox plus a local preview and selection page.

**Architecture:** The app is a root-level Vite React TypeScript project. Effect metadata lives in a typed catalog, local preview adapters live under `src/reactbits/adapters/`, and `EffectLab` renders navigation, previews, usage snippets, and dependency notes from the catalog.

**Tech Stack:** React 19, React DOM 19, Vite 5, TypeScript 5, Vitest, Testing Library, jsdom, lucide-react, CSS.

## Global Constraints

- The workspace currently has no existing application source, package manifest, or git repository.
- The first deliverable is a standalone Vite React prototype that can later be migrated into a real product codebase.
- The work is an exploration prototype, not a public component library.
- React Bits-derived code and references are for project/application use and must not be repackaged, sold, sublicensed, or redistributed as a standalone bundle.
- Keep React Bits-derived or React Bits-inspired code inside `src/reactbits/`.
- Keep local preview glue inside `src/effects/` and `src/pages/`.
- Use React + TypeScript.
- Prefer CSS files over Tailwind for this prototype to keep styling explicit.
- Respect `prefers-reduced-motion`.
- The first curated pack contains fifteen effects: BlurText, SplitText, CountUp, FadeContent, Magnet, ClickSpark, SpotlightCard, AnimatedList, Dock, Border Glow, Stepper, Flowing Menu, Aurora, DotGrid, Threads.
- The current workspace is not a git repository, so commit steps are skipped until git is initialized.

---

## File Structure

Create these files:

- `package.json`: npm scripts and dependency manifest.
- `index.html`: Vite entry HTML.
- `vite.config.ts`: Vite React and Vitest config.
- `tsconfig.json`: TypeScript project config.
- `src/vite-env.d.ts`: Vite type references.
- `src/main.tsx`: React root bootstrap.
- `src/App.tsx`: Routes directly to `EffectLab`.
- `src/styles/global.css`: App shell, preview, and effect styling.
- `src/effects/types.ts`: Shared catalog types.
- `src/effects/snippets.ts`: Copyable usage snippets.
- `src/effects/catalog.tsx`: Typed curated catalog with component references.
- `src/effects/catalog.test.ts`: Catalog integrity tests.
- `src/components/ErrorBoundary.tsx`: Preview error boundary.
- `src/components/CopyButton.tsx`: Snippet copy button with fallback behavior.
- `src/reactbits/PreviewPrimitives.tsx`: Lightweight effect primitives used by demo adapters.
- `src/reactbits/adapters/*.tsx`: One demo adapter per curated effect.
- `src/reactbits/adapters/index.ts`: Adapter barrel exports.
- `src/pages/EffectLab.tsx`: Main preview and selection UI.
- `src/pages/EffectLab.test.tsx`: Render and interaction tests.
- `src/test/setup.ts`: Testing Library setup.

---

### Task 1: Scaffold The Vite React App And Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test`, and a React app shell that renders `EffectLab`.
- Consumes: No prior task output.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "reactbits-curated-effects",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "lucide-react": "^0.542.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.3",
    "vite": "^5.3.4",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#111318" />
    <title>React Bits Curated Effects</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 5: Create the React bootstrap files**

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx`:

```tsx
import { EffectLab } from './pages/EffectLab';

export default function App() {
  return <EffectLab />;
}
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Create initial global CSS**

```css
:root {
  color: #f5f7fb;
  background: #111318;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --surface: #181b22;
  --surface-strong: #20242d;
  --line: #303541;
  --muted: #a8b0bf;
  --text: #f5f7fb;
  --accent: #6ee7c8;
  --accent-2: #8ab4ff;
  --warning: #ffd166;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

#root {
  min-height: 100vh;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 8: Run the initial build**

Run: `npm run build`

Expected: FAIL because `src/pages/EffectLab.tsx` does not exist yet. The exact TypeScript error should mention `Cannot find module './pages/EffectLab'`.

- [ ] **Step 9: Commit**

Run: `git rev-parse --is-inside-work-tree`

Expected in this workspace: `fatal: not a git repository (or any of the parent directories): .git`

Commit action: skipped because the current workspace is not a git repository.

---

### Task 2: Add The Typed Effects Catalog

**Files:**
- Create: `src/effects/types.ts`
- Create: `src/effects/snippets.ts`
- Create: `src/effects/catalog.tsx`
- Create: `src/effects/catalog.test.ts`

**Interfaces:**
- Consumes: Adapter names that Task 3 will provide from `src/reactbits/adapters`.
- Produces: `EffectCategory`, `MotionIntensity`, `EffectCatalogItem`, `categories`, and `effectCatalog`.

- [ ] **Step 1: Write failing catalog tests**

```ts
import { categories, effectCatalog } from './catalog';

describe('effect catalog', () => {
  it('contains the approved fifteen-effect curated pack', () => {
    expect(effectCatalog).toHaveLength(15);
    expect(effectCatalog.map(item => item.name)).toEqual([
      'BlurText',
      'SplitText',
      'CountUp',
      'FadeContent',
      'Magnet',
      'ClickSpark',
      'SpotlightCard',
      'AnimatedList',
      'Dock',
      'Border Glow',
      'Stepper',
      'Flowing Menu',
      'Aurora',
      'DotGrid',
      'Threads'
    ]);
  });

  it('keeps ids unique and source URLs on reactbits.dev', () => {
    const ids = new Set(effectCatalog.map(item => item.id));
    expect(ids.size).toBe(effectCatalog.length);
    for (const item of effectCatalog) {
      expect(item.sourceUrl.startsWith('https://reactbits.dev/')).toBe(true);
      expect(item.snippet).toContain(item.importName);
    }
  });

  it('covers every visible category', () => {
    expect(categories.map(category => category.id)).toEqual(['all', 'text', 'interaction', 'ui', 'background']);
    for (const category of ['text', 'interaction', 'ui', 'background']) {
      expect(effectCatalog.some(item => item.category === category)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/effects/catalog.test.ts`

Expected: FAIL because `src/effects/catalog.tsx` does not exist.

- [ ] **Step 3: Create `src/effects/types.ts`**

```ts
import type { ComponentType } from 'react';

export type EffectCategory = 'text' | 'interaction' | 'ui' | 'background';

export type MotionIntensity = 'low' | 'medium' | 'high';

export type EffectDemoProps = {
  resetKey: number;
};

export type EffectCatalogItem = {
  id: string;
  name: string;
  importName: string;
  category: EffectCategory;
  summary: string;
  bestFor: string[];
  dependencies: string[];
  component: ComponentType<EffectDemoProps>;
  snippet: string;
  sourceUrl: string;
  motionIntensity: MotionIntensity;
};

export type CategoryFilter = 'all' | EffectCategory;

export type CategoryOption = {
  id: CategoryFilter;
  label: string;
};
```

- [ ] **Step 4: Create `src/effects/snippets.ts`**

```ts
const snippet = (importName: string, children: string) => `import { ${importName} } from './reactbits/adapters';

export function Example() {
  return (
${children}
  );
}`;

export const snippets = {
  blurText: snippet('BlurTextDemo', '    <BlurTextDemo resetKey={0} />'),
  splitText: snippet('SplitTextDemo', '    <SplitTextDemo resetKey={0} />'),
  countUp: snippet('CountUpDemo', '    <CountUpDemo resetKey={0} />'),
  fadeContent: snippet('FadeContentDemo', '    <FadeContentDemo resetKey={0} />'),
  magnet: snippet('MagnetDemo', '    <MagnetDemo resetKey={0} />'),
  clickSpark: snippet('ClickSparkDemo', '    <ClickSparkDemo resetKey={0} />'),
  spotlightCard: snippet('SpotlightCardDemo', '    <SpotlightCardDemo resetKey={0} />'),
  animatedList: snippet('AnimatedListDemo', '    <AnimatedListDemo resetKey={0} />'),
  dock: snippet('DockDemo', '    <DockDemo resetKey={0} />'),
  borderGlow: snippet('BorderGlowDemo', '    <BorderGlowDemo resetKey={0} />'),
  stepper: snippet('StepperDemo', '    <StepperDemo resetKey={0} />'),
  flowingMenu: snippet('FlowingMenuDemo', '    <FlowingMenuDemo resetKey={0} />'),
  aurora: snippet('AuroraDemo', '    <AuroraDemo resetKey={0} />'),
  dotGrid: snippet('DotGridDemo', '    <DotGridDemo resetKey={0} />'),
  threads: snippet('ThreadsDemo', '    <ThreadsDemo resetKey={0} />')
} satisfies Record<string, string>;
```

- [ ] **Step 5: Create `src/effects/catalog.tsx`**

```tsx
import {
  AnimatedListDemo,
  AuroraDemo,
  BlurTextDemo,
  BorderGlowDemo,
  ClickSparkDemo,
  CountUpDemo,
  DockDemo,
  DotGridDemo,
  FadeContentDemo,
  FlowingMenuDemo,
  MagnetDemo,
  SplitTextDemo,
  SpotlightCardDemo,
  StepperDemo,
  ThreadsDemo
} from '../reactbits/adapters';
import { snippets } from './snippets';
import type { CategoryOption, EffectCatalogItem } from './types';

export const categories: CategoryOption[] = [
  { id: 'all', label: 'All' },
  { id: 'text', label: 'Text' },
  { id: 'interaction', label: 'Interaction' },
  { id: 'ui', label: 'UI' },
  { id: 'background', label: 'Background' }
];

export const effectCatalog: EffectCatalogItem[] = [
  {
    id: 'blur-text',
    name: 'BlurText',
    importName: 'BlurTextDemo',
    category: 'text',
    summary: 'Softly resolves blurred words into a crisp hero line.',
    bestFor: ['Hero headlines', 'Section intros', 'Launch messaging'],
    dependencies: ['React'],
    component: BlurTextDemo,
    snippet: snippets.blurText,
    sourceUrl: 'https://reactbits.dev/text-animations/blur-text',
    motionIntensity: 'medium'
  },
  {
    id: 'split-text',
    name: 'SplitText',
    importName: 'SplitTextDemo',
    category: 'text',
    summary: 'Staggers words into place for a polished editorial reveal.',
    bestFor: ['Landing pages', 'Feature titles', 'Portfolio copy'],
    dependencies: ['React'],
    component: SplitTextDemo,
    snippet: snippets.splitText,
    sourceUrl: 'https://reactbits.dev/text-animations/split-text',
    motionIntensity: 'medium'
  },
  {
    id: 'count-up',
    name: 'CountUp',
    importName: 'CountUpDemo',
    category: 'text',
    summary: 'Animates numbers so metrics feel alive without extra decoration.',
    bestFor: ['Dashboards', 'KPIs', 'Impact stats'],
    dependencies: ['React'],
    component: CountUpDemo,
    snippet: snippets.countUp,
    sourceUrl: 'https://reactbits.dev/text-animations/count-up',
    motionIntensity: 'low'
  },
  {
    id: 'fade-content',
    name: 'FadeContent',
    importName: 'FadeContentDemo',
    category: 'interaction',
    summary: 'Fades content into view with a clean upward motion.',
    bestFor: ['Progressive disclosure', 'Cards', 'Form sections'],
    dependencies: ['React'],
    component: FadeContentDemo,
    snippet: snippets.fadeContent,
    sourceUrl: 'https://reactbits.dev/animations/fade-content',
    motionIntensity: 'low'
  },
  {
    id: 'magnet',
    name: 'Magnet',
    importName: 'MagnetDemo',
    category: 'interaction',
    summary: 'Pulls a target subtly toward the pointer for tactile emphasis.',
    bestFor: ['Primary buttons', 'CTA links', 'Icon actions'],
    dependencies: ['React'],
    component: MagnetDemo,
    snippet: snippets.magnet,
    sourceUrl: 'https://reactbits.dev/animations/magnet',
    motionIntensity: 'medium'
  },
  {
    id: 'click-spark',
    name: 'ClickSpark',
    importName: 'ClickSparkDemo',
    category: 'interaction',
    summary: 'Adds a brief spark burst on click without changing layout.',
    bestFor: ['Buttons', 'Playable demos', 'Delight moments'],
    dependencies: ['React'],
    component: ClickSparkDemo,
    snippet: snippets.clickSpark,
    sourceUrl: 'https://reactbits.dev/animations/click-spark',
    motionIntensity: 'medium'
  },
  {
    id: 'spotlight-card',
    name: 'SpotlightCard',
    importName: 'SpotlightCardDemo',
    category: 'ui',
    summary: 'Adds pointer-aware lighting to a card surface.',
    bestFor: ['Feature cards', 'Pricing blocks', 'Portfolio tiles'],
    dependencies: ['React'],
    component: SpotlightCardDemo,
    snippet: snippets.spotlightCard,
    sourceUrl: 'https://reactbits.dev/components/spotlight-card',
    motionIntensity: 'medium'
  },
  {
    id: 'animated-list',
    name: 'AnimatedList',
    importName: 'AnimatedListDemo',
    category: 'ui',
    summary: 'Stages list items into view for activity and notification streams.',
    bestFor: ['Activity feeds', 'Notifications', 'Search results'],
    dependencies: ['React'],
    component: AnimatedListDemo,
    snippet: snippets.animatedList,
    sourceUrl: 'https://reactbits.dev/components/animated-list',
    motionIntensity: 'low'
  },
  {
    id: 'dock',
    name: 'Dock',
    importName: 'DockDemo',
    category: 'ui',
    summary: 'Creates a compact icon dock with hover scale affordances.',
    bestFor: ['Toolbars', 'Creative apps', 'Navigation shortcuts'],
    dependencies: ['React', 'lucide-react'],
    component: DockDemo,
    snippet: snippets.dock,
    sourceUrl: 'https://reactbits.dev/components/dock',
    motionIntensity: 'medium'
  },
  {
    id: 'border-glow',
    name: 'Border Glow',
    importName: 'BorderGlowDemo',
    category: 'ui',
    summary: 'Highlights important containers with a moving border glow.',
    bestFor: ['Featured panels', 'Upgrade prompts', 'Selected states'],
    dependencies: ['React'],
    component: BorderGlowDemo,
    snippet: snippets.borderGlow,
    sourceUrl: 'https://reactbits.dev/components/border-glow',
    motionIntensity: 'medium'
  },
  {
    id: 'stepper',
    name: 'Stepper',
    importName: 'StepperDemo',
    category: 'ui',
    summary: 'Shows a multi-step flow with animated progress feedback.',
    bestFor: ['Onboarding', 'Checkout', 'Setup flows'],
    dependencies: ['React'],
    component: StepperDemo,
    snippet: snippets.stepper,
    sourceUrl: 'https://reactbits.dev/components/stepper',
    motionIntensity: 'low'
  },
  {
    id: 'flowing-menu',
    name: 'Flowing Menu',
    importName: 'FlowingMenuDemo',
    category: 'ui',
    summary: 'Turns menu choices into a fluid, highly visual navigation surface.',
    bestFor: ['Creative navigation', 'Category pickers', 'Showcase menus'],
    dependencies: ['React'],
    component: FlowingMenuDemo,
    snippet: snippets.flowingMenu,
    sourceUrl: 'https://reactbits.dev/components/flowing-menu',
    motionIntensity: 'high'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    importName: 'AuroraDemo',
    category: 'background',
    summary: 'Layers soft moving color bands behind foreground content.',
    bestFor: ['Hero backgrounds', 'Event pages', 'Immersive sections'],
    dependencies: ['React'],
    component: AuroraDemo,
    snippet: snippets.aurora,
    sourceUrl: 'https://reactbits.dev/backgrounds/aurora',
    motionIntensity: 'high'
  },
  {
    id: 'dot-grid',
    name: 'DotGrid',
    importName: 'DotGridDemo',
    category: 'background',
    summary: 'Provides a crisp responsive dot matrix for technical layouts.',
    bestFor: ['Dashboards', 'Developer tools', 'Product backdrops'],
    dependencies: ['React'],
    component: DotGridDemo,
    snippet: snippets.dotGrid,
    sourceUrl: 'https://reactbits.dev/backgrounds/dot-grid',
    motionIntensity: 'low'
  },
  {
    id: 'threads',
    name: 'Threads',
    importName: 'ThreadsDemo',
    category: 'background',
    summary: 'Uses fine animated strands to create depth without heavy imagery.',
    bestFor: ['Ambient panels', 'AI products', 'Experimental pages'],
    dependencies: ['React'],
    component: ThreadsDemo,
    snippet: snippets.threads,
    sourceUrl: 'https://reactbits.dev/backgrounds/threads',
    motionIntensity: 'high'
  }
];
```

- [ ] **Step 6: Run catalog tests**

Run: `npm run test -- src/effects/catalog.test.ts`

Expected: FAIL because `src/reactbits/adapters` does not exist yet.

- [ ] **Step 7: Commit**

Run: `git rev-parse --is-inside-work-tree`

Expected in this workspace: `fatal: not a git repository (or any of the parent directories): .git`

Commit action: skipped because the current workspace is not a git repository.

---

### Task 3: Implement Preview Primitives And Fifteen Demo Adapters

**Files:**
- Create: `src/reactbits/PreviewPrimitives.tsx`
- Create: `src/reactbits/adapters/BlurTextDemo.tsx`
- Create: `src/reactbits/adapters/SplitTextDemo.tsx`
- Create: `src/reactbits/adapters/CountUpDemo.tsx`
- Create: `src/reactbits/adapters/FadeContentDemo.tsx`
- Create: `src/reactbits/adapters/MagnetDemo.tsx`
- Create: `src/reactbits/adapters/ClickSparkDemo.tsx`
- Create: `src/reactbits/adapters/SpotlightCardDemo.tsx`
- Create: `src/reactbits/adapters/AnimatedListDemo.tsx`
- Create: `src/reactbits/adapters/DockDemo.tsx`
- Create: `src/reactbits/adapters/BorderGlowDemo.tsx`
- Create: `src/reactbits/adapters/StepperDemo.tsx`
- Create: `src/reactbits/adapters/FlowingMenuDemo.tsx`
- Create: `src/reactbits/adapters/AuroraDemo.tsx`
- Create: `src/reactbits/adapters/DotGridDemo.tsx`
- Create: `src/reactbits/adapters/ThreadsDemo.tsx`
- Create: `src/reactbits/adapters/index.ts`

**Interfaces:**
- Consumes: `EffectDemoProps` from `src/effects/types.ts`.
- Produces: Fifteen React components named `BlurTextDemo`, `SplitTextDemo`, `CountUpDemo`, `FadeContentDemo`, `MagnetDemo`, `ClickSparkDemo`, `SpotlightCardDemo`, `AnimatedListDemo`, `DockDemo`, `BorderGlowDemo`, `StepperDemo`, `FlowingMenuDemo`, `AuroraDemo`, `DotGridDemo`, and `ThreadsDemo`.

- [ ] **Step 1: Create the preview primitives**

```tsx
import { Bell, Command, Compass, Home, Layers, Search, Settings, Sparkles, Star, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ResetProps = {
  resetKey: number;
};

export function BlurTextPrimitive({ resetKey }: ResetProps) {
  return (
    <div key={resetKey} className="demo-text demo-blur-text">
      Build interfaces that feel awake.
    </div>
  );
}

export function SplitTextPrimitive({ resetKey }: ResetProps) {
  const words = ['Motion', 'that', 'keeps', 'the', 'story', 'moving'];
  return (
    <div key={resetKey} className="demo-split-text" aria-label={words.join(' ')}>
      {words.map((word, index) => (
        <span key={word} style={{ '--index': index } as React.CSSProperties}>
          {word}
        </span>
      ))}
    </div>
  );
}

export function CountUpPrimitive({ resetKey }: ResetProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);
    let frame = 0;
    const totalFrames = 48;
    const id = window.setInterval(() => {
      frame += 1;
      setValue(Math.round((frame / totalFrames) * 12840));
      if (frame >= totalFrames) {
        window.clearInterval(id);
      }
    }, 24);
    return () => window.clearInterval(id);
  }, [resetKey]);

  return (
    <div className="demo-count-up">
      <strong>{value.toLocaleString()}</strong>
      <span>preview sessions</span>
    </div>
  );
}

export function FadeContentPrimitive({ resetKey }: ResetProps) {
  return (
    <div key={resetKey} className="demo-fade-card">
      <span>Selected effect</span>
      <strong>FadeContent</strong>
      <p>A calm reveal for cards, panels, and progressive disclosure.</p>
    </div>
  );
}

export function MagnetPrimitive() {
  return (
    <div className="demo-magnet-wrap">
      <button className="demo-magnet" type="button">
        Pull me
      </button>
    </div>
  );
}

export function ClickSparkPrimitive({ resetKey }: ResetProps) {
  const [sparks, setSparks] = useState<number[]>([]);

  useEffect(() => {
    setSparks([]);
  }, [resetKey]);

  return (
    <button
      className="demo-click-spark"
      type="button"
      onClick={() => setSparks(current => [...current.slice(-4), Date.now()])}
    >
      <span>Click for spark</span>
      {sparks.map((spark, index) => (
        <i key={spark} style={{ '--spark-index': index } as React.CSSProperties} />
      ))}
    </button>
  );
}

export function SpotlightCardPrimitive() {
  return (
    <article className="demo-spotlight-card">
      <span>SpotlightCard</span>
      <h3>Pointer-aware feature card</h3>
      <p>Great for premium surfaces and interactive product grids.</p>
    </article>
  );
}

export function AnimatedListPrimitive({ resetKey }: ResetProps) {
  const items = ['New lead captured', 'Preview saved', 'Effect added', 'Build completed'];
  return (
    <ul key={resetKey} className="demo-animated-list">
      {items.map((item, index) => (
        <li key={item} style={{ '--index': index } as React.CSSProperties}>
          <Bell size={16} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DockPrimitive() {
  const items = [
    { icon: Home, label: 'Home' },
    { icon: Search, label: 'Search' },
    { icon: Command, label: 'Commands' },
    { icon: Settings, label: 'Settings' }
  ];
  return (
    <nav className="demo-dock" aria-label="Demo dock">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" aria-label={item.label}>
            <Icon size={22} aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

export function BorderGlowPrimitive() {
  return (
    <article className="demo-border-glow">
      <span>Border Glow</span>
      <strong>Featured integration</strong>
      <p>Use it to mark selected states or high-value cards.</p>
    </article>
  );
}

export function StepperPrimitive() {
  const steps = ['Choose', 'Preview', 'Apply'];
  return (
    <ol className="demo-stepper">
      {steps.map((step, index) => (
        <li key={step} className={index < 2 ? 'is-complete' : 'is-next'}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </li>
      ))}
    </ol>
  );
}

export function FlowingMenuPrimitive() {
  const items = ['Text', 'Interaction', 'UI', 'Background'];
  return (
    <div className="demo-flowing-menu">
      {items.map((item, index) => (
        <button key={item} type="button" style={{ '--index': index } as React.CSSProperties}>
          <span>{item}</span>
          <Sparkles size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function AuroraPrimitive() {
  return (
    <div className="demo-background demo-aurora">
      <Wand2 size={34} aria-hidden="true" />
      <span>Aurora background</span>
    </div>
  );
}

export function DotGridPrimitive() {
  return (
    <div className="demo-background demo-dot-grid">
      <Layers size={34} aria-hidden="true" />
      <span>Dot grid field</span>
    </div>
  );
}

export function ThreadsPrimitive() {
  const strands = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);
  return (
    <div className="demo-background demo-threads">
      {strands.map(index => (
        <i key={index} style={{ '--index': index } as React.CSSProperties} />
      ))}
      <Compass size={34} aria-hidden="true" />
      <span>Threaded motion field</span>
    </div>
  );
}
```

- [ ] **Step 2: Create the adapter files**

Each file imports `EffectDemoProps` and the matching primitive, then exports a component with the approved adapter name.

`src/reactbits/adapters/BlurTextDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { BlurTextPrimitive } from '../PreviewPrimitives';

export function BlurTextDemo({ resetKey }: EffectDemoProps) {
  return <BlurTextPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/SplitTextDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { SplitTextPrimitive } from '../PreviewPrimitives';

export function SplitTextDemo({ resetKey }: EffectDemoProps) {
  return <SplitTextPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/CountUpDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { CountUpPrimitive } from '../PreviewPrimitives';

export function CountUpDemo({ resetKey }: EffectDemoProps) {
  return <CountUpPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/FadeContentDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { FadeContentPrimitive } from '../PreviewPrimitives';

export function FadeContentDemo({ resetKey }: EffectDemoProps) {
  return <FadeContentPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/MagnetDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { MagnetPrimitive } from '../PreviewPrimitives';

export function MagnetDemo(_props: EffectDemoProps) {
  return <MagnetPrimitive />;
}
```

`src/reactbits/adapters/ClickSparkDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { ClickSparkPrimitive } from '../PreviewPrimitives';

export function ClickSparkDemo({ resetKey }: EffectDemoProps) {
  return <ClickSparkPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/SpotlightCardDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { SpotlightCardPrimitive } from '../PreviewPrimitives';

export function SpotlightCardDemo(_props: EffectDemoProps) {
  return <SpotlightCardPrimitive />;
}
```

`src/reactbits/adapters/AnimatedListDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { AnimatedListPrimitive } from '../PreviewPrimitives';

export function AnimatedListDemo({ resetKey }: EffectDemoProps) {
  return <AnimatedListPrimitive resetKey={resetKey} />;
}
```

`src/reactbits/adapters/DockDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { DockPrimitive } from '../PreviewPrimitives';

export function DockDemo(_props: EffectDemoProps) {
  return <DockPrimitive />;
}
```

`src/reactbits/adapters/BorderGlowDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { BorderGlowPrimitive } from '../PreviewPrimitives';

export function BorderGlowDemo(_props: EffectDemoProps) {
  return <BorderGlowPrimitive />;
}
```

`src/reactbits/adapters/StepperDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { StepperPrimitive } from '../PreviewPrimitives';

export function StepperDemo(_props: EffectDemoProps) {
  return <StepperPrimitive />;
}
```

`src/reactbits/adapters/FlowingMenuDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { FlowingMenuPrimitive } from '../PreviewPrimitives';

export function FlowingMenuDemo(_props: EffectDemoProps) {
  return <FlowingMenuPrimitive />;
}
```

`src/reactbits/adapters/AuroraDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { AuroraPrimitive } from '../PreviewPrimitives';

export function AuroraDemo(_props: EffectDemoProps) {
  return <AuroraPrimitive />;
}
```

`src/reactbits/adapters/DotGridDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { DotGridPrimitive } from '../PreviewPrimitives';

export function DotGridDemo(_props: EffectDemoProps) {
  return <DotGridPrimitive />;
}
```

`src/reactbits/adapters/ThreadsDemo.tsx`:

```tsx
import type { EffectDemoProps } from '../../effects/types';
import { ThreadsPrimitive } from '../PreviewPrimitives';

export function ThreadsDemo(_props: EffectDemoProps) {
  return <ThreadsPrimitive />;
}
```

- [ ] **Step 3: Create the adapter barrel**

```ts
export { AnimatedListDemo } from './AnimatedListDemo';
export { AuroraDemo } from './AuroraDemo';
export { BlurTextDemo } from './BlurTextDemo';
export { BorderGlowDemo } from './BorderGlowDemo';
export { ClickSparkDemo } from './ClickSparkDemo';
export { CountUpDemo } from './CountUpDemo';
export { DockDemo } from './DockDemo';
export { DotGridDemo } from './DotGridDemo';
export { FadeContentDemo } from './FadeContentDemo';
export { FlowingMenuDemo } from './FlowingMenuDemo';
export { MagnetDemo } from './MagnetDemo';
export { SplitTextDemo } from './SplitTextDemo';
export { SpotlightCardDemo } from './SpotlightCardDemo';
export { StepperDemo } from './StepperDemo';
export { ThreadsDemo } from './ThreadsDemo';
```

- [ ] **Step 4: Run catalog tests**

Run: `npm run test -- src/effects/catalog.test.ts`

Expected: PASS. The catalog can import all adapter symbols.

- [ ] **Step 5: Commit**

Run: `git rev-parse --is-inside-work-tree`

Expected in this workspace: `fatal: not a git repository (or any of the parent directories): .git`

Commit action: skipped because the current workspace is not a git repository.

---

### Task 4: Build The EffectLab Preview Experience

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Create: `src/components/CopyButton.tsx`
- Create: `src/pages/EffectLab.tsx`
- Create: `src/pages/EffectLab.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `categories` and `effectCatalog` from `src/effects/catalog.tsx`.
- Produces: The visible preview tool with category filters, search, reset, metadata, snippets, and error isolation.

- [ ] **Step 1: Write failing EffectLab tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EffectLab } from './EffectLab';

describe('EffectLab', () => {
  it('renders the curated pack and selects an effect', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    expect(screen.getByRole('heading', { name: /React Bits Effects/i })).toBeInTheDocument();
    expect(screen.getByText('15 effects')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UI' }));
    await user.click(screen.getByRole('button', { name: /Border Glow/i }));

    expect(screen.getByRole('heading', { name: 'Border Glow' })).toBeInTheDocument();
    expect(screen.getByText(/moving border glow/i)).toBeInTheDocument();
  });

  it('filters by search text', async () => {
    const user = userEvent.setup();
    render(<EffectLab />);

    await user.type(screen.getByPlaceholderText(/search effects/i), 'dock');

    expect(screen.getByRole('button', { name: /Dock/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aurora/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run EffectLab tests to verify they fail**

Run: `npm run test -- src/pages/EffectLab.test.tsx`

Expected: FAIL because `src/pages/EffectLab.tsx` does not exist.

- [ ] **Step 3: Create `src/components/ErrorBoundary.tsx`**

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  resetKey: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Effect preview failed', error, info.componentStack);
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="preview-error" role="alert">
          This preview could not render. Choose another effect or reset the preview.
        </div>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 4: Create `src/components/CopyButton.tsx`**

```tsx
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type CopyButtonProps = {
  value: string;
};

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button className="icon-button" type="button" onClick={handleCopy} aria-label="Copy usage snippet">
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
    </button>
  );
}
```

- [ ] **Step 5: Create `src/pages/EffectLab.tsx`**

```tsx
import { RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { categories, effectCatalog } from '../effects/catalog';
import type { CategoryFilter } from '../effects/types';

export function EffectLab() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(effectCatalog[0].id);
  const [resetKey, setResetKey] = useState(0);

  const filteredEffects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return effectCatalog.filter(item => {
      const categoryMatch = category === 'all' || item.category === category;
      const queryMatch =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.bestFor.some(value => value.toLowerCase().includes(normalizedQuery));
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const activeEffect = effectCatalog.find(item => item.id === activeId) ?? filteredEffects[0] ?? effectCatalog[0];
  const Preview = activeEffect.component;

  function selectCategory(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    const firstMatch = effectCatalog.find(item => nextCategory === 'all' || item.category === nextCategory);
    if (firstMatch) {
      setActiveId(firstMatch.id);
    }
  }

  return (
    <main className="effect-lab">
      <section className="lab-sidebar" aria-label="Effect navigation">
        <div className="lab-title">
          <p>Curated toolbox</p>
          <h1>React Bits Effects</h1>
          <span>{effectCatalog.length} effects</span>
        </div>

        <div className="category-tabs" role="tablist" aria-label="Effect categories">
          {categories.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={category === item.id}
              className={category === item.id ? 'is-active' : ''}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search effects"
            aria-label="Search effects"
          />
        </label>

        <div className="effect-list" aria-label="Effect list">
          {filteredEffects.map(item => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeEffect.id ? 'is-selected' : ''}
              onClick={() => setActiveId(item.id)}
            >
              <strong>{item.name}</strong>
              <span>{item.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="preview-panel" aria-label="Effect preview">
        <div className="preview-toolbar">
          <div>
            <p>{activeEffect.category}</p>
            <h2>{activeEffect.name}</h2>
          </div>
          <button className="icon-button" type="button" onClick={() => setResetKey(value => value + 1)} aria-label="Reset preview">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={`preview-stage preview-${activeEffect.category}`}>
          <ErrorBoundary resetKey={`${activeEffect.id}-${resetKey}`}>
            <Preview resetKey={resetKey} />
          </ErrorBoundary>
        </div>

        <div className="detail-grid">
          <article>
            <h3>Best for</h3>
            <ul>
              {activeEffect.bestFor.map(value => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </article>

          <article>
            <h3>Dependencies</h3>
            <p>{activeEffect.dependencies.join(', ')}</p>
            <a href={activeEffect.sourceUrl} target="_blank" rel="noreferrer">
              React Bits source
            </a>
          </article>
        </div>

        <article className="snippet-card">
          <div>
            <h3>Usage</h3>
            <CopyButton value={activeEffect.snippet} />
          </div>
          <pre>
            <code>{activeEffect.snippet}</code>
          </pre>
        </article>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Append the EffectLab and demo CSS to `src/styles/global.css`**

Add the CSS below after the existing global rules:

```css
.effect-lab {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  min-height: 100vh;
}

.lab-sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-right: 1px solid var(--line);
  background: #14171e;
  padding: 24px;
}

.lab-title p,
.preview-toolbar p {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.lab-title h1,
.preview-toolbar h2 {
  margin: 0;
  color: var(--text);
}

.lab-title span {
  display: inline-flex;
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.9rem;
}

.category-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.category-tabs button,
.effect-list button,
.icon-button {
  border: 1px solid var(--line);
  color: var(--text);
  background: var(--surface);
}

.category-tabs button {
  min-height: 38px;
  border-radius: 8px;
}

.category-tabs button.is-active,
.effect-list button.is-selected {
  border-color: color-mix(in srgb, var(--accent) 70%, white 0%);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface));
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  padding: 0 12px;
  color: var(--muted);
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  color: var(--text);
  background: transparent;
}

.effect-list {
  display: grid;
  gap: 8px;
  overflow: auto;
  padding-right: 4px;
}

.effect-list button {
  display: grid;
  gap: 4px;
  min-height: 74px;
  border-radius: 8px;
  padding: 12px;
  text-align: left;
}

.effect-list strong {
  font-size: 0.95rem;
}

.effect-list span {
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.35;
}

.preview-panel {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: 24px;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
}

.preview-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 360px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    radial-gradient(circle at 20% 10%, rgba(110, 231, 200, 0.14), transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(138, 180, 255, 0.16), transparent 34%),
    var(--surface);
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-grid article,
.snippet-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  padding: 16px;
}

.detail-grid h3,
.snippet-card h3 {
  margin: 0 0 10px;
}

.detail-grid p,
.detail-grid ul {
  margin: 0;
  color: var(--muted);
}

.detail-grid a {
  display: inline-block;
  margin-top: 10px;
  color: var(--accent);
}

.snippet-card > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.snippet-card pre {
  overflow: auto;
  margin: 0;
  color: #d8e2f2;
  font-size: 0.85rem;
  line-height: 1.5;
}

.preview-error {
  border: 1px solid color-mix(in srgb, var(--warning) 80%, white 0%);
  border-radius: 8px;
  color: var(--warning);
  padding: 16px;
}

.demo-text {
  max-width: 760px;
  text-align: center;
  font-size: clamp(2.2rem, 7vw, 5.8rem);
  font-weight: 800;
  line-height: 0.95;
}

.demo-blur-text {
  animation: blurIn 900ms ease both;
}

.demo-split-text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35em;
  max-width: 780px;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1;
}

.demo-split-text span {
  animation: splitRise 700ms ease both;
  animation-delay: calc(var(--index) * 75ms);
}

.demo-count-up {
  display: grid;
  gap: 8px;
  text-align: center;
}

.demo-count-up strong {
  font-size: clamp(3rem, 9vw, 7rem);
  line-height: 1;
}

.demo-count-up span {
  color: var(--muted);
}

.demo-fade-card,
.demo-spotlight-card,
.demo-border-glow {
  width: min(100%, 420px);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
  padding: 26px;
}

.demo-fade-card {
  animation: fadeLift 720ms ease both;
}

.demo-magnet-wrap {
  display: grid;
  place-items: center;
  min-height: 180px;
}

.demo-magnet,
.demo-click-spark {
  position: relative;
  border: 0;
  border-radius: 999px;
  color: #06110f;
  background: var(--accent);
  padding: 15px 26px;
  font-weight: 800;
}

.demo-magnet {
  transition: transform 180ms ease;
}

.demo-magnet:hover {
  transform: translateY(-5px) scale(1.08);
}

.demo-click-spark {
  overflow: visible;
}

.demo-click-spark i {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--warning);
  animation: spark 520ms ease-out both;
  transform: rotate(calc(var(--spark-index) * 72deg)) translateX(0);
}

.demo-spotlight-card {
  background:
    radial-gradient(circle at var(--x, 50%) var(--y, 20%), rgba(110, 231, 200, 0.28), transparent 34%),
    rgba(255, 255, 255, 0.07);
}

.demo-animated-list {
  display: grid;
  width: min(100%, 420px);
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.demo-animated-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
  padding: 12px 14px;
  animation: fadeLift 600ms ease both;
  animation-delay: calc(var(--index) * 80ms);
}

.demo-dock {
  display: flex;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  padding: 10px;
}

.demo-dock button {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  color: var(--text);
  background: var(--surface-strong);
  transition: transform 160ms ease;
}

.demo-dock button:hover {
  transform: translateY(-6px) scale(1.1);
}

.demo-border-glow {
  position: relative;
}

.demo-border-glow::before {
  position: absolute;
  inset: -1px;
  z-index: -1;
  border-radius: inherit;
  background: conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--warning), var(--accent));
  content: "";
  animation: spin 2.8s linear infinite;
}

.demo-stepper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.demo-stepper li {
  display: grid;
  justify-items: center;
  gap: 8px;
}

.demo-stepper span {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface-strong);
}

.demo-stepper .is-complete span {
  color: #06110f;
  background: var(--accent);
}

.demo-flowing-menu {
  display: grid;
  width: min(100%, 520px);
  gap: 10px;
}

.demo-flowing-menu button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.07);
  padding: 15px 18px;
  transform: translateX(calc(var(--index) * 8px));
  transition: transform 180ms ease, background 180ms ease;
}

.demo-flowing-menu button:hover {
  background: rgba(110, 231, 200, 0.16);
  transform: translateX(18px);
}

.demo-background {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  gap: 8px;
  text-align: center;
}

.demo-background span,
.demo-background svg {
  position: relative;
  z-index: 1;
}

.demo-aurora {
  background:
    radial-gradient(circle at 20% 50%, rgba(110, 231, 200, 0.36), transparent 28%),
    radial-gradient(circle at 70% 40%, rgba(138, 180, 255, 0.34), transparent 30%),
    radial-gradient(circle at 50% 80%, rgba(255, 209, 102, 0.22), transparent 32%);
  animation: auroraShift 5s ease-in-out infinite alternate;
}

.demo-dot-grid {
  background-image: radial-gradient(circle, rgba(245, 247, 251, 0.32) 1px, transparent 1px);
  background-size: 24px 24px;
}

.demo-threads {
  overflow: hidden;
}

.demo-threads i {
  position: absolute;
  top: calc(var(--index) * 8%);
  left: -10%;
  width: 120%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(110, 231, 200, 0.5), transparent);
  animation: threadDrift 4s ease-in-out infinite;
  animation-delay: calc(var(--index) * -180ms);
}

@keyframes blurIn {
  from {
    opacity: 0;
    filter: blur(18px);
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@keyframes splitRise {
  from {
    opacity: 0;
    transform: translateY(24px) rotate(2deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

@keyframes fadeLift {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spark {
  to {
    opacity: 0;
    transform: rotate(calc(var(--spark-index) * 72deg)) translateX(64px);
  }
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes auroraShift {
  to {
    filter: hue-rotate(35deg);
    transform: scale(1.06);
  }
}

@keyframes threadDrift {
  50% {
    transform: translateX(9%) translateY(18px);
  }
}

@media (max-width: 820px) {
  .effect-lab {
    grid-template-columns: 1fr;
  }

  .lab-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .preview-stage {
    min-height: 300px;
  }
}
```

- [ ] **Step 7: Run EffectLab tests**

Run: `npm run test -- src/pages/EffectLab.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

Run: `git rev-parse --is-inside-work-tree`

Expected in this workspace: `fatal: not a git repository (or any of the parent directories): .git`

Commit action: skipped because the current workspace is not a git repository.

---

### Task 5: Verify Build, Motion Fallback, And Local Preview

**Files:**
- Modify: No source files expected unless verification exposes a defect.

**Interfaces:**
- Consumes: Completed app from Tasks 1-4.
- Produces: Verified local preview app and final run instructions.

- [ ] **Step 1: Run all tests**

Run: `npm run test`

Expected: PASS for `src/effects/catalog.test.ts` and `src/pages/EffectLab.test.tsx`.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS and Vite prints a `dist/` output summary.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser smoke test**

Open the local URL in the in-app browser or a normal browser.

Expected:

- The first screen is the preview tool, not a marketing landing page.
- The sidebar shows `15 effects`.
- Category filtering works for Text, Interaction, UI, and Background.
- Searching `dock` leaves Dock visible and hides Aurora.
- Reset preview restarts CountUp and entry animations.
- Usage snippets are visible and copy button changes state after click.
- Mobile width around 390px shows sidebar above preview without overlapping text.

- [ ] **Step 5: Reduced-motion check**

Use the browser rendering tools or OS setting to enable reduced motion.

Expected:

- Animations complete immediately or reduce to near-static behavior.
- The page remains usable.
- Category buttons, search input, effect buttons, reset, and copy button remain keyboard reachable.

- [ ] **Step 6: Commit**

Run: `git rev-parse --is-inside-work-tree`

Expected in this workspace: `fatal: not a git repository (or any of the parent directories): .git`

Commit action: skipped because the current workspace is not a git repository.

---

## Self-Review

Spec coverage:

- Standalone Vite React prototype: Task 1.
- Fifteen-effect curated pack: Tasks 2 and 3.
- Preview and selection page: Task 4.
- Typed catalog with category, dependencies, usage snippets, source URL, and motion intensity: Task 2.
- Error boundary: Task 4.
- Reduced-motion behavior: Tasks 1, 4, and 5.
- Build, test, browser verification: Task 5.
- License boundary against public redistribution: Global Constraints.

Deferred marker scan:

- The plan contains no unresolved markers, no deferred task labels, and no missing file names.

Type consistency:

- `EffectDemoProps` defines `{ resetKey: number }`.
- Every adapter consumes `EffectDemoProps`.
- `EffectCatalogItem.component` is `ComponentType<EffectDemoProps>`.
- `effectCatalog` references exported adapter names from `src/reactbits/adapters/index.ts`.

Git status:

- The workspace is not a git repository, so commit steps are explicitly skipped until git is initialized.
