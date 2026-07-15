'use client';

import { motion } from 'motion/react';
import { ShieldCheck, Truck, Wrench, BadgeCheck } from 'lucide-react';

const SERVICES = [
  {
    icon: BadgeCheck,
    title: 'Genuine & Quality Parts',
    desc: 'New and original take-off used parts, each inspected and tested before it reaches you.',
  },
  {
    icon: Wrench,
    title: 'Expert Part Matching',
    desc: 'Tell us your make, model and year — we identify the exact spare part your Japanese or Korean vehicle needs.',
  },
  {
    icon: Truck,
    title: 'Retail & Bulk Supply',
    desc: 'From single walk-in purchases to supplying garages and fleets across Kumasi and beyond.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Local Dealer',
    desc: 'Years of dependable service in Kumasi. Honest advice and fair pricing on every part.',
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-ink-50/60 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Why Choose Us
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase text-ink-900">
            Reliable Service You Can Count On
          </h2>
          <p className="mt-3 text-sm text-ink-500">
            G.Adu Motors specialises in the retail and supply of car spare parts for Japanese
            and Korean automotive brands.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500/10 text-gold-600">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
