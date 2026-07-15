'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, PartyPopper, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Order, Product } from '@/types';
import { BUSINESS } from '@/utils/data';

interface AdminOrderAlertsProps {
  products: Product[];
  onOrdersChange?: (orders: Order[]) => void;
}

interface Toast {
  id: string;
  order: Order;
  productName: string;
}

function fulfillmentSummary(order: Order): string {
  if (order.fulfillment_type === 'delivery') {
    return `Delivery to ${order.delivery_address ?? 'Kumasi'}`;
  }
  return 'Store Pickup';
}

export default function AdminOrderAlerts({ products, onOrdersChange }: AdminOrderAlertsProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const productName = (productId: string | null) =>
    products.find((p) => p.id === productId)?.name ?? 'a part';

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!active) return;
        if (fetchError) {
          setError('Could not load recent orders.');
        } else {
          setOrders(data ?? []);
        }
      } catch {
        if (active) setError('Could not reach the database to load orders.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    onOrdersChange?.(orders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    // Realtime: the instant a customer's payment is verified and written to
    // `orders` (server-side, see app/api/verify-payment), this fires here —
    // no page refresh needed.
    const channel = supabase
      .channel('orders-admin-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as Order;
          setOrders((prev) => [order, ...prev]);

          const id = `${order.id}-${Date.now()}`;
          setToasts((prev) => [...prev, { id, order, productName: productName(order.product_id) }]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 7000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return (
    <div className="mb-8">
      {/* Gold-bordered realtime toast */}
      <div className="fixed top-20 right-4 z-[70] flex flex-col gap-2 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className="animate-flash-banner flex max-w-sm items-start gap-3 rounded-xl border border-gold-400 bg-ink-950 p-4 shadow-2xl"
            >
              <PartyPopper className="h-5 w-5 shrink-0 text-gold-400" />
              <div className="text-sm">
                <p className="font-bold text-gold-300">🔥 New Order!</p>
                <p className="mt-0.5 text-ink-200">
                  <span className="font-bold text-white">
                    {BUSINESS.currency} {Number(toast.order.amount_paid).toLocaleString()}
                  </span>{' '}
                  paid by {toast.order.buyer_name} for {toast.productName} — Method:{' '}
                  {fulfillmentSummary(toast.order)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="rounded-xl border border-ink-800 bg-ink-900 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Bell className="h-5 w-5 text-gold-400" />
          <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">Recent Orders</h3>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading orders…
          </div>
        ) : error ? (
          <p className="py-4 text-sm text-danger-400">{error}</p>
        ) : orders.length === 0 ? (
          <p className="py-4 text-sm text-ink-400">No orders yet. New sales will appear here instantly.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="py-2 pr-4 font-semibold">Part</th>
                  <th className="py-2 pr-4 font-semibold">Buyer</th>
                  <th className="py-2 pr-4 font-semibold">Phone</th>
                  <th className="py-2 pr-4 font-semibold">Network</th>
                  <th className="py-2 pr-4 font-semibold">Fulfillment</th>
                  <th className="py-2 pr-4 font-semibold">Amount</th>
                  <th className="py-2 pr-4 font-semibold">Reference</th>
                  <th className="py-2 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2.5 pr-4 font-medium text-ink-200">{productName(order.product_id)}</td>
                    <td className="py-2.5 pr-4 text-ink-300">{order.buyer_name}</td>
                    <td className="py-2.5 pr-4 text-ink-400">{order.buyer_phone}</td>
                    <td className="py-2.5 pr-4 text-ink-400">{order.momo_network}</td>
                    <td className="py-2.5 pr-4 text-ink-400">{fulfillmentSummary(order)}</td>
                    <td className="py-2.5 pr-4 font-bold text-gold-400">
                      {BUSINESS.currency} {Number(order.amount_paid).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-ink-500">{order.paystack_reference}</td>
                    <td className="py-2.5 text-ink-500">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
