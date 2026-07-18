import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useActivityStore from '../store/activityStore';
import useLanguageStore from '../store/languageStore';
import useConfirmStore from '../store/confirmStore';
import {
  LayoutDashboard,
  Package,
  Box,
  Folder,
  Users,
  FileText,
  Settings,
  X,
  ChevronDown,
  User,
  Bell,
  Moon,
  Sun,
  LogOut,
  ShoppingCart,
  Star
} from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { favorites } = useActivityStore();
  const { t } = useLanguageStore();
  const { askConfirm } = useConfirmStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { icon: LayoutDashboard, label: 'dashboard', path: '/dashboard' },
    { icon: Package, label: 'inventory', path: '/inventory' },
    { icon: Box, label: 'products', path: '/products' },
    { icon: ShoppingCart, label: 'orders', path: '/orders' },
    { icon: Users, label: 'suppliers', path: '/suppliers' },
    { icon: FileText, label: 'reports', path: '/analytics' },
    { icon: Settings, label: 'settings', path: '/settings' },
  ];

  const handleLogout = () => {
    askConfirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of StockerAI? Unsaved changes in your session draft forms will be cleared.',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: () => {
        logout();
        navigate('/login');
      }
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`${
          open
            ? 'w-[240px] md:w-64 left-0 shadow-lg md:shadow-none'
            : 'w-0 -translate-x-full md:w-20 md:translate-x-0 md:left-0 overflow-hidden'
        } ${
          isDark
            ? 'bg-slate-950/40 border-slate-900/50 backdrop-blur-md text-white'
            : 'bg-white border-slate-200 text-slate-800'
        } transition-all duration-300 flex flex-col fixed h-screen z-50 border-r`}
      >
        {/* Header logo area */}
        <div className={`flex items-center justify-between h-16 px-5 border-b ${
          isDark ? 'border-slate-900/50' : 'border-slate-100'
        }`}>
          <div className="flex items-center">
            <div className="w-8.5 h-8.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              S
            </div>
            {open && (
              <span className="ml-3 font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                StockerAI Enterprise
              </span>
            )}
          </div>
          {/* Close button inside sidebar on mobile */}
          {open && (
            <button 
              onClick={() => setOpen(false)} 
              className={`md:hidden p-1.5 rounded-lg transition border ${
                isDark ? 'hover:bg-slate-900/50 text-slate-400 border-slate-800/40' : 'hover:bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <X size={18} />
            </button>
          )}
        </div>
 
        {/* Menu links list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative scale-on-hover ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' 
                    : isDark
                      ? 'text-slate-455 hover:bg-slate-900/50 hover:text-white border border-transparent font-medium'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                }`}
              >
                <Icon size={19} className={`transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                {open && (
                  <span className="text-sm tracking-tight capitalize">
                    {t(item.label)}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Favorites / Pinned Pages Section */}
          {open && favorites.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850/50 mt-4 space-y-1.5 animate-fade-in">
              <p className="text-[9.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3.5 flex items-center gap-1.5 select-none">
                <Star size={10} className="text-amber-500 fill-amber-500 animate-pulse" />
                Favorites
              </p>
              {favorites.map((fav, idx) => {
                const menuItem = menuItems.find(m => m.path === fav.path) || { icon: FileText, label: fav.name };
                const Icon = menuItem.icon;
                return (
                  <Link
                    key={idx}
                    to={fav.path}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-white border border-transparent dark:hover:border-slate-800/30"
                  >
                    <Icon size={13} className="text-slate-400" />
                    <span className="text-xs truncate capitalize">{t(menuItem.label)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Profile Card Dropdown Container */}
        <div className={`p-4 border-t relative ${isDark ? 'border-slate-900' : 'border-slate-100'}`} ref={dropdownRef}>
          {profileDropdownOpen && open && (
            <div className={`absolute bottom-18 left-4 right-4 rounded-2xl shadow-xl border p-1.5 z-55 flex flex-col animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}>
              <button
                onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <User size={14} className="text-slate-400" />
                My Profile
              </button>

              <button
                onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <Settings size={14} className="text-slate-400" />
                Account Settings
              </button>

              <button
                onClick={() => { setProfileDropdownOpen(false); navigate('/dashboard'); }}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <Bell size={14} className="text-slate-400" />
                Notifications
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Sun size={14} className="text-slate-400" /> : <Moon size={14} className="text-slate-400" />}
                  Dark Mode
                </div>
                <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${isDark ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDark ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
              </button>

              <div className={`h-px my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}

          {/* User Profile Card Toggle */}
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className={`w-full flex items-center justify-between p-1.5 rounded-xl transition text-left cursor-pointer border ${
              isDark ? 'hover:bg-slate-900/50 hover:border-slate-800/40 border-transparent' : 'hover:bg-slate-50 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Profile" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              {open && (
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-250 truncate">
                    {user?.fullName || 'Astha Sethiya'}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-550 font-medium">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              )}
            </div>
            {open && (
              <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}