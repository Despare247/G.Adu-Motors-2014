import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely, so it
 * must only ever be imported from server-only code (Route Handlers). The
 * `server-only` import above makes it a build error to accidentally pull
 * this into a Client Component bundle.
 *
 * Used for exactly two things:
 *   1. app/api/negotiate       — reading products.floor_price to compare
 *      against a customer's offer without ever sending it to the browser.
 *   2. app/api/verify-payment  — writing the `orders` row after independently
 *      verifying the transaction with Paystack's REST API.
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings → API → service_role). ' +
        'Never expose this key to the browser.',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
