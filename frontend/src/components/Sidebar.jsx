import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3, LogOut, X } from 'lucide-react';

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { isDark } = useThemeStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Users, label: 'Suppliers', path: '/suppliers' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`${
          open
            ? 'w-64 left-0 shadow-2xl md:shadow-none'
            : 'w-0 -translate-x-full md:w-20 md:translate-x-0 md:left-0 overflow-hidden'
        } ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-slate-800 border-slate-700'
        } text-white transition-all duration-300 flex flex-col fixed h-screen z-50 border-r`}
      >
        {/* Header logo area */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-850">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
              S
            </div>
            {open && (
              <span className="ml-3 font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                StockerAI
              </span>
            )}
          </div>
          {/* Close button inside sidebar on mobile */}
          {open && (
            <button 
              onClick={() => setOpen(false)} 
              className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu links list */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => {
                  // Close sidebar drawer automatically on link click on mobile
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {open && (
                  <span className="text-sm font-bold tracking-tight">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom action */}
        <div className="p-3 border-t border-slate-850">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-200 font-bold"
          >
            <LogOut size={20} />
            {open && (
              <span className="text-sm font-bold tracking-tight">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}