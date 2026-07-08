import type { EffectDemoProps } from '../../effects/types';
import { SplitTextPrimitive } from '../PreviewPrimitives';

export function SplitTextDemo({ resetKey }: EffectDemoProps) {
  return <SplitTextPrimitive resetKey={resetKey} />;
}
