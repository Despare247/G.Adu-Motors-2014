import { BUSINESS } from './data';

function waLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Scenario A: customer is outside Kumasi and needs inter-city delivery arranged. */
export function outsideKumasiDeliveryLink(params: {
  partName: string;
  condition: string;
  price: number;
}): string {
  const { partName, condition, price } = params;
  const message =
    `Hello Gadumotors, I want to buy the ${partName} (Condition: ${condition}) for ` +
    `${BUSINESS.currency} ${price.toLocaleString()}. I am located outside Kumasi and need to arrange ` +
    `delivery/waybill to my location.`;
  return waLink(message);
}

/** Scenario B: customer inside Kumasi just completed a successful Paystack payment. */
export function finalizeKumasiOrderLink(params: {
  amount: number;
  partName: string;
  reference: string;
  deliveryAddress: string;
}): string {
  const { amount, partName, reference, deliveryAddress } = params;
  const message =
    `Hello Gadumotors, I just paid ${BUSINESS.currency} ${amount.toLocaleString()} via Mobile Money for ` +
    `${partName}. Reference: ${reference}. My delivery address in Kumasi is: ${deliveryAddress}.`;
  return waLink(message);
}
