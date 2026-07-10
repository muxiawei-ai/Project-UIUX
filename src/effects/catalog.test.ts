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

  it('lists the original component dependencies for adoption cost', () => {
    const byId = new Map(effectCatalog.map(item => [item.id, item.dependencies]));

    for (const item of effectCatalog) {
      expect(item.dependencies[0]).toBe('React');
    }

    expect(byId.get('aurora')).toContain('ogl');
    expect(byId.get('threads')).toContain('ogl');
    expect(byId.get('split-text')).toContain('gsap');
    expect(byId.get('flowing-menu')).toContain('gsap');
    expect(byId.get('dot-grid')).toContain('gsap');
    expect(byId.get('dock')).toContain('motion');
    expect(byId.get('fade-content')).toEqual(['React']);
  });
});
