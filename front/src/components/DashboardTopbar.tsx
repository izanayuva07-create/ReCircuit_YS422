import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';
import BrandLogo from './BrandLogo';

const DashboardTopbar: React.FC = () => {
  const { unreadNotificationCount } = usePlatform();
  return (
    <header className="lg:hidden sticky top-0 z-40 border-b px-4 h-16 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.96)', borderColor: 'var(--border)', backdropFilter: 'blur(10px)' }}>
      <Link to="/"><BrandLogo size="sm" showTagline={false} /></Link>
      <Link to="/notifications" className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }} aria-label={`${unreadNotificationCount} unread notifications`}>
        <Bell size={20} />
        {unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: 'var(--danger)' }}>{Math.min(99, unreadNotificationCount)}</span>}
      </Link>
    </header>
  );
};

export default DashboardTopbar;
