import React from 'react';
import { BarChart2 } from 'lucide-react';
import { appIconMap } from '../utils/icons';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, change, changeType, color, className = '' }) => {
  const IconComponent = appIconMap[icon] ?? BarChart2;
  const accent = color ?? 'var(--primary)';

  return (
    <div className={`card p-4 flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color ? `${color}18` : 'var(--primary-subtle)' }}
        >
          <IconComponent size={18} style={{ color: accent }} />
        </div>
        {change && (
          <span
            className="text-xs font-medium"
            style={{ color: changeType === 'up' ? 'var(--success)' : changeType === 'down' ? 'var(--danger)' : 'var(--text-secondary)' }}
          >
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
          {value}<span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>{unit}</span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
