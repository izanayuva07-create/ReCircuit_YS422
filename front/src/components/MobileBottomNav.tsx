import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: NavItem[];
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items }) => {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href.split('/').filter(Boolean).length === 1}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-1 touch-target"
          style={({ isActive }) => ({
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
          })}
        >
          {({ isActive }) => (
            <>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
