import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import NotificationCard from '../components/NotificationCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } = usePlatform();
  const navigate = useNavigate();
  const ordered = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-container py-7 md:py-10">
        <PageHeader
          eyebrow="Activity"
          title="Notifications"
          description={unreadNotificationCount ? `${unreadNotificationCount} update${unreadNotificationCount === 1 ? '' : 's'} need your attention.` : 'You are all caught up.'}
          backTo={`/${user?.role ?? ''}`}
          actions={unreadNotificationCount > 0 ? <Button variant="outline" leftIcon={<CheckCheck size={16} />} onClick={markAllNotificationsRead}>Mark all read</Button> : undefined}
        />
        <section className="card overflow-hidden max-w-3xl mt-7">
          {ordered.length ? ordered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => {
                markNotificationRead(notification.id);
                if (notification.linkTo) navigate(notification.linkTo);
              }}
            />
          )) : <EmptyState icon={Bell} title="No notifications yet" description="Bids, pickup changes, and recycling updates will appear here." />}
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;
