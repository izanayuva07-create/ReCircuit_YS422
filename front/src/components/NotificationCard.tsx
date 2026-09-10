import React from 'react';
import type { Notification } from '../types';
import { Bell, CheckCircle, Truck, DollarSign, Info } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  bid: <DollarSign size={14} style={{ color: 'var(--success)' }} />,
  booking: <CheckCircle size={14} style={{ color: 'var(--primary)' }} />,
  pickup: <Truck size={14} style={{ color: 'var(--warning)' }} />,
  payment: <DollarSign size={14} style={{ color: 'var(--success)' }} />,
  system: <Info size={14} style={{ color: 'var(--info)' }} />,
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 border-b flex gap-3 items-start hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-green-50/50' : ''}`}
    style={{ borderColor: 'var(--border)' }}
  >
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)' }}>
      {typeIcon[notification.type] ?? <Bell size={14} />}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm ${notification.isRead ? '' : 'font-semibold'}`} style={{ color: 'var(--text-primary)' }}>
          {notification.title}
        </p>
        {!notification.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />}
      </div>
      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notification.message}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        {new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  </button>
);

export default NotificationCard;
