'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, ShoppingBag, Loader2, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react';
import { PublicProduct } from '@/types';
import { BUSINESS } from '@/utils/data';
import { openPaystackCheckout } from '@/utils/paystack';
import { toIntlGhanaPhone } from '@/utils/phone';
import { finalizeKumasiOrderLink } from '@/utils/whatsapp';
import PartThumb from './PartThumb';
import PurchaseDetailsModal, { PurchaseDetails } from './PurchaseDetailsModal';

interface PartCardProps {
  part: PublicProduct;
}

type Stage = 'idle' | 'offering' | 'ready-to-pay' | 'paying' | 'paid';

export default function PartCard({ part }: PartCardProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [offerValue, setOfferValue] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [offerMessage, setOfferMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [error, setError] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [paidReference, setPaidReference] = useState('');
  const [paidDeliveryAddress, setPaidDeliveryAddress] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const startBuyNow = () => {
    setError('');
    setOfferMessage(null);
    setCheckoutAmount(part.retail_price);
    setModalOpen(true);
  };

  const startOffer = () => {
    setError('');
    setOfferMessage(null);
    setStage('offering');
  };

  const submitOffer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = Number(offerValue);
    if (!amount || amount <= 0) {
      setError('Enter a valid offer amount.');
      return;
    }
    setError('');
    setNegotiating(true);
    setOfferMessage(null);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: part.id, offerAmount: amount }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not check your offer. Please try again.');
        return;
      }

      if (json.accepted) {
        // Accepted offers unlock the purchase form; a below-floor offer never does.
        setOfferMessage({ ok: true, text: json.message });
        setCheckoutAmount(json.negotiatedAmount);
        setStage('ready-to-pay');
        setModalOpen(true);
      } else {
        setStage('offering');
        setOfferMessage({ ok: false, text: json.message });
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setNegotiating(false);
    }
  };

  const handlePurchaseConfirm = ({
    name,
    phone,
    network,
    fulfillmentType,
    isInKumasi,
    deliveryAddress,
  }: PurchaseDetails) => {
    if (!checkoutAmount) return;
    setError('');
    setSubmittingPayment(true);

    // Paystack requires a syntactically valid email to initialize a
    // transaction. The purchase form intentionally only collects name/phone/
    // network (per spec), so we derive a harmless placeholder from the
    // phone number rather than asking the customer to type an email.
    const placeholderEmail = `${toIntlGhanaPhone(phone).replace('+', '')}@customer.gadumotors.com`;

    // Close our modal before handing off to Paystack's own popup so the two
    // never stack, and so any onClose/onError feedback below is visible on
    // the card instead of being hidden behind this modal.
    setModalOpen(false);

    openPaystackCheckout({
      email: placeholderEmail,
      amountGhs: checkoutAmount,
      metadata: {
        productId: part.id,
        productName: part.name,
        customerName: name,
        customerPhone: toIntlGhanaPhone(phone),
        momoNetwork: network,
        fulfillmentType,
      },
      onSuccess: async (reference) => {
        setStage('paying');
        try {
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference,
              productId: part.id,
              buyerName: name,
              buyerPhone: toIntlGhanaPhone(phone),
              momoNetwork: network,
              fulfillmentType,
              isInKumasi,
              deliveryAddress,
            }),
          });
          const json = await res.json();

          if (!res.ok) {
            setError(json.error ?? 'Payment could not be verified. Please contact us with your reference.');
            setStage('idle');
            return;
          }

          setPaidAmount(json.amountPaid);
          setPaidReference(reference);
          setPaidDeliveryAddress(fulfillmentType === 'delivery' ? deliveryAddress : null);
          setStage('paid');
        } catch {
          setError('Payment succeeded but we could not confirm it — please contact us with your reference.');
          setStage('idle');
        } finally {
          setSubmittingPayment(false);
        }
      },
      onClose: () => {
        setSubmittingPayment(false);
        setStage('idle');
      },
      onError: (message) => {
        setSubmittingPayment(false);
        setError(message);
        setStage('idle');
      },
    });
  };

  const reset = () => {
    setStage('idle');
    setOfferValue('');
    setOfferMessage(null);
    setError('');
    setCheckoutAmount(null);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-lg shadow-black/40"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-ink-800">
          <PartThumb imageUrl={part.image_url} name={part.name} />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gold-400">
            <span>{part.origin}</span>
          </div>
          <h3 className="mt-1 text-sm font-bold leading-snug text-white">{part.name}</h3>
          <p className="mt-0.5 text-xs text-ink-400">
            {part.make} {part.model} • {part.year}
          </p>

          <span
            className={`mt-2 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              part.condition === 'New'
                ? 'border-gold-500/30 bg-gold-500/10 text-gold-300'
                : 'border-ink-400/30 bg-white/5 text-ink-300'
            }`}
          >
            <Tag className="h-3 w-3" /> {part.condition}
          </span>

          <div className="mt-3 text-xl font-extrabold text-white">
            {BUSINESS.currency} {part.retail_price.toLocaleString()}
          </div>

          {stage === 'idle' && (
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={startBuyNow}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> Buy Now
              </button>
              <button
                onClick={startOffer}
                className="w-full rounded-lg border border-gold-500/50 bg-transparent py-2.5 text-xs font-bold uppercase tracking-wide text-gold-400 transition hover:bg-gold-500/10 cursor-pointer"
              >
                Make an Offer
              </button>
            </div>
          )}

          <AnimatePresence>
            {stage === 'offering' && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={submitOffer}
                className="mt-3 flex flex-col gap-2 overflow-hidden"
              >
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  placeholder={`Your offer (${BUSINESS.currency})`}
                  className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-white placeholder:text-ink-500 outline-none focus:border-gold-500/60"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={negotiating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-500 py-2 text-xs font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 disabled:opacity-60 cursor-pointer"
                  >
                    {negotiating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {negotiating ? 'Checking…' : 'Submit Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg border border-ink-700 px-3 text-xs font-bold uppercase tracking-wide text-ink-400 transition hover:text-ink-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {offerMessage && !offerMessage.ok && (
            <div className="mt-3 rounded-lg border border-ink-300/25 bg-white/[0.04] p-3 text-xs font-medium leading-relaxed text-ink-100">
              {offerMessage.text}
              <button
                onClick={startOffer}
                className="mt-2 block w-full text-center text-[11px] font-semibold uppercase tracking-wide text-ink-400 hover:text-white cursor-pointer"
              >
                Try a new offer
              </button>
            </div>
          )}

          {stage === 'paying' && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-ink-700 bg-ink-800 p-3 text-xs font-medium text-ink-300">
              <Loader2 className="h-4 w-4 animate-spin text-gold-400" /> Confirming payment…
            </div>
          )}

          {stage === 'paid' && (
            <div className="mt-3 rounded-lg border border-gold-500/40 bg-gold-500/5 p-3 text-xs font-medium leading-relaxed text-ink-100">
              <div className="flex items-center gap-2 font-bold text-gold-300">
                <CheckCircle2 className="h-4 w-4" /> Payment successful!
              </div>
              <p className="mt-1 text-ink-300">
                Thank you — {BUSINESS.currency} {paidAmount?.toLocaleString()} received for {part.name}.{' '}
                {paidDeliveryAddress
                  ? "We'll be in touch to arrange your delivery."
                  : `We'll be in touch to arrange pickup at our ${BUSINESS.city} branch.`}
              </p>
              {paidDeliveryAddress && (
                <a
                  href={finalizeKumasiOrderLink({
                    amount: paidAmount ?? 0,
                    partName: part.name,
                    reference: paidReference,
                    deliveryAddress: paidDeliveryAddress,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" /> Finalize with Shop on WhatsApp
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-500/10 p-3 text-xs font-medium leading-relaxed text-danger-400">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      </motion.div>

      <PurchaseDetailsModal
        open={modalOpen && checkoutAmount !== null}
        productName={part.name}
        condition={part.condition}
        amount={checkoutAmount ?? 0}
        submitting={submittingPayment}
        onClose={() => {
          setModalOpen(false);
          if (stage === 'ready-to-pay') setStage('idle');
        }}
        onConfirm={handlePurchaseConfirm}
      />
    </>
  );
}
