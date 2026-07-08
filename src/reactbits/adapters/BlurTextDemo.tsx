import type { EffectDemoProps } from '../../effects/types';
import { BlurTextPrimitive } from '../PreviewPrimitives';

export function BlurTextDemo({ resetKey }: EffectDemoProps) {
  return <BlurTextPrimitive resetKey={resetKey} />;
}
