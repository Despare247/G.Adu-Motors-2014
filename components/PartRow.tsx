'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Loader2, MessageCircle, X } from 'lucide-react';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import { finalizeKumasiOrderLink } from '@/utils/whatsapp';
import { usePartPurchase } from '@/hooks/usePartPurchase';
import PartThumb from './PartThumb';
import PurchaseDetailsModal from './PurchaseDetailsModal';

interface PartRowProps {
  part: PublicProduct;
  onRemove?: () => void;
}

export default function PartRow({ part, onRemove }: PartRowProps) {
  const p = usePartPurchase(part);

  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 border-b border-[color:var(--color-divider)] py-4 sm:grid-cols-[150px_1fr_auto] sm:gap-5">
      <Link href={`/parts/${part.id}`} className="aspect-[4/3] overflow-hidden border border-[color:var(--color-divider)] bg-ink-100">
        <PartThumb imageUrl={part.image_url} name={part.name} />
      </Link>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="tag tag-accent">{part.condition}</span>
          <span className="text-[10px] uppercase tracking-wide text-ink-500">{part.origin}</span>
        </div>
        <Link href={`/parts/${part.id}`} className="font-display text-base font-extrabold leading-tight text-ink-900 hover:text-accent sm:text-lg">
          {part.name}
        </Link>
        <div className="mt-1 text-xs text-ink-600 sm:text-sm">
          {part.make} {part.model} · {part.year}
        </div>

        {/* Small screens: price + actions stack under the details */}
        <div className="mt-3 sm:hidden">
          <PartRowActions part={part} p={p} onRemove={onRemove} />
        </div>
      </div>

      <div className="col-span-2 hidden min-w-[200px] flex-col items-end gap-2 sm:col-span-1 sm:flex">
        <PartRowActions part={part} p={p} onRemove={onRemove} align="end" />
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

function PartRowActions({
  part,
  p,
  onRemove,
  align = 'start',
}: {
  part: PublicProduct;
  p: ReturnType<typeof usePartPurchase>;
  onRemove?: () => void;
  align?: 'start' | 'end';
}) {
  return (
    <div className={`flex w-full flex-col gap-2 ${align === 'end' ? 'items-end text-right' : ''}`}>
      <div className="font-display text-lg font-extrabold text-ink-900 sm:text-xl">
        {BUSINESS.currency} {part.retail_price.toLocaleString()}
      </div>

      {p.stage === 'idle' && (
        <div className="flex gap-2">
          <button onClick={p.startBuyNow} className="btn btn-primary">Buy now</button>
          <button onClick={p.startOffer} className="btn btn-secondary">Make offer</button>
          {onRemove && (
            <button onClick={onRemove} className="btn btn-ghost" title="Remove">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {p.stage === 'offering' && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={p.submitOffer}
            className="flex w-full max-w-[240px] flex-col gap-2 overflow-hidden"
          >
            <input
              type="number"
              min="1"
              autoFocus
              value={p.offerValue}
              onChange={(e) => p.setOfferValue(e.target.value)}
              placeholder={`Offer (${BUSINESS.currency})`}
              className="input"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={p.negotiating} className="btn btn-primary flex-1 justify-center">
                {p.negotiating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {p.negotiating ? 'Checking…' : 'Send offer'}
              </button>
              <button type="button" onClick={p.reset} className="btn btn-secondary">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {p.offerMessage && !p.offerMessage.ok && (
        <div className="max-w-[260px] border border-[color:var(--color-divider)] p-2.5 text-xs leading-relaxed text-ink-800">
          {p.offerMessage.text}
          <button onClick={p.startOffer} className="btn btn-ghost mt-1.5 block w-full text-center">Try again</button>
        </div>
      )}

      {p.stage === 'paying' && (
        <div className="flex items-center gap-2 text-xs text-ink-700">
          <Loader2 className="h-4 w-4 animate-spin text-accent" /> Confirming payment…
        </div>
      )}

      {p.stage === 'paid' && (
        <div className="max-w-[280px] border-l-2 border-accent bg-accent-100 p-3 text-xs leading-relaxed text-accent-800">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Payment successful!
          </div>
          <p className="mt-1">
            {BUSINESS.currency} {p.paidAmount?.toLocaleString()} received.{' '}
            {p.paidDeliveryAddress ? "We'll be in touch to arrange delivery." : `We'll be in touch to arrange pickup.`}
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
              className="btn btn-primary btn-block mt-2 justify-center"
            >
              <MessageCircle className="h-4 w-4" /> Finalize on WhatsApp
            </a>
          )}
        </div>
      )}

      {p.error && (
        <div className="flex max-w-[260px] items-start gap-2 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-2.5 text-xs font-medium text-danger-600">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {p.error}
        </div>
      )}
    </div>
  );
}
