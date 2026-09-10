import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface AppContextValue {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  toasts: ToastItem[];
  toastMessage: string | null;
  toastType: ToastType;
  showToast: (message: string, type?: ToastType, durationMs?: number) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
