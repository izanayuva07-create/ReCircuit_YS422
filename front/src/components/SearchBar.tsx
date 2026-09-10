import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative flex items-center ${className}`}>
    <Search size={16} className="absolute left-3 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-100"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
    />
    {value && (
      <button type="button" className="absolute right-3" onClick={() => onChange('')} aria-label="Clear search">
        <X size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>
    )}
  </div>
);

export default SearchBar;
