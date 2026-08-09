'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { PublicProduct } from '@/types';

export default function FitFinderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<PublicProduct[]>([]);

  useEffect(() => {
    supabase
      .from('public_products')
      .select('id, make, model, year')
      .then(({ data }) => setProducts((data as PublicProduct[]) ?? []));
  }, []);

  const makes = useMemo(() => Array.from(new Set(products.map((p) => p.make))).sort(), [products]);
  const [make, setMake] = useState('');
  const models = useMemo(
    () => Array.from(new Set(products.filter((p) => !make || p.make === make).map((p) => p.model))).sort(),
    [products, make],
  );
  const [model, setModel] = useState('');
  const years = useMemo(
    () => Array.from(new Set(products.filter((p) => !model || p.model === model).map((p) => p.year))).sort(),
    [products, model],
  );
  const [year, setYear] = useState('');

  const goResults = () => {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (year) params.set('year', year);
    router.push(`/parts?${params}`);
  };

  const [vin, setVin] = useState('');
  const [vinDecoded, setVinDecoded] = useState(false);
  const decodeVin = (e: FormEvent) => {
    e.preventDefault();
    // No real VIN-decoding service is wired up — this is an illustrative
    // demo of the flow, matching the design handoff prototype exactly.
    setVinDecoded(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h6 className="mb-2 text-accent">Fit finder · three routes to the same part</h6>
      <h2 className="mb-1.5">How do you know the car?</h2>
      <p className="max-w-xl text-sm text-ink-600">
        Know the model? Four taps and you're done. Know the chassis? Decode it exactly. Only have the old
        part in hand? Send a photo to the counter.
      </p>
      <hr className="hr" />

      <div className="grid gap-px bg-[color:var(--color-divider)] sm:grid-cols-3">
        <div className="bg-canvas p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-[22px] w-[22px] place-items-center bg-accent text-[12px] font-extrabold text-canvas">1</span>
            <span className="font-display text-[15px] font-extrabold">Make · Model · Year</span>
          </div>
          <p className="text-xs text-ink-600">For the everyday owner. No paperwork.</p>
          <div className="mt-2.5 grid gap-2">
            <div className="field">
              <label>Make</label>
              <select className="input" value={make} onChange={(e) => { setMake(e.target.value); setModel(''); setYear(''); }}>
                <option value="">Any make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Model</label>
              <select className="input" value={model} onChange={(e) => { setModel(e.target.value); setYear(''); }} disabled={!models.length}>
                <option value="">Any model</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Year</label>
              <select className="input" value={year} onChange={(e) => setYear(e.target.value)} disabled={!years.length}>
                <option value="">Any year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={goResults} className="btn btn-primary btn-block">
              Show matching parts
            </button>
          </div>
        </div>

        <div className="bg-canvas p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-[22px] w-[22px] place-items-center bg-accent text-[12px] font-extrabold text-canvas">2</span>
            <span className="font-display text-[15px] font-extrabold">Chassis / VIN</span>
          </div>
          <p className="text-xs text-ink-600">The fitter&apos;s route — decodes the exact trim and engine code.</p>
          <form onSubmit={decodeVin} className="field mt-2.5">
            <label>Chassis number</label>
            <input
              className="input"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="NZE141-1234567"
              style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
            />
          </form>
          {vinDecoded && (
            <div className="mt-2.5 border-l-2 border-accent bg-accent-100 p-2.5 text-xs text-accent-800">
              <div className="font-display font-extrabold">Demo decode — illustrative only</div>
              This flow isn&apos;t wired to a real VIN database yet; a shop attendant will confirm fitment when
              you place an order.
            </div>
          )}
          <button onClick={decodeVin} className="btn btn-secondary btn-block mt-2">Decode chassis</button>
        </div>

        <div className="bg-canvas p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-[22px] w-[22px] place-items-center bg-accent text-[12px] font-extrabold text-canvas">3</span>
            <span className="font-display text-[15px] font-extrabold">Photograph the old part</span>
          </div>
          <p className="text-xs text-ink-600">When nobody knows the name of it — snap the casting number.</p>
          <div className="mt-2.5 grid place-items-center gap-2 border-2 border-dashed border-[color:var(--color-divider)] py-6">
            <Camera className="h-6 w-6 text-ink-500" strokeWidth={1.6} />
            <div className="text-[11px] uppercase tracking-wide text-ink-500">Tap to take a photo</div>
          </div>
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> Send it to the counter thread — a shop
            attendant replies there.
          </div>
          <a href="/chat" className="btn btn-secondary btn-block mt-2">Send to the counter thread</a>
        </div>
      </div>
    </div>
  );
}
