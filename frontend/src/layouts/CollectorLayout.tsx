import React from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { Home, Briefcase, ScanLine, Archive, CreditCard, User } from 'lucide-react';
import DashboardTopbar from '../components/DashboardTopbar';
import AnimatedOutlet from '../components/AnimatedOutlet';

const collectorNavItems = [
  { label: 'Home', href: '/collector', icon: Home },
  { label: 'Jobs', href: '/collector/jobs', icon: Briefcase },
  { label: 'Payment Gateway', href: '/collector/payments', icon: CreditCard },
  { label: 'Scan', href: '/collector/scan', icon: ScanLine },
  { label: 'Inventory', href: '/collector/inventory', icon: Archive },
  { label: 'Profile', href: '/collector/profile', icon: User },
];

const CollectorLayout: React.FC = () => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar items={collectorNavItems} />
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/60">
      <DashboardTopbar />
      <main className="flex-1 page-pb">
        <AnimatedOutlet />
      </main>
    </div>
    <MobileBottomNav items={collectorNavItems} />
  </div>
);

export default CollectorLayout;
