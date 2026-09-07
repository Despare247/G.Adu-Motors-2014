'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { PublicProduct } from '@/types';
import { toIntlGhanaPhone } from '@/utils/phone';
import type { PurchaseDetails } from '@/components/PurchaseDetailsModal';

export type PurchaseStage = 'idle' | 'offering' | 'ready-to-pay' | 'paying' | 'paid';

/**
 * The offer/buy state machine, shared by every screen that
 * lets a customer negotiate or buy a part (Results row, PDP buy box, Cart
 * line). Extracted from PartCard so the same real negotiate logic
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
    fulfillmentType,
    isInKumasi,
    deliveryAddress,
  }: PurchaseDetails) => {
    if (!checkoutAmount) return;
    setError('');
    setSubmittingPayment(true);

    // Close our modal
    setModalOpen(false);

    // TODO: Implement payment integration
    setPaidAmount(checkoutAmount);
    setPaidDeliveryAddress(fulfillmentType === 'delivery' ? deliveryAddress : null);
    setStage('paid');
    setSubmittingPayment(false);
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
