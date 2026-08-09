'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Order, Product } from '@/types';
import AdminForm from '@/components/AdminForm';
import AdminInventory from '@/components/AdminInventory';
import AdminOrderAlerts from '@/components/AdminOrderAlerts';
import AdminAnalytics from '@/components/AdminAnalytics';
import { InventoryGridSkeleton } from '@/components/Skeletons';

type Guard = 'checking' | 'denied' | 'unauthenticated' | 'ok';

export default function AdminPage() {
  const router = useRouter();
  const [guard, setGuard] = useState<Guard>('checking');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (active) setGuard('unauthenticated');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!active) return;

        if (profileError || profile?.role !== 'admin') {
          setGuard('denied');
          return;
        }

        setGuard('ok');
      } catch {
        if (active) setGuard('unauthenticated');
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (guard !== 'ok') return;
    let active = true;

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!active) return;
        if (fetchError) {
          setError('Could not load inventory.');
        } else {
          setProducts((data as Product[]) ?? []);
        }
      } catch {
        if (active) setError('Could not reach the database to load inventory.');
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [guard]);

  if (guard === 'checking') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your access…
        </div>
      </main>
    );
  }

  if (guard === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  if (guard === 'denied') {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="h-10 w-10 text-danger-500" />
        <h1 className="text-2xl">Access denied</h1>
        <p className="max-w-sm text-sm text-ink-600">
          This dashboard is for G.Adu Motors admins only. If you believe this is a mistake, contact the shop owner
          to have your account promoted.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 border-b-2 border-[color:var(--color-divider)] pb-4">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Admin dashboard</span>
          <h1 className="mt-2">Manage inventory &amp; orders</h1>
        </div>

        <AdminAnalytics products={products} orders={orders} />

        <AdminOrderAlerts products={products} onOrdersChange={setOrders} />

        <AdminForm onAdded={(product) => setProducts((prev) => [product, ...prev])} />

        {error && <p className="mb-4 text-sm text-danger-600">{error}</p>}

        {loadingProducts ? (
          <InventoryGridSkeleton />
        ) : (
          <AdminInventory
            products={products}
            onDeleted={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
          />
        )}
      </div>
    </main>
  );
}
