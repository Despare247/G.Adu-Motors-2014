'use client';

import { useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PublicProduct, Origin, Condition } from '@/types';
import PartCard from './PartCard';
import { InventoryGridSkeleton } from './Skeletons';

interface InventoryProps {
  products: PublicProduct[];
  loading: boolean;
  search: string;
  origin: Origin | '';
  condition: Condition | '';
  onSearchChange: (v: string) => void;
  onOriginChange: (v: Origin | '') => void;
  onConditionChange: (v: Condition | '') => void;
}

export default function Inventory({
  products,
  loading,
  search,
  origin,
  condition,
  onSearchChange,
  onOriginChange,
  onConditionChange,
}: InventoryProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (origin && p.origin !== origin) return false;
      if (condition && p.condition !== condition) return false;
      if (q) {
        const haystack = `${p.name} ${p.make} ${p.model}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, origin, condition]);

  return (
    <section id="inventory" className="bg-ink-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            The Shop Floor
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase text-white">
            Live Inventory &amp; Negotiation
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            {loading ? 'Loading parts…' : `Showing ${filtered.length} of ${products.length} parts — name your price.`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center rounded-lg border border-ink-700 bg-ink-900">
            <Search className="ml-3 h-4 w-4 shrink-0 text-ink-500" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, make or model…"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <SlidersHorizontal className="hidden h-4 w-4 sm:block" />
            <select
              value={origin}
              onChange={(e) => onOriginChange(e.target.value as Origin | '')}
              className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm font-medium text-ink-200 outline-none focus:border-gold-500/60 cursor-pointer"
            >
              <option value="">All Origins</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
            </select>
            <select
              value={condition}
              onChange={(e) => onConditionChange(e.target.value as Condition | '')}
              className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm font-medium text-ink-200 outline-none focus:border-gold-500/60 cursor-pointer"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>

        {loading ? (
          <InventoryGridSkeleton />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900 py-16 text-center">
            <p className="text-sm font-semibold text-ink-300">No parts match your filters.</p>
            <p className="text-sm text-ink-500">Try a different search term, origin or condition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {filtered.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
