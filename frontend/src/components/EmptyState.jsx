import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function EmptyState({ title, description, icon: Icon, actionText, onAction }) {
  const { isDark } = useThemeStore();
  const DefaultIcon = Icon || SlidersHorizontal;

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border text-center max-w-sm mx-auto my-6 animate-scale-up ${
      isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'
    }`}>
      {/* Abstract Modern SaaS Illustration */}
      <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Background concentric glowing circles */}
          <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3 3" strokeOpacity="0.4" className="animate-spin" style={{ transformOrigin: '50% 50%', animationDuration: '20s' }} />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.15" />
          
          {/* Glassmorphic card shape representations */}
          <rect x="32" y="38" width="36" height="24" rx="4" fill={isDark ? '#1e293b' : '#ffffff'} fillOpacity="0.8" stroke="url(#grad2)" strokeWidth="1" className="shadow-sm" />
          
          {/* Abstract line metrics inside the card */}
          <line x1="38" y1="45" x2="52" y2="45" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
          <line x1="38" y1="50" x2="62" y2="50" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          <line x1="38" y1="55" x2="48" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          
          {/* Floating abstract dot indicators */}
          <circle cx="60" cy="45" r="2" fill="#10b981" className="animate-ping" style={{ transformOrigin: '60px 45px', animationDuration: '3s' }} />
          <circle cx="60" cy="45" r="1.5" fill="#10b981" />
          
          {/* Miniature database node cylinders */}
          <g transform="translate(68, 56) scale(0.7)">
            <path d="M0,5 C0,2.2 4.5,0 10,0 C15.5,0 20,2.2 20,5 L20,15 C20,17.8 15.5,20 10,20 C4.5,20 0,17.8 0,15 Z" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
            <ellipse cx="10" cy="5" rx="10" ry="2.5" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="0.75" />
            <line x1="0" y1="10" x2="20" y2="10" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 1" />
          </g>
        </svg>

        {/* Small floating pulse icon */}
        <div className="absolute bottom-2 right-6 p-1.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 flex items-center justify-center animate-bounce">
          <DefaultIcon size={12} />
        </div>
      </div>

      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-1.5">
        {title || 'No Records Mapped'}
      </h3>
      <p className="text-[11px] font-medium text-slate-450 dark:text-slate-400 mb-5 leading-relaxed max-w-[240px]">
        {description || 'Adjust your search queries or filter values to locate resources.'}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition shadow-md shadow-blue-500/10 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
