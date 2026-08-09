'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Loader2, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import { finalizeKumasiOrderLink } from '@/utils/whatsapp';
import { usePartPurchase } from '@/hooks/usePartPurchase';
import PartThumb from './PartThumb';
import PurchaseDetailsModal from './PurchaseDetailsModal';

interface PartCardProps {
  part: PublicProduct;
}

export default function PartCard({ part }: PartCardProps) {
  const p = usePartPurchase(part);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col border border-[color:var(--color-divider)] bg-panel"
      >
        <Link href={`/parts/${part.id}`} className="aspect-[4/3] w-full overflow-hidden bg-ink-100">
          <PartThumb imageUrl={part.image_url} name={part.name} />
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="tag tag-neutral">{part.condition}</span>
            <span className="text-[10px] uppercase tracking-wider text-ink-500">{part.origin}</span>
          </div>
          <Link href={`/parts/${part.id}`} className="mt-2 text-sm font-extrabold leading-snug text-ink-900 hover:text-accent">
            {part.name}
          </Link>
          <p className="mt-0.5 text-xs text-ink-600">
            {part.make} {part.model} · {part.year}
          </p>

          <div className="mt-3 font-display text-xl font-extrabold text-ink-900">
            {BUSINESS.currency} {part.retail_price.toLocaleString()}
          </div>

          {p.stage === 'idle' && (
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={p.startBuyNow} className="btn btn-primary btn-block justify-center">
                <ShoppingBag className="h-4 w-4" /> Buy now
              </button>
              <button onClick={p.startOffer} className="btn btn-secondary btn-block justify-center">
                Make an offer
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
                className="mt-3 flex flex-col gap-2 overflow-hidden"
              >
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={p.offerValue}
                  onChange={(e) => p.setOfferValue(e.target.value)}
                  placeholder={`Your offer (${BUSINESS.currency})`}
                  className="input"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={p.negotiating} className="btn btn-primary flex-1 justify-center">
                    {p.negotiating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {p.negotiating ? 'Checking…' : 'Submit offer'}
                  </button>
                  <button type="button" onClick={p.reset} className="btn btn-secondary">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {p.offerMessage && !p.offerMessage.ok && (
            <div className="mt-3 border border-[color:var(--color-divider)] p-3 text-xs leading-relaxed text-ink-800">
              {p.offerMessage.text}
              <button onClick={p.startOffer} className="btn btn-ghost mt-2 block w-full text-center">
                Try a new offer
              </button>
            </div>
          )}

          {p.stage === 'paying' && (
            <div className="mt-3 flex items-center justify-center gap-2 border border-[color:var(--color-divider)] p-3 text-xs text-ink-700">
              <Loader2 className="h-4 w-4 animate-spin text-accent" /> Confirming payment…
            </div>
          )}

          {p.stage === 'paid' && (
            <div className="mt-3 border-l-2 border-accent bg-accent-100 p-3 text-xs leading-relaxed text-accent-800">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Payment successful!
              </div>
              <p className="mt-1">
                Thank you — {BUSINESS.currency} {p.paidAmount?.toLocaleString()} received for {part.name}.{' '}
                {p.paidDeliveryAddress
                  ? "We'll be in touch to arrange your delivery."
                  : `We'll be in touch to arrange pickup at our ${BUSINESS.city} branch.`}
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
            <div className="mt-3 flex items-start gap-2 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-3 text-xs font-medium text-danger-600">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {p.error}
            </div>
          )}
        </div>
      </motion.div>

      <PurchaseDetailsModal
        open={p.modalOpen && p.checkoutAmount !== null}
        productName={part.name}
        condition={part.condition}
        amount={p.checkoutAmount ?? 0}
        submitting={p.submittingPayment}
        onClose={p.closeModal}
        onConfirm={p.handlePurchaseConfirm}
      />
    </>
  );
}
