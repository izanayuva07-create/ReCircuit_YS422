import React, { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, placeholder, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id ?? `${label?.toLowerCase().replace(/\s+/g, '-') || 'select'}-${generatedId.replace(/:/g, '')}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm appearance-none outline-none transition-all focus:ring-2
            ${error ? 'border-red-400 focus:ring-red-100' : 'focus:ring-green-100'}
            ${className}`}
          style={{
            borderColor: error ? 'var(--danger)' : 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }}>
          <ChevronDown size={16} />
        </span>
      </div>
      {error && <p id={`${inputId}-error`} className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
};

export default Select;
