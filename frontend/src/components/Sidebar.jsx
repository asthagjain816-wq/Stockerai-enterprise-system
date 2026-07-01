import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  LogOut,
} from 'lucide-react';

export default function Sidebar({ open }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isDark } = useThemeStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Suppliers', path: '/suppliers' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700'
          : 'bg-gradient-to-b from-slate-800 to-slate-700 border-slate-600'
      } text-white transition-all duration-300 flex flex-col fixed h-screen z-40 border-r`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-4 border-b border-slate-700">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
          S
        </div>
        {open && (
          <span className="ml-3 font-bold text-lg">StockerAI</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-700 hover:text-white transition duration-200"
            >
              <Icon size={20} />
              {open && (
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition duration-200"
        >
          <LogOut size={20} />
          {open && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}