'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useCart } from '@/contexts/CartContext';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import PartRow from '@/components/PartRow';

export default function CartPage() {
  const { productIds, remove } = useCart();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('public_products')
      .select('id, name, origin, make, model, year, condition, retail_price, image_url, created_at')
      .in('id', productIds)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error) setProducts(data ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productIds]);

  const subtotal = products.reduce((sum, p) => sum + p.retail_price, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="mb-1">Your cart</h2>
      <p className="mb-5 text-sm text-ink-600">
        {products.length} part{products.length === 1 ? '' : 's'} saved. Pay for each part individually
        below — the order summary is just a running total.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your cart…
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-[color:var(--color-divider)] py-16 text-center">
          <p className="text-sm font-semibold text-ink-700">No parts yet.</p>
          <Link href="/parts" className="mt-1 inline-block text-sm text-accent hover:underline">
            Browse the catalogue →
          </Link>
        </div>
      ) : (
        <>
          <div>
            {products.map((part) => (
              <PartRow key={part.id} part={part} onRemove={() => remove(part.id)} />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs border-2 border-ink-900 p-4">
              <h6 className="mb-2.5">Running total</h6>
              <div className="flex justify-between text-sm">
                <span>Parts ({products.length})</span>
                <span className="font-semibold">{BUSINESS.currency} {subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-3 text-[11px] text-ink-500">
                Each line pays separately via Paystack — fulfilment (pickup/delivery) and payment method are
                chosen per part when you click Buy now or accept an offer.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
