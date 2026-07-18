import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, Box, ShoppingCart, Users, FileText, Settings, Sparkles, X, Plus, Clock, Star, Keyboard } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useActivityStore from '../store/activityStore';
import useLanguageStore from '../store/languageStore';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const { recentlyVisited, favorites } = useActivityStore();
  const { t } = useLanguageStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [catalogItems, setCatalogItems] = useState({ products: [], suppliers: [], orders: [] });
  const inputRef = useRef(null);

  // Focus input on mount & load database tables
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);

      // Load products, suppliers, orders
      const fetchPaletteData = async () => {
        try {
          const [resP, resS, resO] = await Promise.all([
            fetch('http://localhost:5000/api/products', { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false }),
            fetch('http://localhost:5000/api/suppliers', { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false }),
            fetch('http://localhost:5000/api/orders', { credentials: 'include' }).then(r => r.ok ? r.json() : { success: false })
          ]);
          setCatalogItems({
            products: resP.success ? resP.data : [],
            suppliers: resS.success ? resS.data : [],
            orders: resO.success ? resO.data : []
          });
        } catch (err) {
          console.error('Command palette fetch error:', err);
        }
      };
      fetchPaletteData();
    }
  }, [isOpen]);

  // Construct dynamic item suggestions array
  const baseItems = [
    // Pages navigation
    { label: `${t('dashboard')} (Page Link)`, category: 'Pages', action: () => navigate('/dashboard'), icon: Sparkles },
    { label: `${t('inventory')} (Page Link)`, category: 'Pages', action: () => navigate('/inventory'), icon: Folder },
    { label: `${t('products')} (Page Link)`, category: 'Pages', action: () => navigate('/products'), icon: Box },
    { label: `${t('orders')} (Page Link)`, category: 'Pages', action: () => navigate('/orders'), icon: ShoppingCart },
    { label: `${t('suppliers')} (Page Link)`, category: 'Pages', action: () => navigate('/suppliers'), icon: Users },
    { label: `${t('reports')} (Page Link)`, category: 'Pages', action: () => navigate('/analytics'), icon: FileText },
    { label: `${t('settings')} (Page Link)`, category: 'Pages', action: () => navigate('/settings'), icon: Settings },
    { label: `${t('securityCenter')} (Page Link)`, category: 'Pages', action: () => navigate('/security-center'), icon: Settings },
    
    // Quick Actions
    { label: 'Action: Create Purchase Order (PO)', category: 'Quick Actions', action: () => navigate('/orders?action=create'), icon: Plus },
    { label: 'Action: Receive Stock Inbound', category: 'Quick Actions', action: () => navigate('/inventory?action=receive'), icon: Plus },
    { label: 'Action: Issue Stock Outbound', category: 'Quick Actions', action: () => navigate('/inventory?action=issue'), icon: Plus },
    { label: 'Action: Add Product Template', category: 'Quick Actions', action: () => navigate('/products?action=create'), icon: Plus },
    { label: 'Action: Add Supplier Node', category: 'Quick Actions', action: () => navigate('/suppliers?action=create'), icon: Plus },
    { label: 'Action: Download CSV Audit Report', category: 'Quick Actions', action: () => navigate('/analytics?action=export'), icon: FileText },

    // Keyboard shortcuts help page
    { label: 'Shortcuts: Show Keyboard Shortcut List (Alt+H)', category: 'Shortcuts', action: () => {
      // Dispatch Alt+H event to trigger helpers overlay
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', altKey: true }));
    }, icon: Keyboard }
  ];

  // Dynamic Favorites (Pinned) Pages
  const favoriteItems = favorites.map(fav => ({
    label: `Pinned: ${t(fav.name.toLowerCase())}`,
    category: 'Favorites',
    action: () => navigate(fav.path),
    icon: Star
  }));

  // Dynamic Recently Visited Pages
  const visitedItems = recentlyVisited.map(v => ({
    label: `Visited: ${t(v.name.toLowerCase())}`,
    category: 'Recently Visited',
    action: () => navigate(v.path),
    icon: Clock
  }));

  // Product Database Queries
  const productMatches = catalogItems.products.map(p => ({
    label: `Product: ${p.name} (${p.sku})`,
    category: 'Products',
    action: () => navigate(`/products?search=${p.sku}`),
    icon: Box
  }));

  // Supplier Database Queries
  const supplierMatches = catalogItems.suppliers.map(s => ({
    label: `Supplier: ${s.name} (${s.code})`,
    category: 'Suppliers',
    action: () => navigate(`/suppliers?search=${s.code}`),
    icon: Users
  }));

  // Order Database Queries
  const orderMatches = catalogItems.orders.map(o => ({
    label: `Order: ${o.orderNumber} (Amount: ₹${o.totalAmount})`,
    category: 'Orders',
    action: () => navigate(`/orders?search=${o.orderNumber}`),
    icon: ShoppingCart
  }));

  const allItems = [
    ...favoriteItems,
    ...visitedItems,
    ...baseItems,
    ...productMatches,
    ...supplierMatches,
    ...orderMatches
  ];

  // Filter items based on query
  const filtered = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 15); // cap results at 15 items for layout bounds

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-start justify-center pt-[15vh] px-4">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[50vh] animate-scale-up ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' 
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40'
        }`}
      >
        {/* Search Input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-850">
          <Search className="text-slate-400 w-4 h-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type page route, action trigger, or search SKU catalog..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-450 border-0 p-0"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700 text-slate-450 font-sans">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 font-bold">
              No matching pages, categories, or action vectors.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => { item.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left text-xs font-bold ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : isDark ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className={`text-[9.5px] uppercase tracking-wider px-2 py-0.2 rounded-md ${
                    isSelected 
                      ? 'bg-blue-700 text-white' 
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer controls status */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 font-medium flex items-center justify-between select-none">
          <span>Use arrows to navigate, enter to select.</span>
          <span>StockerAI Command Engine</span>
        </div>
      </div>
    </div>
  );
}
