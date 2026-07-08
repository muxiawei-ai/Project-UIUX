import type { EffectDemoProps } from '../../effects/types';
import { ClickSparkPrimitive } from '../PreviewPrimitives';

export function ClickSparkDemo({ resetKey }: EffectDemoProps) {
  return <ClickSparkPrimitive resetKey={resetKey} />;
}
