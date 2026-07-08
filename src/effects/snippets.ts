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
