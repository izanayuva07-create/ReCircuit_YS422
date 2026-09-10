import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContext';
import type { ToastItem, ToastType } from './AppContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
    const timer = setTimeout(() => {
      timers.current.delete(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, Math.max(1000, durationMs));
    timers.current.set(id, timer);
    return id;
  }, []);

  const clearToasts = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  const latest = toasts[toasts.length - 1];
  const value = useMemo(() => ({
    notificationCount,
    setNotificationCount,
    toasts,
    toastMessage: latest?.message ?? null,
    toastType: latest?.type ?? 'info' as const,
    showToast,
    dismissToast,
    clearToasts,
  }), [clearToasts, dismissToast, latest?.message, latest?.type, notificationCount, showToast, toasts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
