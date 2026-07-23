import React from 'react';
import useToastStore from '../store/toastStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const { isDark } = useThemeStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const { id, message, type } = toast;
        
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        let typeStyles = isDark 
          ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' 
          : 'bg-white border-slate-150 text-slate-800 shadow-slate-200/40';

        if (type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />;
        } else if (type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
        } else if (type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-500" />;
        } else if (type === 'info') {
          icon = <Info className="w-4 h-4 text-blue-500" />;
        }

        return (
          <div
            key={id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border shadow-lg pointer-events-auto animate-slide-left transition-all duration-300 ${typeStyles}`}
            role="alert"
          >
            <div className="flex-shrink-0">{icon}</div>
            <p className="text-xs font-bold text-left flex-1 leading-normal pr-1">{message}</p>
            <button
              onClick={() => removeToast(id)}
              className="flex-shrink-0 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
