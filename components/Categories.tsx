'use client';

import { motion } from 'motion/react';
import { Flag, Sparkles, RotateCcw, LucideIcon } from 'lucide-react';
import type { Origin, Condition } from '@/types';

export interface QuickFilter {
  origin?: Origin;
  condition?: Condition;
}

interface CategoriesProps {
  onSelect: (filter: QuickFilter) => void;
}

const TILES: { label: string; blurb: string; icon: LucideIcon; filter: QuickFilter }[] = [
  {
    label: 'Japanese Parts',
    blurb: 'Toyota, Honda, Nissan, Mazda & more',
    icon: Flag,
    filter: { origin: 'Japanese' },
  },
  {
    label: 'Korean Parts',
    blurb: 'Hyundai, Kia',
    icon: Flag,
    filter: { origin: 'Korean' },
  },
  {
    label: 'New Parts',
    blurb: 'Sealed, unused stock',
    icon: Sparkles,
    filter: { condition: 'New' },
  },
  {
    label: 'Used Parts',
    blurb: 'Quality-tested take-offs',
    icon: RotateCcw,
    filter: { condition: 'Used' },
  },
];

export default function Categories({ onSelect }: CategoriesProps) {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
      <div className="rounded-2xl bg-white p-5 sm:p-7 shadow-xl ring-1 ring-ink-100">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-ink-900">
              Shop by Origin &amp; Condition
            </h2>
            <p className="text-sm text-ink-500">Jump straight to what your vehicle needs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {TILES.map((tile, i) => (
            <motion.button
              key={tile.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelect(tile.filter)}
              className="group flex flex-col items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/40 p-4 text-center transition hover:border-gold-300 hover:bg-gold-50 cursor-pointer"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ink-800 shadow-sm ring-1 ring-ink-100 transition group-hover:bg-gold-500 group-hover:text-white">
                <tile.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold text-ink-900">{tile.label}</span>
              <span className="text-xs text-ink-500">{tile.blurb}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
