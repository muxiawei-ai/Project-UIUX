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
