import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { BUSINESS } from '@/utils/data';

export default function Contact() {
  return (
    <section id="contact" className="bg-ink-50/60 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Visit Us
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase text-ink-900">
            Contact &amp; Opening Hours
          </h2>
          <p className="mt-3 text-sm text-ink-500">
            Our Kumasi branch is ready to help you find the part you need.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contact details */}
          <div className="space-y-4">
            <ContactRow icon={MapPin} label="Location">
              {BUSINESS.address}
            </ContactRow>
            <ContactRow icon={Phone} label="Phone" href={BUSINESS.phoneHref}>
              {BUSINESS.phone}
            </ContactRow>
            <ContactRow icon={Mail} label="Email" href={`mailto:${BUSINESS.email}`}>
              {BUSINESS.email}
            </ContactRow>
          </div>

          {/* Hours */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gold-500" />
              <h3 className="font-display text-lg font-bold uppercase text-ink-900">
                Operating Hours
              </h3>
            </div>
            <ul className="divide-y divide-ink-100">
              {BUSINESS.hours.map((h) => (
                <li key={h.day} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-ink-700">{h.day}</span>
                  <span
                    className={`font-semibold ${
                      h.time === 'Closed' ? 'text-danger-500' : 'text-ink-900'
                    }`}
                  >
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            <iframe
              title="G.Adu Motors location — Kumasi"
              src="https://www.google.com/maps?q=Kumasi,Ghana&output=embed"
              className="h-full min-h-[280px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  children: ReactNode;
}) {
  const body = (
    <div className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:border-gold-300">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </span>
        <p className="text-sm font-semibold text-ink-900">{children}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {body}
    </a>
  ) : (
    body
  );
}
