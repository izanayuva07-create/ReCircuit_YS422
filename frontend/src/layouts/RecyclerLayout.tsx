import React from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Home, Layers, ClipboardList, History, User } from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import AnimatedOutlet from '../components/AnimatedOutlet';

const recyclerNavItems = [
  { label: 'Home', href: '/recycler', icon: Home },
  { label: 'Lots', href: '/recycler/lots', icon: Layers },
  { label: 'Requests', href: '/recycler/requests', icon: ClipboardList },
  { label: 'History', href: '/recycler/history', icon: History },
  { label: 'Profile', href: '/recycler/profile', icon: User },
];

const RecyclerLayout: React.FC = () => (
  <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
    <Sidebar items={recyclerNavItems} />
    <div className="flex-1 flex flex-col min-w-0">
      <DashboardTopbar />
      <main className="flex-1 page-pb">
        <AnimatedOutlet />
      </main>
    </div>
    <MobileBottomNav items={recyclerNavItems} />
  </div>
);

export default RecyclerLayout;
