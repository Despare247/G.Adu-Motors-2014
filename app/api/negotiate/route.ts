import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = typeof body.productId === 'string' ? body.productId : null;
    const offerAmount = Number(body.offerAmount);

    if (!productId || !Number.isFinite(offerAmount) || offerAmount <= 0) {
      return NextResponse.json(
        { error: 'A valid productId and offerAmount are required.' },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('id, name, floor_price, retail_price')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    if (offerAmount < product.floor_price) {
      return NextResponse.json({
        accepted: false,
        message: `Offer too low. Our lowest price for this item is GH₵ ${Number(
          product.floor_price,
        ).toLocaleString()}.`,
      });
    }

    return NextResponse.json({
      accepted: true,
      negotiatedAmount: offerAmount,
      message: 'Offer accepted! Proceed to checkout with your negotiated price.',
    });
  } catch (err) {
    console.error('[api/negotiate] error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
