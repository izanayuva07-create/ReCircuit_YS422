import React, { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, hint, leftIcon, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id ?? `${label?.toLowerCase().replace(/\s+/g, '-') || 'input'}-${generatedId.replace(/:/g, '')}`;
  const descriptionId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-100' : 'focus:ring-green-100'}
            ${className}`}
          style={{
            borderColor: error ? 'var(--danger)' : 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
      </div>
      {error && <p id={`${inputId}-error`} className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p id={`${inputId}-hint`} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hint}</p>}
    </div>
  );
};

export default Input;
