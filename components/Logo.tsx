import { useId } from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
}

export default function Logo({ variant = 'dark' }: LogoProps) {
  const wordColor = variant === 'light' ? '#ffffff' : '#132a52';
  const arcId = useId();

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Circular "GA" monogram badge, matching the real G.Adu Motors mark:
          a red-ringed white coin with an overlapping G/A wordmark and
          "G.ADU MOTORS" arced along the inner bottom edge. */}
      <svg width="44" height="44" viewBox="0 0 64 64" className="shrink-0" aria-hidden>
        <defs>
          <path id={arcId} d="M 11 40 A 21 21 0 0 0 53 40" fill="none" />
        </defs>
        <circle cx="32" cy="32" r="29" fill="#ffffff" stroke="#e02430" strokeWidth="4" />
        <text
          x="26"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="30"
          fill="#e02430"
        >
          G
        </text>
        <text
          x="38"
          y="35"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="22"
          fill="#e02430"
        >
          A
        </text>
        <text fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="5.5" fill="#e02430" letterSpacing="0.4">
          <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
            G.ADU MOTORS
          </textPath>
        </text>
      </svg>
      <div className="leading-none">
        <span
          className="block font-display text-2xl font-extrabold tracking-tight"
          style={{ color: wordColor }}
        >
          G.<span style={{ color: '#e02430' }}>ADU</span>
        </span>
        <span
          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black"
          style={{ background: '#ffd400' }}
        >
          Motors
        </span>
      </div>
    </div>
  );
}
