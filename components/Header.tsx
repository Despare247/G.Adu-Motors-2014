'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { BUSINESS } from '@/utils/data';
import { supabase } from '@/utils/supabaseClient';
import type { Role } from '@/types';
import Logo from './Logo';

const NAV_ITEMS = [
  { label: 'Home', href: '/#home' },
  { label: 'Inventory', href: '/#inventory' },
  { label: 'Categories', href: '/#categories' },
  { label: 'Services', href: '/#services' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  return (
    <header className="sticky top-0 z-40">
      {/* Top row */}
      <div className={`bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 py-3">
            <Link href="/" className="shrink-0">
              <Logo />
            </Link>

            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              {!checking && role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-2 rounded-lg border border-gold-500 bg-gold-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 sm:flex"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {!checking && email && (
                <button
                  onClick={handleLogout}
                  className="hidden items-center gap-2 text-sm font-semibold text-ink-600 hover:text-gold-600 sm:flex cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              )}

              {!checking && !email && (
                <div className="hidden items-center gap-3 sm:flex">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-gold-600"
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-ink-700 hover:border-gold-400 hover:text-gold-600"
                  >
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </Link>
                </div>
              )}

              <a
                href={BUSINESS.phoneHref}
                className="hidden items-center gap-2 text-sm font-semibold text-ink-700 hover:text-gold-600 lg:flex"
              >
                <Phone className="h-4 w-4 text-gold-500" /> {BUSINESS.phone}
              </a>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-800 cursor-pointer"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav row */}
      <nav className="bg-ink-800 text-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 text-[13px] font-semibold uppercase tracking-wide transition hover:bg-ink-700 hover:text-white ${
                    i === 0 ? 'text-white' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold text-gold-300 hover:text-gold-200"
              >
                <Phone className="h-4 w-4" />
                {BUSINESS.phone}
              </a>
            </li>
          </ul>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-ink-700"
            >
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide hover:bg-ink-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {!checking && role === 'admin' && (
                <li>
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide text-gold-400 hover:bg-ink-700"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                  </Link>
                </li>
              )}

              {!checking && email && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide hover:bg-ink-700 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </li>
              )}

              {!checking && !email && (
                <>
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide hover:bg-ink-700"
                    >
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide hover:bg-ink-700"
                    >
                      <UserPlus className="h-4 w-4" /> Sign Up
                    </Link>
                  </li>
                </>
              )}

              <li>
                <a
                  href={BUSINESS.phoneHref}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gold-300"
                >
                  <Phone className="h-4 w-4" /> {BUSINESS.phone}
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
