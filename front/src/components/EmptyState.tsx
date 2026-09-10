import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { PackageSearch } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageSearch,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--primary-subtle)' }}
      >
        <Icon size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
