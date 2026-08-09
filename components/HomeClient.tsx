'use client';

import Link from 'next/link';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import Hero from './Hero';
import Categories from './Categories';
import PartCard from './PartCard';
import BrandStrip from './BrandStrip';
import Services from './Services';
import About from './About';
import Contact from './Contact';

interface HomeClientProps {
  initialProducts: PublicProduct[];
}

const STATS: { n: string; l: string }[] = [
  { l: 'Years trading in Kumasi', n: '20+' },
  { l: 'Payment methods accepted', n: '4' },
  { l: 'Ready for pickup', n: '40 min' },
];

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const teaser = initialProducts.slice(0, 6);

  return (
    <>
      <Hero products={initialProducts} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 border-b-2 border-[color:var(--color-divider)] sm:grid-cols-4">
          <div className="border-r border-[color:var(--color-divider)] py-6 pr-4">
            <div className="font-display text-3xl font-extrabold tracking-tight">{initialProducts.length}</div>
            <div className="mt-1 text-xs text-ink-600">Parts on the shelf right now</div>
          </div>
          {STATS.map((s) => (
            <div key={s.l} className="border-r border-[color:var(--color-divider)] py-6 pr-4 last:border-r-0">
              <div className="font-display text-3xl font-extrabold tracking-tight">{s.n}</div>
              <div className="mt-1 text-xs text-ink-600">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Categories />

      <section id="inventory" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-baseline justify-between border-b-2 border-[color:var(--color-divider)] pb-3">
          <h2 className="font-display text-2xl font-extrabold uppercase text-ink-900">In stock today</h2>
          <Link href="/parts" className="text-sm text-accent hover:underline">
            All parts →
          </Link>
        </div>
        {teaser.length === 0 ? (
          <div className="border border-dashed border-[color:var(--color-divider)] py-16 text-center">
            <p className="text-sm font-semibold text-ink-700">No parts in inventory yet.</p>
            <p className="text-sm text-ink-500">Check back soon — {BUSINESS.name} is stocking up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {teaser.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </section>

      <BrandStrip />
      <Services />
      <About />
      <Contact />
    </>
  );
}
