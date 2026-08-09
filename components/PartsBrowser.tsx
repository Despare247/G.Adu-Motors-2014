'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { PublicProduct, Origin, Condition } from '@/types';
import PartRow from './PartRow';

interface PartsBrowserProps {
  products: PublicProduct[];
}

export default function PartsBrowser({ products }: PartsBrowserProps) {
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [origin, setOrigin] = useState<Origin | ''>((params.get('origin') as Origin) ?? '');
  const [condition, setCondition] = useState<Condition | ''>((params.get('condition') as Condition) ?? '');
  const [make, setMake] = useState(params.get('make') ?? '');
  const [model, setModel] = useState(params.get('model') ?? '');
  const [year, setYear] = useState(params.get('year') ?? '');

  const makes = useMemo(() => Array.from(new Set(products.map((p) => p.make))).sort(), [products]);
  const models = useMemo(
    () => Array.from(new Set(products.filter((p) => !make || p.make === make).map((p) => p.model))).sort(),
    [products, make],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (origin && p.origin !== origin) return false;
      if (condition && p.condition !== condition) return false;
      if (make && p.make !== make) return false;
      if (model && p.model !== model) return false;
      if (year && String(p.year) !== year) return false;
      if (q) {
        const haystack = `${p.name} ${p.make} ${p.model}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, origin, condition, make, model, year]);

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-[color:var(--color-divider)] p-5 lg:border-b-0 lg:border-r">
        {(make || model || year) && (
          <div className="mb-4 border-2 border-ink-900 p-3">
            <div className="mb-1.5 text-[10px] uppercase tracking-wide text-ink-600">Fitted to</div>
            <div className="font-display text-sm font-extrabold">
              {[make, model, year].filter(Boolean).join(' ') || 'Any vehicle'}
            </div>
            <button
              onClick={() => {
                setMake('');
                setModel('');
                setYear('');
              }}
              className="mt-1 text-xs text-accent hover:underline"
            >
              Clear vehicle
            </button>
          </div>
        )}

        <h6 className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-ink-600">Origin</h6>
        <div className="mb-5 grid gap-2">
          <label className="radio">
            <input type="radio" name="origin" checked={origin === ''} onChange={() => setOrigin('')} />
            <span className="dot" />All
          </label>
          <label className="radio">
            <input type="radio" name="origin" checked={origin === 'Japanese'} onChange={() => setOrigin('Japanese')} />
            <span className="dot" />Japanese
          </label>
          <label className="radio">
            <input type="radio" name="origin" checked={origin === 'Korean'} onChange={() => setOrigin('Korean')} />
            <span className="dot" />Korean
          </label>
        </div>

        <h6 className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-ink-600">Condition</h6>
        <div className="mb-5 grid gap-2">
          <label className="radio">
            <input type="radio" name="condition" checked={condition === ''} onChange={() => setCondition('')} />
            <span className="dot" />All
          </label>
          <label className="radio">
            <input type="radio" name="condition" checked={condition === 'New'} onChange={() => setCondition('New')} />
            <span className="dot" />New
          </label>
          <label className="radio">
            <input type="radio" name="condition" checked={condition === 'Used'} onChange={() => setCondition('Used')} />
            <span className="dot" />Used
          </label>
        </div>

        <h6 className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-ink-600">Vehicle</h6>
        <div className="grid gap-2">
          <select
            className="input"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel('');
            }}
          >
            <option value="">Any make</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select className="input" value={model} onChange={(e) => setModel(e.target.value)} disabled={!models.length}>
            <option value="">Any model</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </aside>

      <section className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2" style={{ minWidth: 220 }}>
            <Search className="h-4 w-4 shrink-0 text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part name, make or model…"
              className="input border-0 bg-transparent px-1"
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between border-b-2 border-[color:var(--color-divider)] pb-2.5">
          <div className="font-display text-base font-extrabold">{filtered.length} parts</div>
          <div className="text-xs text-ink-500">Newest first</div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-[color:var(--color-divider)] py-16 text-center">
            <p className="text-sm font-semibold text-ink-700">No parts match your filters.</p>
            <p className="text-sm text-ink-500">Try a different search term, origin, condition or vehicle.</p>
          </div>
        ) : (
          <div>
            {filtered.map((part) => (
              <PartRow key={part.id} part={part} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
