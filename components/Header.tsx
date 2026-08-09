'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, ShoppingCart, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useCart } from '@/contexts/CartContext';
import type { Role } from '@/types';
import Logo from './Logo';

const NAV_ITEMS = [
  { label: 'Catalogue', href: '/parts' },
  { label: 'Find my part', href: '/fit-finder' },
  { label: 'Track order', href: '/track' },
  { label: 'Chat', href: '/chat' },
];

export default function Header() {
  const router = useRouter();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (userId: string, userEmail: string | undefined) => {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (!active) return;
      setEmail(userEmail ?? null);
      setRole((data?.role as Role) ?? 'customer');
      setChecking(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setChecking(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setChecking(true);
        loadProfile(session.user.id, session.user.email);
      } else {
        setEmail(null);
        setRole(null);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/parts?q=${encodeURIComponent(query.trim())}` : '/parts');
  };

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      <div className="nav">
        <Link href="/" className="nav-brand flex items-center gap-2.5 shrink-0">
          <Logo />
        </Link>

        <form onSubmit={handleSearch} className="hidden max-w-md flex-1 items-center gap-2 sm:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search part name, make or model…"
            className="input"
          />
          <button type="submit" className="btn btn-secondary btn-icon" title="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="btn btn-secondary" title="Cart">
          <ShoppingCart className="h-4 w-4" />
          <span>{count}</span>
        </Link>

        {!checking && role === 'admin' && (
          <Link href="/admin" className="btn btn-secondary hidden sm:inline-flex">
            <ShieldCheck className="h-4 w-4" /> Dashboard
          </Link>
        )}

        {!checking && email && (
          <button onClick={handleLogout} className="btn btn-ghost hidden sm:inline-flex">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        )}

        {!checking && !email && (
          <div className="hidden items-center gap-1 sm:flex">
            <Link href="/login" className="btn btn-ghost">
              <LogIn className="h-4 w-4" /> Login
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              <UserPlus className="h-4 w-4" /> Sign up
            </Link>
          </div>
        )}

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="btn btn-secondary btn-icon lg:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b-2 border-[color:var(--color-divider)] bg-canvas lg:hidden"
          >
            <form onSubmit={handleSearch} className="flex items-center gap-2 p-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search parts…"
                className="input"
              />
              <button type="submit" className="btn btn-secondary btn-icon">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className="border-t border-[color:var(--color-divider)]">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm uppercase tracking-wide"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!checking && role === 'admin' && (
                <li className="border-t border-[color:var(--color-divider)]">
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wide text-accent"
                  >
                    <ShieldCheck className="h-4 w-4" /> Dashboard
                  </Link>
                </li>
              )}
              {!checking && email && (
                <li className="border-t border-[color:var(--color-divider)]">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm uppercase tracking-wide"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </li>
              )}
              {!checking && !email && (
                <>
                  <li className="border-t border-[color:var(--color-divider)]">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wide"
                    >
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                  </li>
                  <li className="border-t border-[color:var(--color-divider)]">
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wide"
                    >
                      <UserPlus className="h-4 w-4" /> Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
