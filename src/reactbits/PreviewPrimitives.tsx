import { Bell, Command, Compass, Home, Layers, Search, Settings, Sparkles, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';

type ResetProps = {
  resetKey: number;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const borderGlowGradientPositions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const borderGlowGradientKeys = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven'
];
const borderGlowColorMap = [0, 1, 2, 0, 1, 2, 1];

function parseHslValue(hsl: string) {
  const match = hsl.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) {
    return { h: 40, s: 80, l: 80 };
  }

  return { h: Number.parseFloat(match[1]), s: Number.parseFloat(match[2]), l: Number.parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHslValue(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ['', '-60', '-50', '-40', '-30', '-20', '-10'];

  return opacities.reduce<Record<string, string>>((vars, opacity, index) => {
    vars[`--glow-color${suffixes[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
    return vars;
  }, {});
}

function buildGradientVars(colors: string[]) {
  return borderGlowGradientPositions.reduce<Record<string, string>>((vars, position, index) => {
    const color = colors[Math.min(borderGlowColorMap[index], colors.length - 1)];
    vars[borderGlowGradientKeys[index]] = `radial-gradient(at ${position}, ${color} 0px, transparent 50%)`;
    if (index === borderGlowGradientPositions.length - 1) {
      vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    }
    return vars;
  }, {});
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInCubic(value: number) {
  return value * value * value;
}

function animateBorderGlowValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (value: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  let frameId = 0;
  const startTime = performance.now() + delay;
  const timeoutId = window.setTimeout(() => {
    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        onEnd?.();
      }
    }

    frameId = window.requestAnimationFrame(tick);
  }, delay);

  return () => {
    window.clearTimeout(timeoutId);
    window.cancelAnimationFrame(frameId);
  };
}

type BorderGlowCardProps = {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
};

function BorderGlowCard({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5
}: BorderGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenterOfElement = useCallback((element: HTMLElement) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenterOfElement(element);
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const edgeX = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX);
      const edgeY = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY);
      return Math.min(Math.max(1 / Math.min(edgeX, edgeY), 0), 1);
    },
    [getCenterOfElement]
  );

  const getCursorAngle = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenterOfElement(element);
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      if (deltaX === 0 && deltaY === 0) {
        return 0;
      }

      const degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      return degrees < 0 ? degrees + 360 : degrees;
    },
    [getCenterOfElement]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion()) {
        return;
      }

      const card = cardRef.current;
      if (!card) {
        return;
      }

      card.classList.add('is-glow-active');
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    },
    [getCursorAngle, getEdgeProximity]
  );

  const handlePointerEnter = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!prefersReducedMotion()) {
      event.currentTarget.classList.add('is-glow-active');
    }
  }, []);

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('is-glow-active');
  }, []);

  useEffect(() => {
    if (!animated || prefersReducedMotion() || !cardRef.current) {
      return undefined;
    }

    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    const cleanups = [
      animateBorderGlowValue({
        duration: 500,
        onUpdate: value => card.style.setProperty('--edge-proximity', `${value}`)
      }),
      animateBorderGlowValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: value => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`)
      }),
      animateBorderGlowValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: value => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`)
      }),
      animateBorderGlowValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: value => card.style.setProperty('--edge-proximity', `${value}`),
        onEnd: () => card.classList.remove('sweep-active')
      })
    ];

    return () => {
      cleanups.forEach(cleanup => cleanup());
      card.classList.remove('sweep-active');
    };
  }, [animated]);

  const style = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors)
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      className={`border-glow-card ${className}`}
      style={style}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

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
        <span key={word} style={{ '--index': index } as CSSProperties}>
          {word}
        </span>
      ))}
    </div>
  );
}

export function CountUpPrimitive({ resetKey }: ResetProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(12840);
      return;
    }

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
  const [style, setStyle] = useState<CSSProperties>({
    '--magnet-x': '0px',
    '--magnet-y': '0px'
  } as CSSProperties);

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion()) {
      setStyle({ '--magnet-x': '0px', '--magnet-y': '0px' } as CSSProperties);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 18;
    const y = ((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 14;
    setStyle({
      '--magnet-x': `${x.toFixed(1)}px`,
      '--magnet-y': `${y.toFixed(1)}px`
    } as CSSProperties);
  }

  function handlePointerLeave() {
    setStyle({ '--magnet-x': '0px', '--magnet-y': '0px' } as CSSProperties);
  }

  return (
    <div className="demo-magnet-wrap">
      <button
        className="demo-magnet"
        type="button"
        style={style}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        Pull me
      </button>
    </div>
  );
}

type Spark = {
  id: number;
  angle: number;
};

export function ClickSparkPrimitive({ resetKey }: ResetProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const nextSparkId = useRef(0);

  useEffect(() => {
    setSparks([]);
  }, [resetKey]);

  function addSpark() {
    const id = nextSparkId.current;
    nextSparkId.current += 1;
    setSparks(current => [...current.slice(-4), { id, angle: (id % 5) * 72 }]);
  }

  return (
    <button className="demo-click-spark" type="button" onClick={addSpark}>
      <span>Click for spark</span>
      {sparks.map(spark => (
        <i key={spark.id} style={{ '--spark-angle': `${spark.angle}deg` } as CSSProperties} />
      ))}
    </button>
  );
}

export function SpotlightCardPrimitive() {
  const [style, setStyle] = useState<CSSProperties>({
    '--x': '50%',
    '--y': '20%'
  } as CSSProperties);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion()) {
      setStyle({ '--x': '50%', '--y': '20%' } as CSSProperties);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setStyle({
      '--x': `${Math.max(0, Math.min(100, x)).toFixed(1)}%`,
      '--y': `${Math.max(0, Math.min(100, y)).toFixed(1)}%`
    } as CSSProperties);
  }

  function handlePointerLeave() {
    setStyle({ '--x': '50%', '--y': '20%' } as CSSProperties);
  }

  return (
    <article
      className="demo-spotlight-card"
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
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
        <li key={item} style={{ '--index': index } as CSSProperties}>
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
    <BorderGlowCard className="demo-border-glow" animated>
      <div className="demo-border-glow-content">
        <Sparkles size={34} aria-hidden="true" />
        <span>Border Glow</span>
        <strong>Hover Near the Edges</strong>
        <p>Move your cursor close to the border to make the mesh glow follow your pointer direction.</p>
      </div>
    </BorderGlowCard>
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
        <button key={item} type="button" style={{ '--index': index } as CSSProperties}>
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
        <i key={index} style={{ '--index': index } as CSSProperties} />
      ))}
      <Compass size={34} aria-hidden="true" />
      <span>Threaded motion field</span>
    </div>
  );
}
