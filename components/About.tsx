'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const POINTS = [
  'Specialised in Japanese & Korean automotive brands',
  'Wide stock of engine, brake, suspension & body parts',
  'New and quality-tested used options',
  'Negotiate your price and claim it instantly on WhatsApp',
];

export default function About() {
  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&q=80&w=900"
            alt="Auto parts shelves"
            className="rounded-2xl shadow-xl ring-1 ring-ink-100"
          />
          <div className="absolute -bottom-5 -right-3 hidden rounded-xl bg-gold-500 px-6 py-4 text-white shadow-lg sm:block">
            <span className="block font-display text-3xl font-extrabold leading-none">9+</span>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Japanese &amp; Korean Makes
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            About G.Adu Motors
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-tight text-ink-900">
            Your Trusted Japanese &amp; Korean Auto Spare Parts Dealer in Kumasi
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            G.Adu Motors stocks and sells specialised parts for a wide variety of Japanese and
            Korean vehicles. Whether you drive a Toyota, Honda, Nissan, Mazda, Mitsubishi, Suzuki,
            Subaru, Hyundai or Kia, our team helps you find the right spare part — quickly and at
            a fair price.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Looking for a specific spare part such as an engine, brakes or suspension component?
            Browse our live inventory below, make an offer, and claim it instantly on WhatsApp.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-ink-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
