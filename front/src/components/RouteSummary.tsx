import React from 'react';
import { ArrowRight, Clock3, Navigation } from 'lucide-react';
import type { DemoRouteData } from '../data/locations';

interface RouteSummaryProps {
  route: DemoRouteData;
  className?: string;
}

const RouteSummary: React.FC<RouteSummaryProps> = ({ route, className = '' }) => (
  <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${className}`} style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.82)' }}>
    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Navigation size={18} /></span>
    <div className="min-w-0 flex-1"><p className="text-[0.68rem] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--primary)' }}>{route.status}</p><p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-bold"><span className="truncate">{route.from}</span><ArrowRight size={14} className="flex-none" /><span className="truncate">{route.to}</span></p></div>
    <div className="flex gap-2 text-xs font-bold sm:flex-col sm:items-end"><span>{route.distance}</span><span className="inline-flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Clock3 size={12} />{route.eta}</span></div>
  </div>
);

export default RouteSummary;
