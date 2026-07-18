import React from 'react';
import useNotificationStore from '../store/notificationStore';
import useThemeStore from '../store/themeStore';
import { X, Trash2, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';

export default function NotificationPanel() {
  const { isDark } = useThemeStore();
  const { 
    notifications, 
    isOpen, 
    setOpen, 
    markAsRead, 
    markAllRead, 
    clearNotification, 
    clearAll 
  } = useNotificationStore();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-200"
      />

      {/* Slide-out Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-[380px] shadow-2xl z-50 flex flex-col transition-all duration-300 animate-slide-left text-left border-l ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <BellRing size={16} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-wider">ERP Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-1.8 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setOpen(false)}
            className={`p-1.5 hover:${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-lg transition`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Controls */}
        {notifications.length > 0 && (
          <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-bold ${
            isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <button 
              onClick={markAllRead}
              className="text-blue-600 hover:underline"
            >
              Mark all read
            </button>
            <button 
              onClick={clearAll}
              className="text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 size={11} />
              Clear all
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
              <BellRing size={28} className="stroke-1 text-slate-300 animate-pulse" />
              <span className="text-xs font-semibold">No recent notifications.</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 transition duration-150 relative cursor-pointer group flex items-start gap-3 hover:${
                  isDark ? 'bg-slate-800/20' : 'bg-slate-50'
                } ${!n.read ? (isDark ? 'bg-blue-950/10' : 'bg-blue-50/20') : ''}`}
              >
                {/* Unread dot indicator */}
                {!n.read && (
                  <span className="absolute left-2 top-5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}

                <div className="mt-0.5">{getIcon(n.type)}</div>

                <div className="flex-1 space-y-1">
                  <p className={`text-xs font-bold leading-normal ${
                    !n.read 
                      ? (isDark ? 'text-white' : 'text-slate-900') 
                      : (isDark ? 'text-slate-400' : 'text-slate-500')
                  }`}>
                    {n.message}
                  </p>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">{n.time}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(n.id);
                  }}
                  className={`p-1 text-slate-400 hover:text-red-650 opacity-0 group-hover:opacity-100 rounded transition`}
                  title="Delete Notification"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
