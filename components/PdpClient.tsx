'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import {
  ShoppingBag,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Check,
} from 'lucide-react';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import { finalizeKumasiOrderLink } from '@/utils/whatsapp';
import { usePartPurchase } from '@/hooks/usePartPurchase';
import { useCart } from '@/contexts/CartContext';
import PartThumb from './PartThumb';
import PurchaseDetailsModal from './PurchaseDetailsModal';

export default function PdpClient({ part }: { part: PublicProduct }) {
  const p = usePartPurchase(part);
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const specs: { k: string; v: string }[] = [
    { k: 'Make', v: part.make },
    { k: 'Model', v: part.model },
    { k: 'Year', v: String(part.year) },
    { k: 'Origin', v: part.origin },
    { k: 'Condition', v: part.condition },
  ];

  const handleAddToCart = () => {
    cart.add(part.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 text-xs text-ink-500">
        <Link href="/parts" className="hover:text-accent">Catalogue</Link> · {part.name}
      </div>

      <div className="grid gap-9 lg:grid-cols-[1fr_400px] lg:items-start">
        <div>
          <div className="aspect-[16/10] overflow-hidden border border-[color:var(--color-divider)] bg-ink-100">
            <PartThumb imageUrl={part.image_url} name={part.name} />
          </div>

          <hr className="hr" />
          <h4>Specification</h4>
          <table className="table">
            <tbody>
              {specs.map((s) => (
                <tr key={s.k}>
                  <td className="w-[160px] text-ink-600">{s.k}</td>
                  <td className="font-semibold">{s.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:sticky lg:top-24 flex flex-col gap-3.5">
          <div>
            <span className="tag tag-accent mb-2 inline-flex">{part.condition}</span>
            <h1 className="mt-1 text-[27px] font-extrabold leading-tight">{part.name}</h1>
            <div className="text-sm text-ink-600">
              {part.make} {part.model} · {part.year} · {part.origin}
            </div>
          </div>

          <div className="border-y-2 border-[color:var(--color-divider)] py-3.5">
            <div className="font-display text-[34px] font-extrabold leading-none tracking-tight">
              {BUSINESS.currency} {part.retail_price.toLocaleString()}
            </div>
            <div className="mt-1.5 text-xs text-ink-500">Negotiate a price below list — subject to shop approval.</div>
          </div>

          {p.stage === 'idle' && (
            <div className="flex flex-col gap-2">
              <button onClick={p.startBuyNow} className="btn btn-primary btn-block justify-between text-[15px]">
                <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Buy now</span>
                <span>{BUSINESS.currency} {part.retail_price.toLocaleString()}</span>
              </button>
              <button onClick={p.startOffer} className="btn btn-secondary btn-block justify-center">
                Make an offer
              </button>
              <button onClick={handleAddToCart} className="btn btn-secondary btn-block justify-center">
                <ShoppingCart className="h-4 w-4" /> {added ? 'Added to cart' : cart.has(part.id) ? 'In cart' : 'Add to cart'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {p.stage === 'offering' && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={p.submitOffer}
                className="flex flex-col gap-2 overflow-hidden border border-[color:var(--color-divider)] p-3.5"
              >
                <span className="text-[10px] uppercase tracking-wide text-ink-500">Your offer</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={p.offerValue}
                    onChange={(e) => p.setOfferValue(e.target.value)}
                    placeholder={`Amount (${BUSINESS.currency})`}
                    className="input flex-1"
                  />
                  <button type="submit" disabled={p.negotiating} className="btn btn-secondary">
                    {p.negotiating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send offer'}
                  </button>
                </div>
                <button type="button" onClick={p.reset} className="btn btn-ghost self-start">Cancel</button>
              </motion.form>
            )}
          </AnimatePresence>

          {p.offerMessage && !p.offerMessage.ok && (
            <div className="border border-[color:var(--color-divider)] p-3 text-xs leading-relaxed text-ink-800">
              {p.offerMessage.text}
              <button onClick={p.startOffer} className="btn btn-ghost mt-2 block w-full text-center">Try a new offer</button>
            </div>
          )}

          {p.stage === 'paying' && (
            <div className="flex items-center justify-center gap-2 border border-[color:var(--color-divider)] p-3 text-xs text-ink-700">
              <Loader2 className="h-4 w-4 animate-spin text-accent" /> Confirming payment…
            </div>
          )}

          {p.stage === 'paid' && (
            <div className="border-l-2 border-accent bg-accent-100 p-3 text-xs leading-relaxed text-accent-800">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" /> Payment successful!</div>
              <p className="mt-1">
                {BUSINESS.currency} {p.paidAmount?.toLocaleString()} received for {part.name}.{' '}
                {p.paidDeliveryAddress ? "We'll be in touch to arrange your delivery." : `We'll be in touch to arrange pickup at our ${BUSINESS.city} branch.`}
              </p>
              {p.paidDeliveryAddress && (
                <a
                  href={finalizeKumasiOrderLink({
                    amount: p.paidAmount ?? 0,
                    partName: part.name,
                    reference: p.paidReference,
                    deliveryAddress: p.paidDeliveryAddress,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block mt-3 justify-center"
                >
                  <MessageCircle className="h-4 w-4" /> Finalize with shop on WhatsApp
                </a>
              )}
            </div>
          )}

          {p.error && (
            <div className="flex items-start gap-2 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-3 text-xs font-medium text-danger-600">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {p.error}
            </div>
          )}

          <div className="grid gap-2 text-xs text-ink-700">
            <div className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" /><span><strong>Delivery</strong> — within Kumasi, arranged after payment. Outside Kumasi via WhatsApp.</span></div>
            <div className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" /><span><strong>Pickup</strong> — free at our {BUSINESS.city} branch, {BUSINESS.address}.</span></div>
            <div className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" /><span><strong>Payment</strong> — MTN MoMo, Telecel Cash, AT Money or card via Paystack.</span></div>
          </div>
        </div>
      </div>

      <PurchaseDetailsModal
        open={p.modalOpen && p.checkoutAmount !== null}
        productName={part.name}
        condition={part.condition}
        amount={p.checkoutAmount ?? 0}
        submitting={p.submittingPayment}
        onClose={p.closeModal}
        onConfirm={p.handlePurchaseConfirm}
      />
    </div>
  );
}
