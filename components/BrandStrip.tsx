import { BRANDS } from '@/utils/data';

export default function BrandStrip() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <section className="border-y border-ink-100 bg-white py-8">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">
        Brands & Makes We Stock
      </p>
      <div className="marquee-container">
        <div className="animate-marquee">
          {doubled.map((brand, i) => (
            <span
              key={i}
              className="mx-6 font-display text-xl font-bold uppercase tracking-wide text-ink-300 sm:mx-10 sm:text-2xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
