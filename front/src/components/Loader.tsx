import React from 'react';
import BrandLogo from './BrandLogo';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  message?: string;
}

const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullPage = false, message }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} border-4 border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
      />
      {message && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" style={{ backgroundColor: 'var(--background)' }} role="status" aria-label={message ?? 'Loading Re-Circuit'}>
        <div className="w-full max-w-xl">
          <div className="flex justify-center"><BrandLogo size="md" /></div>
          <div className="mt-8 rounded-2xl border bg-white/70 p-5" style={{ borderColor: 'var(--border)' }} aria-hidden="true">
            <div className="skeleton h-4 w-28 rounded-full" />
            <div className="skeleton mt-4 h-9 w-4/5 rounded-lg" />
            <div className="skeleton mt-3 h-4 w-full rounded-full" />
            <div className="skeleton mt-2 h-4 w-2/3 rounded-full" />
            <div className="mt-6 grid grid-cols-3 gap-3"><div className="skeleton h-20 rounded-xl" /><div className="skeleton h-20 rounded-xl" /><div className="skeleton h-20 rounded-xl" /></div>
          </div>
          <p className="mt-4 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{message ?? 'Loading Re-Circuit…'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default Loader;
