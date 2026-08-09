'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Camera } from 'lucide-react';
import { BUSINESS } from '@/utils/data';

interface Message {
  me: boolean;
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { me: false, text: `Good morning — ${BUSINESS.name} counter. How can we help?`, time: '08:42' },
  { me: true, text: 'Morning. My Corolla 2013 alternator is dead. Do you have one?', time: '08:44' },
];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = nowTime();
    setMessages((m) => [...m, { me: true, text, time }]);
    setDraft('');
    // No real chat backend is wired up yet — this canned reply mirrors the
    // design handoff prototype's illustrative behavior.
    setTimeout(() => {
      setMessages((m) => [...m, { me: false, text: 'Noted — checking with the counter now, one moment.', time: nowTime() }]);
    }, 900);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border border-[color:var(--color-divider)] bg-canvas">
        <div className="flex items-center gap-2.5 border-b-2 border-[color:var(--color-divider)] px-3.5 py-3">
          <div className="grid h-[34px] w-[34px] shrink-0 place-items-center bg-ink-900 font-display text-[13px] font-extrabold text-canvas">
            GA
          </div>
          <div className="flex-1">
            <div className="font-display text-sm font-extrabold leading-tight">{BUSINESS.name} · Counter</div>
            <div className="text-[11px] text-accent">Demo thread — not a live connection</div>
          </div>
          <span className="tag tag-outline">Illustrative</span>
        </div>

        <div className="flex min-h-[360px] flex-col gap-3 bg-panel p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[78%] px-3 py-2.5"
                style={m.me ? { background: 'var(--color-accent)', color: 'var(--color-canvas)' } : { background: 'var(--color-canvas)', border: '1px solid var(--color-divider)' }}
              >
                <div className="text-[13.5px] leading-relaxed">{m.text}</div>
                <div className="mt-1 text-right text-[10px] opacity-60">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t-2 border-[color:var(--color-divider)] px-3.5 py-3">
          <button className="btn btn-secondary btn-icon" title="Send a photo (demo only)">
            <Camera className="h-4 w-4" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a message…"
            className="input flex-1"
          />
          <button onClick={send} className="btn btn-primary">Send</button>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-500">
        This is a demo thread, not a live connection to the shop. For a real question, call {BUSINESS.phone} or
        WhatsApp us.
      </p>
    </div>
  );
}
