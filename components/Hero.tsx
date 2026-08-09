'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BUSINESS } from '@/utils/data';
import { PublicProduct } from '@/types';

interface HeroProps {
  products: PublicProduct[];
}

export default function Hero({ products }: HeroProps) {
  const router = useRouter();

  const makes = useMemo(
    () => Array.from(new Set(products.map((p) => p.make))).sort(),
    [products],
  );
  const [make, setMake] = useState('');

  const models = useMemo(
    () =>
      Array.from(new Set(products.filter((p) => !make || p.make === make).map((p) => p.model))).sort(),
    [products, make],
  );
  const [model, setModel] = useState('');

  const handleFind = () => {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    router.push(params.toString() ? `/parts?${params}` : '/parts');
  };

  return (
    <section id="home" className="bg-accent text-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_340px] lg:items-end lg:py-24">
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.18em] opacity-85">
            {BUSINESS.address} · {BUSINESS.tagline}
          </div>
          <h1 className="font-display text-[clamp(38px,7vw,84px)] font-extrabold uppercase leading-[0.95] tracking-tight">
            The part is
            <br />
            already on
            <br />
            the shelf.
          </h1>
          <p className="mt-5 max-w-lg text-sm opacity-90 sm:text-base">
            New &amp; used spare parts for Toyota, Honda, Nissan, Mazda, Mitsubishi, Suzuki, Subaru,
            Hyundai and Kia. Priced in the open, negotiate what you pay, claim it instantly on
            WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/fit-finder" className="btn" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink-900)' }}>
              Find my part
            </a>
            <a href="/parts" className="btn" style={{ borderColor: 'currentColor', color: 'inherit' }}>
              Browse catalogue <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="bg-canvas p-5 text-ink-900">
          <h6 className="mb-3 text-[11px] uppercase tracking-[0.1em] text-accent">Fitment first</h6>
          <div className="grid gap-2.5">
            <div className="field">
              <label>Make</label>
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
            </div>
            <div className="field">
              <label>Model</label>
              <select className="input" value={model} onChange={(e) => setModel(e.target.value)} disabled={!models.length}>
                <option value="">Any model</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button onClick={handleFind} className="btn btn-primary btn-block justify-between">
              <span>Search parts</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
