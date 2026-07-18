import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, Menu } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useLanguageStore from '../store/languageStore';

export default function BottomNav({ onMenuToggle }) {
  const { isDark } = useThemeStore();
  const { t } = useLanguageStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'dashboard', path: '/dashboard' },
    { icon: Package, label: 'inventory', path: '/inventory' },
    { icon: ShoppingCart, label: 'orders', path: '/orders' },
    { icon: Settings, label: 'settings', path: '/settings' },
  ];

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 h-14 border-t z-40 px-4 flex items-center justify-around print:hidden ${
      isDark ? 'bg-slate-950/90 border-slate-900 backdrop-blur-md text-white' : 'bg-white/95 border-slate-200 backdrop-blur-md text-slate-800'
    }`}>
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 justify-center py-1 transition-all duration-200 ${
              isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-extrabold uppercase tracking-wide">{t(item.label)}</span>
          </NavLink>
        );
      })}
      
      {/* Mobile Sidebar Menu Trigger */}
      <button
        onClick={onMenuToggle}
        className="flex flex-col items-center gap-0.5 justify-center py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <Menu size={18} />
        <span className="text-[9px] font-extrabold uppercase tracking-wide">Menu</span>
      </button>
    </div>
  );
}
