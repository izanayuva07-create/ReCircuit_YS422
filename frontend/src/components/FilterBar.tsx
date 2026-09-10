import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  active: string;
  onChange: (val: string) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, active, onChange, className = '' }) => (
  <div className={`flex gap-2 overflow-x-auto pb-1 ${className}`}>
    {filters.map((f) => (
      <button
        type="button"
        key={f.value}
        onClick={() => onChange(f.value)}
        className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border"
        style={{
          backgroundColor: active === f.value ? 'var(--primary)' : 'var(--surface)',
          color: active === f.value ? '#fff' : 'var(--text-secondary)',
          borderColor: active === f.value ? 'var(--primary)' : 'var(--border)',
        }}
      >
        {f.label}
      </button>
    ))}
  </div>
);

export default FilterBar;
