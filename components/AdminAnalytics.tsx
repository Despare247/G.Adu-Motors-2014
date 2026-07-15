'use client';

import { useMemo } from 'react';
import { BarChart3, Wallet, Package, CheckCircle2 } from 'lucide-react';
import { Order, Product } from '@/types';
import { BUSINESS } from '@/utils/data';

interface AdminAnalyticsProps {
  products: Product[];
  orders: Order[];
}

interface MetricTileProps {
  icon: typeof Wallet;
  label: string;
  value: string;
  emphasis?: boolean;
}

function MetricTile({ icon: Icon, label, value, emphasis }: MetricTileProps) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        <Icon className="h-4 w-4 text-gold-400" /> {label}
      </div>
      <div
        className={`mt-2 font-display font-extrabold ${
          emphasis ? 'text-3xl text-gold-400' : 'text-2xl text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminAnalytics({ products, orders }: AdminAnalyticsProps) {
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'paid'), [orders]);

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, o) => sum + Number(o.amount_paid), 0),
    [completedOrders],
  );

  const categoryBreakdown = useMemo(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    const counts = new Map<string, number>();

    for (const order of completedOrders) {
      const product = order.product_id ? productById.get(order.product_id) : undefined;
      if (!product) continue;
      const conditionLabel = product.condition === 'Used' ? 'Home-Used' : 'New';
      const key = `${product.origin} — ${conditionLabel}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [completedOrders, products]);

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2 text-white">
        <BarChart3 className="h-5 w-5 text-gold-400" />
        <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">Business Analytics</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile
          icon={Wallet}
          label="Total Sales Revenue"
          value={`${BUSINESS.currency} ${totalRevenue.toLocaleString()}`}
          emphasis
        />
        <MetricTile icon={Package} label="Active Inventory Volume" value={products.length.toLocaleString()} />
        <MetricTile
          icon={CheckCircle2}
          label="Completed Transactions"
          value={completedOrders.length.toLocaleString()}
        />
      </div>

      <div className="mt-4 rounded-xl border border-ink-800 bg-ink-900 p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          Top Moving Categories
        </span>
        {categoryBreakdown.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">No completed sales yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {categoryBreakdown.map(([label, count]) => (
              <li
                key={label}
                className="flex items-center justify-between border-b border-ink-800 pb-2 text-sm last:border-0 last:pb-0"
              >
                <span className="text-ink-200">{label}</span>
                <span className="font-bold text-gold-400">
                  {count} sale{count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
