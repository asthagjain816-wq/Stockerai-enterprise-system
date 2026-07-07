import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Bell, Menu, X, Moon, Sun, User, Settings, LogOut } from 'lucide-react';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const notifications = [
    { id: 1, message: 'New collective order generated', time: 'Just now' },
    { id: 2, message: 'Low stock items detected', time: '1 hour ago' },
  ];

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      className={`${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-200'
      } backdrop-blur-md shadow-sm flex items-center justify-between px-6 h-20 border-b sticky top-0 z-30`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition ${
            isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex items-center gap-5">
        {/* Dark Mode toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition ${
            isDark ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-gray-100 text-slate-600'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`p-2.5 rounded-xl relative transition ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-slate-650'
            }`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </button>

          {notificationOpen && (
            <div
              className={`absolute right-0 mt-2.5 w-80 rounded-2xl shadow-2xl border z-50 animate-scale-up ${
                isDark
                  ? 'bg-slate-800/95 border-slate-700 text-white'
                  : 'bg-white/95 border-gray-200 text-gray-800'
              }`}
            >
              <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-250'}`}>
                <h3 className="font-bold">Notifications</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b last:border-0 hover:${
                      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                    } transition`}
                  >
                    <p className="text-sm font-semibold">{notif.message}</p>
                    <span className="text-xs text-gray-400">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Icon Wrapper */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-500/5 transition text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-extrabold flex items-center justify-center shadow-lg transition transform hover:scale-105">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-tight">{user?.fullName || 'StockerAI User'}</p>
              <p className="text-xs text-gray-400 font-semibold leading-none mt-0.5">
                {user?.email || 'admin@stockerai.com'}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border z-50 animate-scale-up py-2 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-200 text-gray-850'
              }`}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                <p className="font-bold text-sm truncate mt-1">{user?.fullName || 'Administrator'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                    isDark ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Settings size={18} className="text-gray-400" />
                  Account Settings
                </Link>
              </div>

              <div className={`border-t py-1 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left font-bold"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}