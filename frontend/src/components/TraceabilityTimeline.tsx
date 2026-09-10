import React from 'react';
import { Check, Circle, Clock3, Route } from 'lucide-react';
import type { TraceEvent } from '../types';

interface TraceabilityTimelineProps {
  events: TraceEvent[];
  className?: string;
  variant?: 'vertical' | 'responsive';
  transactionId?: string;
}

const statusIcon = (status: TraceEvent['status']) => {
  if (status === 'completed') return <Check size={14} strokeWidth={2.6} />;
  if (status === 'current') return <Clock3 size={14} />;
  return <Circle size={8} fill="currentColor" />;
};

const statusStyle = (status: TraceEvent['status']): React.CSSProperties => {
  if (status === 'completed') return { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' };
  if (status === 'current') return { backgroundColor: '#f3bc58', borderColor: '#d79a2f', color: '#392606' };
  return { backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)', color: 'var(--text-tertiary)' };
};

const EventCopy: React.FC<{ event: TraceEvent; centered?: boolean }> = ({ event, centered = false }) => (
  <div className={`${centered ? 'md:text-center' : ''}`}>
    <p className="text-sm font-bold leading-snug" style={{ color: event.status === 'upcoming' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{event.label}</p>
    {event.description && <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>}
    <p className="mt-1.5 text-[0.67rem] font-medium" style={{ color: 'var(--text-tertiary)' }}>
      {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : event.status === 'upcoming' ? 'Upcoming' : 'In progress'}
    </p>
  </div>
);

const TraceabilityTimeline: React.FC<TraceabilityTimelineProps> = ({ events, className = '', variant = 'vertical', transactionId }) => {
  if (events.length === 0) return null;

  return (
    <div className={className}>
      {transactionId && <div className="mb-5 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}><Route size={15} style={{ color: 'var(--primary)' }} /><span className="font-semibold">Transaction ID</span><code className="ml-auto truncate font-bold" style={{ color: 'var(--text-primary)' }}>{transactionId}</code></div>}

      {variant === 'responsive' ? (
        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="flex min-w-max flex-col md:flex-row" role="list" aria-label="Traceability stages">
            {events.map((event, index) => (
              <div key={event.stage} className="relative flex w-[17rem] gap-4 pb-5 md:w-36 md:flex-col md:items-center md:gap-3 md:px-2 md:pb-0" role="listitem">
                <div className="relative z-10 flex flex-col items-center md:flex-row md:self-stretch">
                  {index > 0 && <span className="hidden h-0.5 flex-1 md:block" style={{ backgroundColor: event.status === 'upcoming' ? 'var(--border)' : 'var(--primary)' }} />}
                  <span className={`grid h-9 w-9 flex-none place-items-center rounded-full border-2 ${event.status === 'current' ? 'status-pulse' : ''}`} style={statusStyle(event.status)}>{statusIcon(event.status)}</span>
                  {index < events.length - 1 && <span className="hidden h-0.5 flex-1 md:block" style={{ backgroundColor: event.status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />}
                  {index < events.length - 1 && <span className="my-1 h-full min-h-8 w-0.5 md:hidden" style={{ backgroundColor: event.status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />}
                </div>
                <div className="min-w-0 flex-1 md:w-full"><EventCopy event={event} centered /></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col" role="list" aria-label="Traceability stages">
          {events.map((event, index) => (
            <div key={event.stage} className="flex gap-4" role="listitem">
              <div className="flex flex-col items-center">
                <span className={`z-10 grid h-9 w-9 flex-none place-items-center rounded-full border-2 ${event.status === 'current' ? 'status-pulse' : ''}`} style={statusStyle(event.status)}>{statusIcon(event.status)}</span>
                {index < events.length - 1 && <span className="my-1 w-0.5 flex-1" style={{ backgroundColor: event.status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />}
              </div>
              <div className={`min-w-0 pb-7 ${index === events.length - 1 ? 'pb-0' : ''}`}><EventCopy event={event} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TraceabilityTimeline;
