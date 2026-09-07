'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, AlertTriangle, MapPin, Store, Truck, MessageCircle } from 'lucide-react';
import { FulfillmentType } from '@/types';
import { BUSINESS } from '@/utils/data';
import { isValidGhanaPhone } from '@/utils/phone';
import { outsideKumasiDeliveryLink } from '@/utils/whatsapp';

export interface PurchaseDetails {
  name: string;
  phone: string;
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="dialog-backdrop fixed inset-0 z-[80]"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="dialog z-[81] max-h-[90vh] w-[min(460px,92vw)] overflow-y-auto p-0"
          >
            <div className="flex items-center justify-between border-b-2 border-[color:var(--color-divider)] px-5 py-4">
              <h3 className="dialog-title">Purchase details</h3>
              <button onClick={onClose} aria-label="Close" className="btn btn-icon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <p className="mb-4 text-sm text-ink-700">
                {productName} — <span className="font-bold text-ink-900">{BUSINESS.currency} {amount.toLocaleString()}</span>
              </p>

              <div className="field mb-3">
                <label>Full name</label>
                <div className="flex items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2">
                  <User className="h-4 w-4 shrink-0 text-ink-500" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="input border-0 bg-transparent px-1"
                    required
                  />
                </div>
              </div>

              <div className="field mb-3">
                <label>Phone number</label>
                <div className="flex items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2">
                  <Phone className="h-4 w-4 shrink-0 text-ink-500" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="input border-0 bg-transparent px-1"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <span className="mb-1.5 block text-xs text-ink-600">Fulfilment method</span>
                <div className="seg w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFulfillmentType('pickup');
                      setIsInKumasi(null);
                      setDeliveryAddress('');
                    }}
                    className="seg-opt flex-1 justify-center"
                    style={fulfillmentType === 'pickup' ? { background: 'var(--color-accent)', color: 'var(--color-canvas)' } : undefined}
                  >
                    <Store className="h-3.5 w-3.5" /> Store pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className="seg-opt flex-1 justify-center"
                    style={fulfillmentType === 'delivery' ? { background: 'var(--color-accent)', color: 'var(--color-canvas)' } : undefined}
                  >
                    <Truck className="h-3.5 w-3.5" /> Delivery
                  </button>
                </div>
              </div>

              {fulfillmentType === 'pickup' && (
                <p className="tag-accent mb-4 block px-3 py-2 text-xs leading-relaxed">
                  You will pick up your item at our shop in Suame Magazine, Kumasi after successful payment.
                </p>
              )}

              {fulfillmentType === 'delivery' && (
                <>
                  <div className="field mb-4">
                    <label>Are you located within Kumasi?</label>
                    <div className="flex items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2">
                      <MapPin className="h-4 w-4 shrink-0 text-ink-500" />
                      <select
                        value={isInKumasi === null ? '' : isInKumasi ? 'yes' : 'no'}
                        onChange={(e) => setIsInKumasi(e.target.value === 'yes')}
                        className="input cursor-pointer border-0 bg-transparent px-1"
                      >
                        <option value="" disabled>Select an option…</option>
                        <option value="yes">Yes, within Kumasi</option>
                        <option value="no">No, outside Kumasi</option>
                      </select>
                    </div>
                  </div>

                  {isInKumasi === true && (
                    <div className="field mb-4">
                      <label>Delivery address / landmark in Kumasi</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Near Suame Roundabout, opposite the fuel station"
                        rows={3}
                        required
                        className="input"
                      />
                    </div>
                  )}

                  {outsideKumasi && (
                    <p className="mb-4 border border-[color:var(--color-divider)] bg-panel p-3 text-xs leading-relaxed text-ink-700">
                      Inter-city delivery is arranged directly with the shop over WhatsApp — payment happens once
                      you&apos;ve agreed on the waybill details.
                    </p>
                  )}
                </>
              )}

              {error && (
                <div className="mb-4 flex items-start gap-2 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-3 text-xs font-medium text-danger-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {outsideKumasi ? (
                <button type="button" onClick={handleWhatsAppHandoff} className="btn btn-primary btn-block justify-center">
                  <MessageCircle className="h-4 w-4" /> Discuss inter-city delivery on WhatsApp
                </button>
              ) : (
                <>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-block justify-center">
                    {submitting ? 'Processing…' : 'Continue'}
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
