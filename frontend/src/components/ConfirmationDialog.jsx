import React from 'react';
import useConfirmStore from '../store/confirmStore';
import useThemeStore from '../store/themeStore';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ConfirmationDialog() {
  const { isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel, closeConfirm } = useConfirmStore();
  const { isDark } = useThemeStore();

  if (!isOpen) return null;

  let icon = <AlertCircle size={22} className="text-red-500 animate-bounce" />;
  if (type === 'warning') {
    icon = <AlertTriangle size={22} className="text-amber-500 animate-pulse" />;
  } else if (type === 'info') {
    icon = <Info size={22} className="text-blue-500" />;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[200] p-4 backdrop-blur-xs animate-fade-in">
      <div 
        className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl text-left relative animate-scale-up ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' 
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40'
        }`}
      >
        <button 
          onClick={closeConfirm}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white leading-normal">
              {title || 'Confirm Action'}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 text-xs">
          <button
            onClick={onCancel}
            className={`px-4 py-2 font-bold rounded-xl border transition ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700/80' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-extrabold text-white rounded-xl transition shadow ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : type === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
