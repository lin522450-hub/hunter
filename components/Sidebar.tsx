
import React from 'react';
import { AppSection } from '../types';

interface SidebarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: AppSection.Dashboard, label: 'Dashboard 儀表板', icon: '📊' },
    { id: AppSection.Companies, label: 'Company List 公司名單', icon: '🏢' },
    { id: AppSection.Analytics, label: 'Market Insights 市場分析', icon: '📈' },
    { id: AppSection.Settings, label: 'Settings 系統設定', icon: '⚙️' },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-blue-600 p-1.5 rounded-lg">G1K</span> 
          <span className="tracking-tight">CRM 系統</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/40/40" className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt="Avatar" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">資深開發經理</p>
            <p className="text-xs text-slate-500 truncate">bd.lead@g1000.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
