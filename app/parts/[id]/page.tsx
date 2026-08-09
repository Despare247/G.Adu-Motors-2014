import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { PublicProduct } from '@/types';
import PdpClient from '@/components/PdpClient';

export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<PublicProduct | null> {
  const { data, error } = await supabase
    .from('public_products')
    .select('id, name, origin, make, model, year, condition, retail_price, image_url, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function PdpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <PdpClient part={product} />;
}
