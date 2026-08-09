'use client';

import Link from 'next/link';
import type { Origin, Condition } from '@/types';

export interface QuickFilter {
  origin?: Origin;
  condition?: Condition;
}

const TILES: { label: string; blurb: string; filter: QuickFilter }[] = [
  { label: 'Japanese parts', blurb: 'Toyota, Honda, Nissan, Mazda & more', filter: { origin: 'Japanese' } },
  { label: 'Korean parts', blurb: 'Hyundai, Kia', filter: { origin: 'Korean' } },
  { label: 'New parts', blurb: 'Sealed, unused stock', filter: { condition: 'New' } },
  { label: 'Used parts', blurb: 'Quality-tested take-offs', filter: { condition: 'Used' } },
];

function tileHref(filter: QuickFilter): string {
  const params = new URLSearchParams();
  if (filter.origin) params.set('origin', filter.origin);
  if (filter.condition) params.set('condition', filter.condition);
  return `/parts?${params}`;
}

export default function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-extrabold uppercase text-ink-900">Shop by system</h2>
        <p className="text-sm text-ink-600">Jump straight to what your vehicle needs</p>
      </div>
      <div className="grid grid-cols-1 gap-px bg-[color:var(--color-divider)] sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.label}
            href={tileHref(tile.filter)}
            className="flex min-h-[120px] flex-col gap-1.5 bg-canvas p-5 transition hover:bg-panel"
          >
            <span className="font-display text-lg font-extrabold leading-tight text-ink-900">{tile.label}</span>
            <span className="flex-1 text-xs text-ink-600">{tile.blurb}</span>
            <span className="text-[11px] uppercase tracking-wide text-accent">Browse →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
