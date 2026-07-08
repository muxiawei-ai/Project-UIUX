import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { categories, effectCatalog } from '../effects/catalog';
import type { CategoryFilter } from '../effects/types';

export function EffectLab() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(effectCatalog[0].id);
  const [resetKey, setResetKey] = useState(0);

  const filteredEffects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return effectCatalog.filter(item => {
      const categoryMatch = category === 'all' || item.category === category;
      const queryMatch =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.bestFor.some(value => value.toLowerCase().includes(normalizedQuery));

      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  const activeEffect = filteredEffects.find(item => item.id === activeId) ?? filteredEffects[0] ?? null;

  useEffect(() => {
    if (activeEffect && activeEffect.id !== activeId) {
      setActiveId(activeEffect.id);
    }
  }, [activeEffect, activeId]);

  const Preview = activeEffect?.component;

  function selectCategory(nextCategory: CategoryFilter) {
    setCategory(nextCategory);

    const firstMatch = effectCatalog.find(item => nextCategory === 'all' || item.category === nextCategory);
    if (firstMatch) {
      setActiveId(firstMatch.id);
    }
  }

  return (
    <main className="effect-lab">
      <section className="lab-sidebar" aria-label="Effect navigation">
        <div className="lab-title">
          <p>Curated toolbox</p>
          <h1>React Bits Effects</h1>
          <span>{effectCatalog.length} effects</span>
        </div>

        <div className="category-tabs" aria-label="Effect categories">
          {categories.map(item => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              className={category === item.id ? 'is-active' : ''}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search effects"
            aria-label="Search effects"
          />
        </label>

        <div className="effect-list" aria-label="Effect list">
          {filteredEffects.map(item => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeEffect?.id ? 'is-selected' : ''}
              aria-pressed={item.id === activeEffect?.id}
              onClick={() => setActiveId(item.id)}
            >
              <strong>{item.name}</strong>
              <span>{item.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="preview-panel" aria-label="Effect preview">
        <div className="preview-toolbar">
          <div>
            <p>{activeEffect?.category ?? 'No matches'}</p>
            <h2>{activeEffect?.name ?? 'No effects found'}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setResetKey(value => value + 1)}
            aria-label="Reset preview"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={`preview-stage ${activeEffect ? `preview-${activeEffect.category}` : 'preview-empty'}`}>
          {activeEffect && Preview ? (
            <ErrorBoundary key={`${activeEffect.id}-${resetKey}`} resetKey={`${activeEffect.id}-${resetKey}`}>
              <Preview resetKey={resetKey} />
            </ErrorBoundary>
          ) : (
            <div className="preview-empty-state" role="status">
              <strong>No effects match this search.</strong>
              <span>Try a different keyword or category.</span>
            </div>
          )}
        </div>

        <div className="detail-grid">
          <article>
            <h3>Best for</h3>
            {activeEffect ? (
              <ul>
                {activeEffect.bestFor.map(value => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            ) : (
              <p>Adjust the filters to see usage guidance for a matching effect.</p>
            )}
          </article>

          <article>
            <h3>Dependencies</h3>
            {activeEffect ? (
              <>
                <p>{activeEffect.dependencies.join(', ')}</p>
                <a href={activeEffect.sourceUrl} target="_blank" rel="noreferrer">
                  React Bits source
                </a>
              </>
            ) : (
              <p>No effect is currently selected.</p>
            )}
          </article>
        </div>

        <article className="snippet-card">
          <div>
            <h3>Usage</h3>
            {activeEffect ? <CopyButton value={activeEffect.snippet} /> : null}
          </div>
          {activeEffect ? (
            <pre>
              <code>{activeEffect.snippet}</code>
            </pre>
          ) : (
            <p>No snippet available until a matching effect is selected.</p>
          )}
        </article>
      </section>
    </main>
  );
}
