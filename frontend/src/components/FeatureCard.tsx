import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, className = '' }) => {
  const accent = color ?? 'var(--primary)';
  return (
    <div className={`card p-5 flex flex-col gap-3 ${className}`}>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color ? `${color}18` : 'var(--primary-subtle)' }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
};

export default FeatureCard;
