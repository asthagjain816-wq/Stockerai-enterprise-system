import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Bell, Search, Menu, X, Moon, Sun, LogOut, User } from 'lucide-react';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, message: 'New order received', time: '5 min ago' },
    { id: 2, message: 'Low stock alert', time: '1 hour ago' },
    { id: 3, message: 'New supplier added', time: '2 hours ago' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav
      className={`${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } shadow-sm flex items-center justify-between px-6 h-20 border-b sticky top-0 z-30`}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          } hidden md:block`}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xs mx-auto hidden sm:flex">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full ${
            isDark ? 'bg-slate-700' : 'bg-gray-100'
          }`}
        >
          <Search
            size={18}
            className={isDark ? 'text-slate-400' : 'text-gray-400'}
          />
          <input
            type="text"
            placeholder="Search..."
            className={`bg-transparent outline-none text-sm w-full ${
              isDark
                ? 'text-white placeholder-slate-500'
                : 'text-gray-700'
            }`}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`p-2 rounded-lg relative transition ${
              isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            <Bell
              size={22}
              className={isDark ? 'text-slate-300' : 'text-gray-600'}
            />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {notificationOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border z-50 ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div
                className={`p-4 border-b ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                <h3 className="font-bold">Notifications</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b cursor-pointer transition ${
                      isDark
                        ? 'border-slate-700 hover:bg-slate-700'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-medium">{notif.message}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {notif.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          }`}
        >
          {isDark ? (
            <Sun size={22} className="text-yellow-400" />
          ) : (
            <Moon size={22} />
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 pl-6 border-l ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">
                {user?.fullName || 'User'}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Profile Info */}
              <div className="p-6 border-b">
                <p className="font-bold">{user?.fullName}</p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>

              {/* Links */}
              <div className="p-2">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <User size={18} />
                  My Profile
                </Link>
              </div>

              {/* Logout */}
              <div className="p-2 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}