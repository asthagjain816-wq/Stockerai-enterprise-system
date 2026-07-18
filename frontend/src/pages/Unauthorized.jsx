import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl border text-center shadow-lg ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="w-16 h-16 bg-red-50 dark:bg-red-955/20 text-red-650 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-xs font-semibold text-slate-505 dark:text-slate-400 mb-8 leading-relaxed">
          Your current user security clearance does not allow editing or auditing this workspace partition. Contact system administrator.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-55'
            }`}
          >
            <ArrowLeft size={13} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
          >
            <Home size={13} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
