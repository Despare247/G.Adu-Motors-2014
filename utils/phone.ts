/**
 * Ghanaian mobile numbers: 10 digits starting with 0 (e.g. 0241234567),
 * or the same number in +233 international form (e.g. +233241234567).
 */
export function isValidGhanaPhone(raw: string): boolean {
  const digits = raw.replace(/[\s-]/g, '');
  return /^0\d{9}$/.test(digits) || /^(\+233|233)\d{9}$/.test(digits);
}

/** Normalizes any accepted input format to +233XXXXXXXXX for Paystack metadata. */
export function toIntlGhanaPhone(raw: string): string {
  const digits = raw.replace(/[\s-]/g, '');
  if (digits.startsWith('+233')) return digits;
  if (digits.startsWith('233')) return `+${digits}`;
  if (digits.startsWith('0')) return `+233${digits.slice(1)}`;
  return digits;
}
