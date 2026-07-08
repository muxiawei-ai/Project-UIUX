import type { EffectDemoProps } from '../../effects/types';
import { CountUpPrimitive } from '../PreviewPrimitives';

export function CountUpDemo({ resetKey }: EffectDemoProps) {
  return <CountUpPrimitive resetKey={resetKey} />;
}
