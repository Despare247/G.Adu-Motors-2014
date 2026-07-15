'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Smartphone, AlertTriangle, MapPin, Store, Truck, MessageCircle } from 'lucide-react';
import { FulfillmentType, MomoNetwork } from '@/types';
import { BUSINESS } from '@/utils/data';
import { isValidGhanaPhone } from '@/utils/phone';
import { outsideKumasiDeliveryLink } from '@/utils/whatsapp';

export interface PurchaseDetails {
  name: string;
  phone: string;
  network: MomoNetwork;
  fulfillmentType: FulfillmentType;
  isInKumasi: boolean | null;
  deliveryAddress: string | null;
}

interface PurchaseDetailsModalProps {
  open: boolean;
  productName: string;
  condition: string;
  amount: number;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (details: PurchaseDetails) => void;
}

const NETWORKS: MomoNetwork[] = ['MTN MoMo', 'Telecel Cash', 'AT Money'];

export default function PurchaseDetailsModal({
  open,
  productName,
  condition,
  amount,
  submitting,
  onClose,
  onConfirm,
}: PurchaseDetailsModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<MomoNetwork>(NETWORKS[0]);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [isInKumasi, setIsInKumasi] = useState<boolean | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [error, setError] = useState('');

  const outsideKumasi = fulfillmentType === 'delivery' && isInKumasi === false;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (!isValidGhanaPhone(phone)) {
      setError('Enter a valid Ghanaian mobile number, e.g. 024 123 4567.');
      return;
    }
    if (fulfillmentType === 'delivery' && isInKumasi === null) {
      setError('Let us know if you are located within Kumasi.');
      return;
    }
    if (fulfillmentType === 'delivery' && isInKumasi === true && !deliveryAddress.trim()) {
      setError('Enter your delivery address / landmark in Kumasi.');
      return;
    }

    setError('');
    onConfirm({
      name: name.trim(),
      phone: phone.trim(),
      network,
      fulfillmentType,
      isInKumasi,
      deliveryAddress: fulfillmentType === 'delivery' && isInKumasi ? deliveryAddress.trim() : null,
    });
  };

  const handleWhatsAppHandoff = () => {
    const link = outsideKumasiDeliveryLink({ partName: productName, condition, price: amount });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-ink-950/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed left-1/2 top-1/2 z-[81] max-h-[90vh] w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-ink-300/20 bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 bg-ink-950 px-5 py-4">
              <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-white">
                Purchase Details
              </h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <p className="mb-4 text-sm text-ink-600">
                {productName} —{' '}
                <span className="font-bold text-ink-900">
                  {BUSINESS.currency} {amount.toLocaleString()}
                </span>
              </p>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Full Name
                </span>
                <div className="flex items-center rounded-lg border border-ink-200 bg-ink-50 px-3 focus-within:border-gold-500">
                  <User className="h-4 w-4 shrink-0 text-ink-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none"
                    required
                  />
                </div>
              </label>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Phone Number
                </span>
                <div className="flex items-center rounded-lg border border-ink-200 bg-ink-50 px-3 focus-within:border-gold-500">
                  <Phone className="h-4 w-4 shrink-0 text-ink-400" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none"
                    required
                  />
                </div>
              </label>

              <label className="mb-4 block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Mobile Money Network
                </span>
                <div className="flex items-center rounded-lg border border-ink-200 bg-ink-50 px-3 focus-within:border-gold-500">
                  <Smartphone className="h-4 w-4 shrink-0 text-ink-400" />
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as MomoNetwork)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none cursor-pointer"
                  >
                    {NETWORKS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Smart Logistics Selector */}
              <div className="mb-4">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Fulfillment Method
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFulfillmentType('pickup');
                      setIsInKumasi(null);
                      setDeliveryAddress('');
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
                      fulfillmentType === 'pickup'
                        ? 'border-gold-500 bg-gold-500/10 text-ink-900'
                        : 'border-ink-200 bg-ink-50 text-ink-500 hover:border-ink-300'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5" /> Store Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-bold uppercase tracking-wide transition cursor-pointer ${
                      fulfillmentType === 'delivery'
                        ? 'border-gold-500 bg-gold-500/10 text-ink-900'
                        : 'border-ink-200 bg-ink-50 text-ink-500 hover:border-ink-300'
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" /> Delivery
                  </button>
                </div>
              </div>

              {fulfillmentType === 'pickup' && (
                <p className="mb-4 rounded-lg border border-gold-500/30 bg-gold-500/5 p-3 text-xs font-semibold leading-relaxed text-gold-600">
                  You will pick up your item at our shop in Suame Magazine, Kumasi after successful payment.
                </p>
              )}

              {fulfillmentType === 'delivery' && (
                <>
                  <label className="mb-4 block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Are you located within Kumasi?
                    </span>
                    <div className="flex items-center rounded-lg border border-ink-200 bg-ink-50 px-3 focus-within:border-gold-500">
                      <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                      <select
                        value={isInKumasi === null ? '' : isInKumasi ? 'yes' : 'no'}
                        onChange={(e) => setIsInKumasi(e.target.value === 'yes')}
                        className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select an option…
                        </option>
                        <option value="yes">Yes, within Kumasi</option>
                        <option value="no">No, outside Kumasi</option>
                      </select>
                    </div>
                  </label>

                  {isInKumasi === true && (
                    <label className="mb-4 block">
                      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Delivery Address / Landmark in Kumasi
                      </span>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Near Suame Roundabout, opposite the fuel station"
                        rows={3}
                        required
                        className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-gold-500"
                      />
                    </label>
                  )}

                  {outsideKumasi && (
                    <p className="mb-4 rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs font-medium leading-relaxed text-ink-600">
                      Inter-city delivery is arranged directly with the shop over WhatsApp — payment happens once
                      you've agreed on the waybill details.
                    </p>
                  )}
                </>
              )}

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-500/5 p-3 text-xs font-medium text-danger-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {outsideKumasi ? (
                <button
                  type="button"
                  onClick={handleWhatsAppHandoff}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-3 text-sm font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" /> Discuss Inter-City Delivery on WhatsApp
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-gold-500 py-3 text-sm font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Opening Payment…' : `Continue to Payment`}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-ink-400">
                    You'll pay via {network} or card on the next screen, secured by Paystack.
                  </p>
                </>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
