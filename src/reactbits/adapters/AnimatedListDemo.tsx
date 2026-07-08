import type { EffectDemoProps } from '../../effects/types';
import { AnimatedListPrimitive } from '../PreviewPrimitives';

export function AnimatedListDemo({ resetKey }: EffectDemoProps) {
  return <AnimatedListPrimitive resetKey={resetKey} />;
}
