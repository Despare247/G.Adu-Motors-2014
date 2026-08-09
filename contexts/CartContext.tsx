'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'gadu-cart';

interface CartContextValue {
  productIds: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProductIds(JSON.parse(raw));
    } catch {
      // Corrupt/unavailable storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  }, [productIds, hydrated]);

  const add = (productId: string) => {
    setProductIds((ids) => (ids.includes(productId) ? ids : [...ids, productId]));
  };

  const remove = (productId: string) => {
    setProductIds((ids) => ids.filter((id) => id !== productId));
  };

  const has = (productId: string) => productIds.includes(productId);

  return (
    <CartContext.Provider value={{ productIds, add, remove, has, count: productIds.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
