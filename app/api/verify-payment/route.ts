import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseAdmin';
import { FulfillmentType, MomoNetwork } from '@/types';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned';
    amount: number; // pesewas
    currency: string;
    reference: string;
  };
}

const VALID_NETWORKS: MomoNetwork[] = ['MTN MoMo', 'Telecel Cash', 'AT Money'];
const VALID_FULFILLMENT_TYPES: FulfillmentType[] = ['pickup', 'delivery'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reference = typeof body.reference === 'string' ? body.reference : null;
    const productId = typeof body.productId === 'string' ? body.productId : null;
    const buyerName = typeof body.buyerName === 'string' ? body.buyerName : null;
    const buyerPhone = typeof body.buyerPhone === 'string' ? body.buyerPhone : null;
    const momoNetwork = typeof body.momoNetwork === 'string' ? body.momoNetwork : null;
    const fulfillmentType = typeof body.fulfillmentType === 'string' ? body.fulfillmentType : null;
    const isInKumasi = typeof body.isInKumasi === 'boolean' ? body.isInKumasi : null;
    const deliveryAddress = typeof body.deliveryAddress === 'string' ? body.deliveryAddress : null;

    if (!reference || !productId || !buyerName || !buyerPhone || !momoNetwork || !fulfillmentType) {
      return NextResponse.json(
        {
          error:
            'reference, productId, buyerName, buyerPhone, momoNetwork and fulfillmentType are required.',
        },
        { status: 400 },
      );
    }
    if (!VALID_NETWORKS.includes(momoNetwork as MomoNetwork)) {
      return NextResponse.json({ error: 'Invalid mobile money network.' }, { status: 400 });
    }
    if (!VALID_FULFILLMENT_TYPES.includes(fulfillmentType as FulfillmentType)) {
      return NextResponse.json({ error: 'Invalid fulfillment type.' }, { status: 400 });
    }
    // Outside-Kumasi deliveries never reach checkout on the client (they're
    // routed to WhatsApp instead), so a delivery order landing here must
    // have a confirmed Kumasi address.
    if (fulfillmentType === 'delivery' && (!isInKumasi || !deliveryAddress)) {
      return NextResponse.json(
        { error: 'Delivery orders require isInKumasi=true and a deliveryAddress.' },
        { status: 400 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('[api/verify-payment] Missing PAYSTACK_SECRET_KEY');
      return NextResponse.json({ error: 'Payments are not configured on the server yet.' }, { status: 500 });
    }

    // Never trust a "successful" payment claim from the browser — always
    // re-verify the transaction directly against Paystack's own API using
    // the secret key before writing anything to the orders table.
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store',
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Could not reach Paystack to verify this transaction.' }, { status: 502 });
    }

    const verifyJson = (await verifyRes.json()) as PaystackVerifyResponse;

    if (!verifyJson.status || verifyJson.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment was not successful.', paystackStatus: verifyJson.data?.status ?? 'unknown' },
        { status: 402 },
      );
    }

    if (verifyJson.data.currency !== 'GHS') {
      return NextResponse.json({ error: 'Unexpected currency on transaction.' }, { status: 400 });
    }

    const amountPaid = verifyJson.data.amount / 100;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    const { data: order, error: insertError } = await supabaseAdmin
      .from('orders')
      .upsert(
        {
          product_id: productId,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          momo_network: momoNetwork,
          amount_paid: amountPaid,
          paystack_reference: reference,
          status: 'paid',
          fulfillment_type: fulfillmentType,
          is_in_kumasi: fulfillmentType === 'delivery' ? isInKumasi : null,
          delivery_address: fulfillmentType === 'delivery' ? deliveryAddress : null,
        },
        { onConflict: 'paystack_reference' },
      )
      .select()
      .single();

    if (insertError) {
      console.error('[api/verify-payment] order insert failed:', insertError);
      return NextResponse.json({ error: 'Payment verified but the order could not be recorded.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order,
      productName: product?.name ?? 'your part',
      amountPaid,
    });
  } catch (err) {
    console.error('[api/verify-payment] error:', err);
    return NextResponse.json({ error: 'Something went wrong verifying your payment.' }, { status: 500 });
  }
}
