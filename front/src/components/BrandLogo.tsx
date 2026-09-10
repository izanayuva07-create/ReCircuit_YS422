import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { name: 'text-[1.05rem]', tagline: 'text-[0.49rem]', mark: 'h-9 w-9' },
  md: { name: 'text-[1.35rem]', tagline: 'text-[0.58rem]', mark: 'h-11 w-11' },
  lg: { name: 'text-3xl', tagline: 'text-[0.72rem]', mark: 'h-14 w-14' },
};

const CircuitMark: React.FC<{ className: string }> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={`${className} flex-none`}
    aria-hidden="true"
    fill="none"
  >
    <rect x="2.5" y="2.5" width="43" height="43" rx="14" fill="#0b6b45" />
    <path d="M31.9 15.2A12.5 12.5 0 1 0 35.8 30" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    <path d="m30.2 10.8 2.1 6.1-6.2 1.4" stroke="#8ce3b1" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 23.8h9.4M24 19v10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="19" cy="23.8" r="2.1" fill="#8ce3b1" />
    <circle cx="28.5" cy="23.8" r="2.1" fill="#8ce3b1" />
  </svg>
);

const Tagline: React.FC<{ className: string }> = ({ className }) => (
  <span className={`font-bold leading-none tracking-[0.22em] ${className}`} aria-label="zero waste">
    <span style={{ color: 'var(--accent-alt)' }}>z</span>
    <span style={{ color: 'var(--accent)' }}>E</span>
    <span style={{ color: 'var(--accent-alt)' }}>r</span>
    <span style={{ color: 'var(--accent-alt)' }}>o</span>
    <span aria-hidden="true"> </span>
    <span style={{ color: 'var(--accent)' }}>WASTE</span>
  </span>
);

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = true, className = '' }) => {
  const dimensions = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <CircuitMark className={dimensions.mark} />
      <span className="flex min-w-0 flex-col">
        <span className={`whitespace-nowrap font-extrabold leading-[0.95] tracking-[-0.045em] ${dimensions.name}`}>
          <span style={{ color: 'var(--text-primary)' }}>Re-</span>
          <span style={{ color: 'var(--primary)' }}>Circuit</span>
        </span>
        {showTagline && <Tagline className={`${dimensions.tagline} mt-1.5`} />}
      </span>
    </span>
  );
};

export default BrandLogo;
