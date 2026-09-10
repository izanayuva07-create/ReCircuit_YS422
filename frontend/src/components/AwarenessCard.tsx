import React from 'react';
import type { AwarenessCard as AwarenessCardType } from '../types';
import { Info } from 'lucide-react';
import { appIconMap } from '../utils/icons';

interface AwarenessCardProps {
  card: AwarenessCardType;
  compact?: boolean;
}

const AwarenessCard: React.FC<AwarenessCardProps> = ({ card, compact = false }) => {
  const IconComponent = appIconMap[card.icon] ?? Info;

  if (compact) {
    return (
      <div className="card p-3 flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: card.color ? `${card.color}18` : 'var(--primary-subtle)' }}
        >
          <IconComponent size={16} style={{ color: card.color ?? 'var(--primary)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{card.title}</p>
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{card.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: card.color ? `${card.color}18` : 'var(--primary-subtle)' }}
        >
          <IconComponent size={20} style={{ color: card.color ?? 'var(--primary)' }} />
        </div>
        <div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            {card.category}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.body}</p>
    </div>
  );
};

export default AwarenessCard;
