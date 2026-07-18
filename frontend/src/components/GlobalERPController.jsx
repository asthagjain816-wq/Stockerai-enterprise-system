import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Keyboard, X, ShieldAlert } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import useActivityStore from '../store/activityStore';
import useLanguageStore from '../store/languageStore';

export default function GlobalERPController() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, logout } = useAuthStore();
  const { toggleTheme, isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const { trackVisit } = useActivityStore();
  const { t } = useLanguageStore();

  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // 1. Inactivity Tracking
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearInterval(warningTimerRef.current);

    setShowTimeoutWarning(false);
    setCountdown(120);

    // Warn after 13 minutes of inactivity, logout at 15 minutes (13m = 780000ms)
    timerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      
      warningTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(warningTimerRef.current);
            logout();
            showToast('Session expired due to inactivity.', 'warning');
            setShowTimeoutWarning(false);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 13 * 60 * 1000);
  }, [isAuthenticated, logout, showToast, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      const handleUserActivity = () => resetInactivityTimer();
      
      events.forEach(e => window.addEventListener(e, handleUserActivity));
      resetInactivityTimer();
      
      return () => {
        events.forEach(e => window.removeEventListener(e, handleUserActivity));
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      };
    }
  }, [isAuthenticated, resetInactivityTimer]);

  // 2. Track Page Visits
  useEffect(() => {
    const getPageName = (path) => {
      if (path === '/dashboard') return 'Dashboard';
      if (path === '/inventory') return 'Inventory';
      if (path === '/products') return 'Products';
      if (path === '/orders') return 'Orders';
      if (path === '/suppliers') return 'Suppliers';
      if (path === '/analytics') return 'Reports';
      if (path === '/settings') return 'Settings';
      if (path === '/security-center') return 'Security Center';
      return '';
    };
    
    const name = getPageName(location.pathname);
    if (name) {
      trackVisit(location.pathname, name);
    }
  }, [location.pathname, trackVisit]);

  // 3. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAuthenticated) return;

      // Alt + Key combinations
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        
        const routes = {
          d: '/dashboard',
          i: '/inventory',
          p: '/products',
          o: '/orders',
          s: '/suppliers',
          r: '/analytics',
          c: '/security-center'
        };

        if (routes[key]) {
          e.preventDefault();
          navigate(routes[key]);
          showToast(`Navigated to ${routes[key].substring(1)}`, 'info');
        } else if (key === 't') {
          e.preventDefault();
          toggleTheme();
          showToast('Theme updated', 'info');
        } else if (key === 'h') {
          e.preventDefault();
          setShortcutsHelpOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, navigate, toggleTheme, showToast]);

  return (
    <>
      {/* Session Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center space-y-4 animate-scale-up ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Session Timeout Warning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              You have been inactive for a while. For security, you will be logged out in{' '}
              <span className="text-amber-500 font-extrabold">{countdown} seconds</span>.
            </p>
            <button
              onClick={resetInactivityTimer}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Panel */}
      {shortcutsHelpOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 animate-scale-up text-left ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <Keyboard className="text-blue-500 w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Keyboard Shortcuts</h3>
              </div>
              <button 
                onClick={() => setShortcutsHelpOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold">
              {[
                { shortcut: 'Ctrl + K', desc: 'Open Command Palette everywhere' },
                { shortcut: 'Alt + D', desc: 'Navigate to Dashboard' },
                { shortcut: 'Alt + I', desc: 'Navigate to Inventory Ledger' },
                { shortcut: 'Alt + P', desc: 'Navigate to Products Catalog' },
                { shortcut: 'Alt + O', desc: 'Navigate to Orders Management' },
                { shortcut: 'Alt + S', desc: 'Navigate to Suppliers Network' },
                { shortcut: 'Alt + R', desc: 'Navigate to Reports & Analytics' },
                { shortcut: 'Alt + C', desc: 'Navigate to Security Center' },
                { shortcut: 'Alt + T', desc: 'Toggle Dark / Light Theme' },
                { shortcut: 'Alt + H', desc: 'Open / Close Shortcuts Help' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-850 last:border-b-0">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{item.desc}</span>
                  <kbd className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded font-sans text-slate-650 dark:text-slate-350 shadow-xs">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShortcutsHelpOpen(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
            >
              Close Manual
            </button>
          </div>
        </div>
      )}
    </>
  );
}
