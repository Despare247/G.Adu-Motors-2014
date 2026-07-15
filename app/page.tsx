import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { PublicProduct } from '@/types';
import HomeClient from '@/components/HomeClient';

// Product list can change any time an admin adds/deletes a part, so this
// page should never be statically cached — always hit Supabase fresh.
export const dynamic = 'force-dynamic';

async function getInitialProducts(): Promise<{ products: PublicProduct[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('public_products')
      .select('id, name, origin, make, model, year, condition, retail_price, image_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[app/page] failed to load public_products:', error.message);
      return { products: [], error: 'Could not load the live inventory right now.' };
    }

    return { products: data ?? [], error: null };
  } catch (err) {
    console.error('[app/page] unexpected error loading products:', err);
    return { products: [], error: 'Could not reach the database. Please try again shortly.' };
  }
}

export default async function HomePage() {
  const { products, error } = await getInitialProducts();

  return (
    <main>
      {error && (
        <div className="flex items-center gap-2 justify-center bg-danger-500/5 border-b border-danger-500/20 px-4 py-2.5 text-xs font-medium text-danger-600">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      <HomeClient initialProducts={products} />
    </main>
  );
}
