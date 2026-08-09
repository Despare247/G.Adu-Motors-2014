'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicProduct } from '@/types';
import { openPaystackCheckout } from '@/utils/paystack';
import { toIntlGhanaPhone } from '@/utils/phone';
import type { PurchaseDetails } from '@/components/PurchaseDetailsModal';

export type PurchaseStage = 'idle' | 'offering' | 'ready-to-pay' | 'paying' | 'paid';

/**
 * The offer/buy/Paystack/verify state machine, shared by every screen that
 * lets a customer negotiate or buy a part (Results row, PDP buy box, Cart
 * line). Extracted from PartCard so the same real negotiate + payment logic
 * isn't duplicated three times.
 */
export function usePartPurchase(part: PublicProduct) {
  const [stage, setStage] = useState<PurchaseStage>('idle');
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
    // the caller instead of being hidden behind this modal.
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

  return {
    stage,
    offerValue,
    setOfferValue,
    checkoutAmount,
    negotiating,
    offerMessage,
    error,
    paidAmount,
    paidReference,
    paidDeliveryAddress,
    modalOpen,
    submittingPayment,
    startBuyNow,
    startOffer,
    submitOffer,
    handlePurchaseConfirm,
    reset,
    closeModal: () => {
      setModalOpen(false);
      if (stage === 'ready-to-pay') setStage('idle');
    },
  };
}
