import React from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Home, Plus, CalendarCheck, History, Award, Gamepad2, User } from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import AnimatedOutlet from '../components/AnimatedOutlet';

const sourceNavItems = [
  { label: 'Home', href: '/source', icon: Home },
  { label: 'Sell', href: '/source/sell', icon: Plus },
  { label: 'Bookings', href: '/source/bookings', icon: CalendarCheck },
  { label: 'History', href: '/source/history', icon: History },
  { label: 'Certificates', href: '/source/certificates', icon: Award },
  { label: 'Eco-Game', href: '/source/gamification', icon: Gamepad2 },
  { label: 'Profile', href: '/source/profile', icon: User },
];

const SourceLayout: React.FC = () => (
  <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
    <Sidebar items={sourceNavItems} />
    <div className="flex-1 flex flex-col min-w-0">
      <DashboardTopbar />
      <main className="flex-1 page-pb">
        <AnimatedOutlet />
      </main>
    </div>
    <MobileBottomNav items={sourceNavItems} />
  </div>
);

export default SourceLayout;
