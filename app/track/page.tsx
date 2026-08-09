import { MessageCircle, Phone } from 'lucide-react';
import { BUSINESS } from '@/utils/data';

const STEPS: { title: string; body: string; time: string; state: 'done' | 'active' | 'todo' }[] = [
  { title: 'Order placed', body: 'Paid — receipt sent by SMS', time: '09:14', state: 'done' },
  { title: 'Shop confirmed the part', body: 'Matched against the listing and pulled from the shelf', time: '09:31', state: 'done' },
  { title: 'Packed & sealed', body: 'Checked once more before sealing for dispatch', time: '09:58', state: 'done' },
  { title: 'Ready for pickup / rider assigned', body: `Ready at ${BUSINESS.address}`, time: '10:22', state: 'active' },
  { title: 'Delivered / collected', body: 'Confirm the part fits before you leave', time: '—', state: 'todo' },
];

export default function TrackPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-9 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <div>
        <div className="mb-2 flex flex-wrap items-baseline gap-3 border-b-2 border-[color:var(--color-divider)] pb-3">
          <h2 className="m-0">Sample order tracker</h2>
          <span className="tag tag-accent">Illustrative</span>
        </div>
        <p className="mb-5 max-w-lg text-sm text-ink-600">
          This is a demo of what order tracking will look like — {BUSINESS.name} doesn&apos;t have live
          order-status tracking wired up yet. For a real order, contact the shop directly.
        </p>

        <div className="mt-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="grid grid-cols-[26px_1fr] gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ background: s.state === 'todo' ? 'var(--color-canvas)' : 'var(--color-accent)', border: s.state === 'todo' ? '2px solid var(--color-divider)' : 'none' }}
                />
                {i < STEPS.length - 1 && (
                  <span className="w-0.5 flex-1" style={{ background: s.state === 'done' ? 'var(--color-accent)' : 'var(--color-divider)' }} />
                )}
              </div>
              <div className="pb-6">
                <div className="font-display text-[15px] font-extrabold leading-tight">{s.title}</div>
                <div className="mt-0.5 text-sm text-ink-600">{s.body}</div>
                <div className="mt-1.5 text-[11px] uppercase tracking-wide text-ink-500">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="border-2 border-ink-900 p-4">
          <h6 className="mb-2.5">Need help with a real order?</h6>
          <a href={BUSINESS.phoneHref} className="btn btn-primary btn-block">
            <Phone className="h-4 w-4" /> Call {BUSINESS.phone}
          </a>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-block"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
