import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  backTo?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, eyebrow, backTo, actions, className = '' }) => (
  <header className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${className}`}>
    <div className="min-w-0">
      {backTo && (
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> Back
        </Link>
      )}
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--primary)' }}>{eyebrow}</p>}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      {description && <p className="text-sm mt-1.5 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </header>
);

export default PageHeader;
