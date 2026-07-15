'use client';

import { motion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import { BUSINESS } from '@/utils/data';

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-ink-900">
      {/* Garage background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?auto=format&fit=crop&q=80&w=1600"
          alt="Auto workshop"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-900/85 to-ink-900/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300 ring-1 ring-gold-400/30">
            Japanese &amp; Korean Auto Spare Parts • {BUSINESS.city}
          </span>

          <h1 className="mt-6 font-display text-4xl sm:text-6xl font-extrabold uppercase leading-[1.05] text-white">
            Quality Auto Parts.
            <br />
            Reliable Service.
            <br />
            <span className="text-gold-400">Your Trusted Source in {BUSINESS.city}.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base sm:text-lg text-ink-200">
            Genuine and quality-tested spare parts for Toyota, Honda, Nissan, Mazda,
            Mitsubishi, Suzuki, Subaru, Hyundai, Kia and more — new and used. Browse the
            live inventory and name your price.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <motion.a
              href="#inventory"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-gold-500/30 hover:bg-gold-600 transition cursor-pointer"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </motion.a>

            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10 transition"
            >
              <Phone className="h-4 w-4" /> {BUSINESS.phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
