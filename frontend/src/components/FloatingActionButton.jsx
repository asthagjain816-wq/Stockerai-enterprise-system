import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Box, ShoppingCart, PlusCircle, Users, FileText, ArrowDownLeft } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useLanguageStore from '../store/languageStore';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const { t } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside (using deferred listener registry)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleOutsideClick);
      };
    }
  }, [open]);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (open && e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const actions = [
    { label: 'Add Product', path: '/products', icon: Box, color: 'bg-blue-600 text-white' },
    { label: 'Add Order', path: '/orders', icon: ShoppingCart, color: 'bg-emerald-600 text-white' },
    { label: 'Add Supplier', path: '/suppliers', icon: Users, color: 'bg-purple-600 text-white' },
    { label: 'Add Category', path: '/products', icon: PlusCircle, color: 'bg-cyan-600 text-white' },
    { label: 'Stock Adjustment', path: '/inventory', icon: ArrowDownLeft, color: 'bg-indigo-600 text-white' },
    { label: 'Purchase Order', path: '/orders', icon: FileText, color: 'bg-rose-600 text-white' },
    { label: 'Generate Report', path: '/analytics', icon: FileText, color: 'bg-amber-600 text-white' },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 print:hidden select-none" ref={menuRef}>
      
      {/* Action items popup panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-38 md:bottom-24 right-6 mb-1.5 space-y-2 w-48 max-h-[60vh] overflow-y-auto pr-1 rounded-2xl border p-2 shadow-2xl backdrop-blur-md z-50 scrollbar-thin ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800/80 text-slate-200 shadow-black/50' 
                : 'bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-200/40'
            }`}
            role="menu"
            aria-label="Quick Actions"
          >
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(act.path);
                    setOpen(false);
                  }}
                  role="menuitem"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    isDark 
                      ? 'hover:bg-slate-800 hover:text-white' 
                      : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate mr-2">{act.label}</span>
                  <div className={`w-6.5 h-6.5 rounded-lg ${act.color} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                    <Icon size={12} />
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-750 hover:to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 transition duration-300 transform hover:scale-105 active:scale-95 cursor-pointer z-50 relative"
        title="Quick Actions Menu"
      >
        <Plus size={22} className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
