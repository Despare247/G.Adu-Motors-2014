import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'G.Adu Motors | Japanese & Korean Auto Spare Parts — Kumasi, Ghana',
  description:
    'G.Adu Motors — Japanese & Korean auto spare parts dealer in Suame, Kumasi. Browse live inventory, negotiate your price, and pay instantly with MTN Mobile Money, Telecel Cash, AT Money or card.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-50/40 antialiased">
        {/* Loaded once, globally, so PartCard can open the popup from any product card. */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
