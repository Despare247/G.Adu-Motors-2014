export interface PaystackChargeParams {
  email: string;
  /** Amount in GHS (major units) — this helper converts to pesewas for you. */
  amountGhs: number;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}

interface PaystackPopupResponse {
  reference: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackPopInterface {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    channels: string[];
    metadata?: Record<string, unknown>;
    callback: (response: PaystackPopupResponse) => void;
    onClose: () => void;
  }) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopInterface;
  }
}

/**
 * Opens the Paystack Inline popup, restricted to card + mobile_money so it
 * natively covers MTN Mobile Money, Telecel Cash and AT Money for Ghanaian
 * customers. Relies on the `https://js.paystack.co/v1/inline.js` script
 * having already been loaded via <Script> in app/layout.tsx.
 */
export function openPaystackCheckout({
  email,
  amountGhs,
  metadata,
  onSuccess,
  onClose,
  onError,
}: PaystackChargeParams) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    onError?.('Payments are not configured yet. Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.');
    return;
  }

  if (typeof window === 'undefined' || !window.PaystackPop) {
    onError?.('Payment gateway is still loading. Please try again in a moment.');
    return;
  }

  if (!email || !amountGhs || amountGhs <= 0) {
    onError?.('A valid email and amount are required to check out.');
    return;
  }

  try {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(amountGhs * 100), // Paystack expects the smallest currency unit (pesewas).
      currency: 'GHS',
      channels: ['mobile_money', 'card'],
      metadata,
      callback: (response) => {
        onSuccess(response.reference);
      },
      onClose: () => {
        onClose();
      },
    });
    handler.openIframe();
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Could not open the payment window.');
  }
}
