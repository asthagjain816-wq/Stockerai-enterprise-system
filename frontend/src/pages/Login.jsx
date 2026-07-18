import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import { Mail, Lock, Eye, EyeOff, LogIn, X } from 'lucide-react';
import Landing from './Landing';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'asthajain15733@gmail.com',
    password: 'Astha@123456',
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  // Close popup on pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login configuration error');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Landing Page */}
      <Landing />

      {/* Modal Overlay with subtle dark blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[6px] z-50 flex items-center justify-center p-4"
      >
        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
          className={`w-full max-w-[420px] rounded-2xl border overflow-hidden relative z-55 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/85 text-slate-800 dark:text-white shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.45)]`}
        >
          {/* Close button at top-right */}
          <button
            onClick={handleClose}
            className={`absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Form Header */}
          <div className="px-6 pt-7 pb-4 text-center">
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 border ${isDark ? 'bg-slate-850 text-blue-400 border-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
              <LogIn size={22} />
            </div>
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to orchestrate your StockerAI catalogs</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 text-left">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-3 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                <button
                  type="button"
                  onClick={() => showToast("Please contact support@stockerai.com to reset password.", "info")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition"
              />
               <label htmlFor="remember_me" className={`ml-2 block text-xs font-semibold cursor-pointer select-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Remember this device
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2.5 rounded-lg hover:opacity-95 shadow-md shadow-blue-500/10 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className={`flex-1 border-t ${isDark ? 'border-slate-850' : 'border-slate-200'}`}></div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450">OR</span>
              <div className={`flex-1 border-t ${isDark ? 'border-slate-850' : 'border-slate-200'}`}></div>
            </div>

            {/* Google Login button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border rounded-lg transition text-sm font-semibold shadow-xs ${isDark ? 'border-slate-750 text-slate-200 hover:bg-slate-850' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className={`px-6 py-4.5 border-t text-center text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-250/30'}`}>
            <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Don't have an enterprise account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-750 transition">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}