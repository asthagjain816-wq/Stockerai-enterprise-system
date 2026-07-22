import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import ProtectedRoute from './routes/ProtectedRoute';
import { getApiBaseUrl } from './config/apiConfig';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import SecurityCenter from './pages/SecurityCenter';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import Customers from './pages/Customers';
import Unauthorized from './pages/Unauthorized';
import Error500 from './pages/Error500';

import { useState } from 'react';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ToastContainer';
import FloatingActionButton from './components/FloatingActionButton';
import GlobalERPController from './components/GlobalERPController';
import BottomNav from './components/BottomNav';
import ConfirmationDialog from './components/ConfirmationDialog';

function App() {
  const { isDark } = useThemeStore();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (checkAuth) {
      checkAuth();
    }
    const pingBackend = async () => {
      try {
        await fetch(`${getApiBaseUrl()}/api/health`);
      } catch (e) {}
    };
    pingBackend();
    const interval = setInterval(pingBackend, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  return (
    <div className={isDark ? 'dark bg-slate-900 min-h-screen text-white' : 'bg-gray-55 min-h-screen text-gray-800'}>
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-4 text-center sticky top-0 z-55 flex items-center justify-center gap-1.5 shadow select-none animate-slide-down">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          Offline Mode: operating with local fallback cached data.
        </div>
      )}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastContainer />
        <ConfirmationDialog />
        <GlobalERPController />
        {isAuthenticated && <BottomNav onMenuToggle={() => setPaletteOpen(prev => !prev)} />}
        <FloatingActionButton />
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-center"
            element={
              <ProtectedRoute>
                <SecurityCenter />
              </ProtectedRoute>
            }
          />
           {/* Error & Fallback pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/error-500" element={<Error500 />} />
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;