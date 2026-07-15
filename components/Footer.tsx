import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { BUSINESS } from '@/utils/data';
import Logo from './Logo';

const QUICK_LINKS = [
  { label: 'Live Inventory', href: '/#inventory' },
  { label: 'Services', href: '/#services' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Japanese &amp; Korean auto spare parts dealer in {BUSINESS.city}. Quality parts,
              reliable service — negotiate your price and claim it on WhatsApp.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Contact Info
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-gold-400" /> {BUSINESS.city}, {BUSINESS.country}
              </li>
              <li>
                <a href={BUSINESS.phoneHref} className="flex items-center gap-2.5 hover:text-white">
                  <Phone className="h-4 w-4 text-gold-400" /> {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="flex items-center gap-2.5 hover:text-white"
                >
                  <Mail className="h-4 w-4 text-gold-400" /> {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-ink-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours + social */}
          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Opening Hours
            </h4>
            <ul className="space-y-1.5 text-sm text-ink-400">
              {BUSINESS.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3">
                  <span>{h.day}</span>
                  <span className={h.time === 'Closed' ? 'text-danger-400' : 'text-ink-200'}>
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-ink-200 transition hover:bg-gold-500 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-ink-200 transition hover:bg-gold-500 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col items-center justify-between gap-2 text-xs text-ink-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</span>
          <span>Japanese &amp; Korean Auto Spare Parts • {BUSINESS.city}, {BUSINESS.country}</span>
        </div>
      </div>
    </footer>
  );
}
