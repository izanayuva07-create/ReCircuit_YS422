import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-1 overflow-x-auto border-b ${className}`} style={{ borderColor: 'var(--border)' }}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px`}
          style={{
            borderBottomColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
