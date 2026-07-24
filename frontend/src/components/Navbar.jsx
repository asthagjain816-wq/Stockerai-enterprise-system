import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useNotificationStore from '../store/notificationStore';
import useLanguageStore from '../store/languageStore';
import useToastStore from '../store/toastStore';
import useConfirmStore from '../store/confirmStore';
import { getApiBaseUrl } from '../config/apiConfig';
import NotificationPanel from './NotificationPanel';
import { 
  Bell, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Laptop,
  Check,
  Building,
  Shield,
  Edit3
} from 'lucide-react';

export default function Navbar({ sidebarOpen, setSidebarOpen, searchVal, onSearchChange }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, isDark, setTheme, toggleTheme } = useThemeStore();
  const { notifications, setOpen: setNotificationPanelOpen } = useNotificationStore();
  const { t } = useLanguageStore();
  const { showToast } = useToastStore();
  const { askConfirm } = useConfirmStore();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Quick Search Everywhere States
  const [searchItems, setSearchItems] = useState({ products: [], suppliers: [], orders: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search everywhere datasets on mount
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const [resP, resS, resO] = await Promise.all([
          fetch(`${baseUrl}/api/products`, { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false }),
          fetch(`${baseUrl}/api/suppliers`, { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false }),
          fetch(`${baseUrl}/api/orders`, { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false })
        ]);
        setSearchItems({
          products: resP.success ? resP.data : [],
          suppliers: resS.success ? resS.data : [],
          orders: resO.success ? resO.data : []
        });
      } catch (err) {
        console.error('Quick search data fetch failed:', err);
      }
    };
    fetchSearchData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const handleHelpClick = () => {
    showToast("StockerAI Help: support is available at support@stockerai.com.", "info");
    setProfileDropdownOpen(false);
  };

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  // Filtering calculations
  const query = searchVal || '';
  const isQueryEmpty = query.trim().length === 0;

  const filteredProducts = isQueryEmpty ? [] : searchItems.products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredSuppliers = isQueryEmpty ? [] : searchItems.suppliers.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    (s.code || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredOrders = isQueryEmpty ? [] : searchItems.orders.filter(o => 
    o.orderNumber.toLowerCase().includes(query.toLowerCase()) || 
    (o.orderType || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Inventory Ledger', path: '/inventory' },
    { name: 'Products Catalog', path: '/products' },
    { name: 'Orders Management', path: '/orders' },
    { name: 'Suppliers Network', path: '/suppliers' },
    { name: 'Analytics & Reports', path: '/analytics' },
    { name: 'Settings & Profile', path: '/settings' },
    { name: 'Security Center', path: '/security-center' }
  ];

  const filteredPages = isQueryEmpty ? [] : pages.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <nav
      className={`${
        isDark ? 'bg-slate-950/40 border-slate-900/50 shadow-lg shadow-black/5' : 'bg-white/80 border-slate-200'
      } backdrop-blur-md flex items-center justify-between px-4 h-14 border-b sticky top-0 z-30 transition-all duration-200`}
    >
      {/* LEFT: Menu button & Large Search Bar */}
      <div className="flex items-center gap-3 flex-1 lg:max-w-2xl max-w-xl">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 border ${
            isDark ? 'hover:bg-slate-900/50 border-transparent dark:hover:border-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Menu size={16} />
          <span className="hidden sm:inline">{t('Menu')}</span>
        </button>
 
        {/* Large Search Bar */}
        <div className="relative w-full" ref={searchDropdownRef}>
          <Search className={`absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-450'}`} size={15} />
          <input
            type="text"
            placeholder="Search catalog, routes..."
            value={searchVal || ''}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              onSearchChange && onSearchChange(e.target.value);
              setShowSearchDropdown(true);
            }}
            className={`w-full pl-9 pr-4 py-1.5 rounded-xl border text-xs transition focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
              isDark
                ? 'bg-slate-900/40 border-slate-850 text-white placeholder-slate-500 focus:bg-slate-900/80 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-slate-50 border-slate-205 text-slate-800 placeholder-slate-450'
            }`}
          />
          
          {/* Quick Search Everywhere Overlay Dropdown */}
          {showSearchDropdown && !isQueryEmpty && (
            <div className={`absolute left-0 right-0 mt-1 rounded-2xl border shadow-2xl p-4 z-[999] max-h-[380px] overflow-y-auto space-y-4 animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {filteredPages.length === 0 && filteredProducts.length === 0 && filteredSuppliers.length === 0 && filteredOrders.length === 0 ? (
                <div className="text-center text-[11px] py-4 text-slate-400 font-bold">
                  No quick matches found. Try general words or open Ctrl+K.
                </div>
              ) : (
                <div className="space-y-3.5 text-left text-xs font-bold">
                  {/* Pages Matches */}
                  {filteredPages.length > 0 && (
                    <div>
                      <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1 select-none">Navigation Links</p>
                      <div className="space-y-1">
                        {filteredPages.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => { navigate(p.path); setShowSearchDropdown(false); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${isDark ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            Go to <span className="text-blue-500 font-extrabold">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Matches */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mb-1 select-none">Matching Products</p>
                      <div className="space-y-1">
                        {filteredProducts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => { navigate(`/products?search=${p.sku}`); setShowSearchDropdown(false); }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${isDark ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            <span>{p.name}</span>
                            <span className="text-[9.5px] font-mono text-slate-400 font-medium">SKU: {p.sku}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supplier Matches */}
                  {filteredSuppliers.length > 0 && (
                    <div>
                      <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mb-1 select-none">Matching Suppliers</p>
                      <div className="space-y-1">
                        {filteredSuppliers.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => { navigate(`/suppliers?search=${s.code || ''}`); setShowSearchDropdown(false); }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${isDark ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            <span>{s.name}</span>
                            <span className="text-[9.5px] font-mono text-slate-450 font-medium">{s.code || ''}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Matches */}
                  {filteredOrders.length > 0 && (
                    <div>
                      <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mb-1 select-none">Matching Orders</p>
                      <div className="space-y-1">
                        {filteredOrders.map((o, idx) => (
                          <button
                            key={idx}
                            onClick={() => { navigate(`/orders?search=${o.orderNumber}`); setShowSearchDropdown(false); }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${isDark ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-55 text-slate-700'}`}
                          >
                            <span>{o.orderNumber} ({o.orderType})</span>
                            <span className="text-[9.5px] text-slate-450 font-medium">₹{o.totalAmount}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Notifications, Date, Profile */}
      <div className="flex items-center gap-4 flex-shrink-0 pl-3">
        {/* Date Display */}
        <span className="hidden md:inline text-xs font-bold text-slate-450 uppercase tracking-wider">
          {formattedDate}
        </span>


 
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationPanelOpen(true)}
            className={`p-2 rounded-xl relative transition border ${
              isDark ? 'hover:bg-slate-900/50 border-transparent dark:hover:border-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-550 border border-slate-200/60'
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
            )}
          </button>
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User Profile" className="w-8 h-8 rounded-lg object-cover shadow-sm transition transform hover:scale-105" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold flex items-center justify-center shadow-sm text-xs transition transform hover:scale-105 select-none">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </button>

          {profileDropdownOpen && (
            <div
              className={`absolute right-0 mt-2.5 w-60 rounded-2xl border z-50 animate-scale-up py-2 text-left text-xs font-bold backdrop-blur-md transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800/90 text-white shadow-2xl shadow-black/50'
                  : 'bg-white/90 border-slate-200/80 text-slate-800 shadow-2xl shadow-slate-250/30'
              }`}
            >
              {/* Header Profile Summary */}
              <div className={`px-4 py-2.5 border-b mb-1.5 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <p className="font-extrabold text-slate-900 dark:text-white leading-tight truncate">{user?.fullName || 'Astha Sethiya'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{user?.email || 'astha@stockerai.com'}</p>
              </div>

              {/* Menu Items */}
              <div className="p-1 space-y-0.5">
                <Link
                  to="/settings?tab=profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <User size={13.5} className="text-slate-400" />
                  My Profile
                </Link>

                <Link
                  to="/settings?tab=profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Edit3 size={13.5} className="text-slate-400" />
                  Edit Profile
                </Link>

                <Link
                  to="/settings?tab=security"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield size={13.5} className="text-slate-400" />
                  Account Settings
                </Link>

                <Link
                  to="/settings?tab=backup"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Building size={13.5} className="text-slate-400" />
                  Company Settings
                </Link>

                <Link
                  to="/settings?tab=preferences"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Moon size={13.5} className="text-slate-400" />
                  Theme
                </Link>

                <Link
                  to="/settings?tab=preferences"
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Bell size={13.5} className="text-slate-400" />
                  Notifications
                </Link>

                <button
                  onClick={() => { setProfileDropdownOpen(false); handleHelpClick(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-left ${
                    isDark ? 'hover:bg-slate-800/80 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle size={13.5} className="text-slate-400" />
                  Help Center
                </button>

                <div className={`border-t my-1.5 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`} />

                <button
                  onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-left text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20`}
                >
                  <LogOut size={13.5} className="text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render the slide-out drawer */}
      <NotificationPanel />
    </nav>
  );
}