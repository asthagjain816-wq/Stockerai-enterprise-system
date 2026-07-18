import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, ShieldAlert, Sparkles } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useLanguageStore from '../store/languageStore';

export default function NotFound() {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const { t } = useLanguageStore();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 text-left ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Visual background accents */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className={`max-w-lg w-full p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md ${
        isDark ? 'bg-slate-900/60 border-slate-800 shadow-black/40' : 'bg-white/80 border-slate-200/65 shadow-slate-200/50'
      }`}>
        {/* Glow Border Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-650" />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-955/20 text-blue-650 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 select-none animate-pulse">
            404
          </div>
          <div className="text-center sm:text-left leading-tight">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Node Offline</h1>
            <p className="text-[11px] font-bold text-slate-450 uppercase tracking-widest mt-1">Directory Mapped Error</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested system node or database directory does not exist or has been relocated to another workspace index. Please query support manuals or return to the central index node.
        </p>

        {/* Quick Diagnostics Box */}
        <div className={`p-4 rounded-2xl border text-[11px] font-medium leading-relaxed space-y-1.5 ${
          isDark ? 'bg-slate-950/40 border-slate-850 text-slate-400' : 'bg-slate-50/60 border-slate-150 text-slate-500'
        }`}>
          <div className="font-extrabold uppercase text-[10px] text-slate-450 flex items-center gap-1.5 mb-1 select-none">
            <ShieldAlert size={12} className="text-amber-500" />
            System Diagnostics
          </div>
          <p>• Error Code: <span className="font-mono text-blue-500 font-bold">ERR_NODE_NOT_FOUND</span></p>
          <p>• Target Domain: <span className="font-mono">{window.location.pathname}</span></p>
          <p>• Action Vector: Re-authenticate session or initialize route validation checks.</p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => navigate(-1)}
            className={`flex-1 py-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750' : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={13} />
            Go Back Node
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home size={13} />
            {t('dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}