import type { EffectDemoProps } from '../../effects/types';
import { FadeContentPrimitive } from '../PreviewPrimitives';

export function FadeContentDemo({ resetKey }: EffectDemoProps) {
  return <FadeContentPrimitive resetKey={resetKey} />;
}
