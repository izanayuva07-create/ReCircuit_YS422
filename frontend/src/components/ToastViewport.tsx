import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const toastStyles = {
  success: { icon: CheckCircle2, color: '#15803d', background: '#f0fdf4', border: '#bbf7d0' },
  error: { icon: AlertCircle, color: '#dc2626', background: '#fef2f2', border: '#fecaca' },
  info: { icon: Info, color: '#2563eb', background: '#eff6ff', border: '#bfdbfe' },
};

const ToastViewport: React.FC = () => {
  const { toasts, dismissToast } = useAppContext();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[80] flex flex-col gap-2 sm:w-96" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className="rounded-xl border p-3 shadow-lg flex items-start gap-3"
            style={{ backgroundColor: style.background, borderColor: style.border }}
          >
            <Icon size={19} className="mt-0.5 flex-shrink-0" style={{ color: style.color }} />
            <p className="text-sm flex-1 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} className="p-1 -m-1 rounded-md" aria-label="Dismiss notification">
              <X size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastViewport;
