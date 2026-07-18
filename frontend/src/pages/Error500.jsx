import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function Error500() {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl border text-center shadow-lg ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-955/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm animate-pulse">
          <ServerCrash size={28} />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">Internal Service Exception</h1>
        <p className="text-xs font-semibold text-slate-505 dark:text-slate-400 mb-8 leading-relaxed">
          The StockerAI enterprise ledger database server encountered an unexpected error. System logs are being generated automatically.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-55'
            }`}
          >
            <RefreshCw size={13} />
            Retry Link
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
