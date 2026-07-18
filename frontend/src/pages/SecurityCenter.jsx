import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  RefreshCw, 
  Database, 
  Key, 
  AlertTriangle,
  Check, 
  Eye, 
  EyeOff,
  Server,
  CloudLightning,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function SecurityCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const { isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [showBackupKey, setShowBackupKey] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);
  const [backupLogs, setBackupLogs] = useState([
    { id: 1, type: 'Automated SQLite Dump', size: '14.2 MB', status: 'Success', time: '10:30 AM (Today)' },
    { id: 2, type: 'AWS S3 Cloud Replication', size: '14.1 MB', status: 'Success', time: '10:31 AM (Today)' },
    { id: 3, type: 'Automated SQLite Dump', size: '14.1 MB', status: 'Success', time: '10:30 AM (Yesterday)' },
    { id: 4, type: 'AWS S3 Cloud Replication', size: '14.0 MB', status: 'Success', time: '10:32 AM (Yesterday)' },
  ]);

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', location: 'New Delhi, IN', ip: '103.45.12.18', status: 'Current Session', time: 'Active now' },
    { id: 2, device: 'Safari on iPhone 15', location: 'Mumbai, IN', ip: '157.34.89.201', status: 'Active', time: '2 hours ago' },
    { id: 3, device: 'StockerAI Desktop Client v1.2', location: 'Bangalore, IN', ip: '182.91.44.7', status: 'Active', time: '1 day ago' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Rotate Master JWT secret keys (Recommended in 12 days)', completed: false },
    { id: 2, text: 'Enable strict CORS policies on local backend port 5000', completed: true },
    { id: 3, text: 'Limit concurrent admin logins to 3 active sessions', completed: true },
    { id: 4, text: 'Deactivate dormant vendor accounts (none currently)', completed: true },
  ]);

  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    showToast('Session successfully revoked and authorization tokens invalidated.', 'success');
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-6">
          
          {/* Top Section / Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <Breadcrumbs />
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-blue-50 text-blue-600 dark:bg-slate-900 dark:text-blue-400 px-2.5 py-0.8 rounded-full border border-blue-100 dark:border-blue-900/30">
                  Security Hub
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active Shield Enabled
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                Security Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage authorization layers, rotate environment keys, audit active sessions, and review backup integrity logs.
              </p>
            </div>
          </div>

          {/* MAIN GRID */}
          {loading ? (
            <div className="space-y-6">
              <SkeletonStats />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/4 mb-4"></div>
                  <div className="space-y-3.5 w-full">
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3 mb-4"></div>
                  <div className="space-y-3 w-full">
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Left 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Key Security Controls */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Lock size={18} className="text-blue-600" />
                  Access Credentials & Multi-Factor Auth
                </h3>

                <div className="space-y-6">
                  {/* Two-Factor Authentication Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Protects your database write/edit privileges with a mobile authenticator.</p>
                    </div>
                    <button
                      onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        is2FAEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Environment & Encrypted Secret Keys */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">API Gateway Encryption Credentials</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Session Key</span>
                        <div className="flex items-center justify-between mt-2">
                          <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                            {showBackupKey ? 'stockerai_jwt_secret_sha256_main_node' : '••••••••••••••••••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowBackupKey(!showBackupKey)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            {showBackupKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Age & Rotation</span>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">Created 18 days ago</p>
                        </div>
                        <button
                          onClick={() => showToast("Rotating secret JWT keys... Server will restart.", "info")}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold text-left hover:underline mt-2 flex items-center gap-1"
                        >
                          <RefreshCw size={12} />
                          Force Rotate Keys Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Device Sessions */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone size={18} className="text-blue-600" />
                    Authorized Device Sessions
                  </h3>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 dark:bg-slate-900/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2.5 py-1 rounded-full">
                    {sessions.length} Active Nodes
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessions.map(session => (
                    <div key={session.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {session.device}
                            {session.status === 'Current Session' && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/20">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            IP: <span className="font-semibold">{session.ip}</span> • Location: <span className="font-semibold">{session.location}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-[11px] text-slate-400 font-semibold">{session.time}</span>
                        {session.status !== 'Current Session' && (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-xs font-bold text-red-650 hover:text-red-750 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 hover:border-red-200 rounded-lg transition"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-6">
              
              {/* Security Shield Score */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm relative overflow-hidden ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                {/* Accent background blur */}
                <div className="absolute top-[-20%] right-[-20%] w-[120px] h-[120px] rounded-full bg-blue-500/10 blur-[30px] pointer-events-none z-0"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner mb-4">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Security Score</h3>
                  <p className="text-3xl font-black text-emerald-500 mt-2">EXCELLENT</p>
                  <p className="text-xs text-slate-500 mt-1">98% Protected Index</p>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">SSL Certificate</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <Check size={12} className="text-emerald-500" />
                        Valid (SHA-256)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">API Firewalls</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <Check size={12} className="text-emerald-500" />
                        Active (Shield)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SQLite & S3 Backup Log Integrity */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg">
                    <Database size={16} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Integrity Backup Logs</h3>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {backupLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-200/40 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/50 flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{log.type}</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/20 flex-shrink-0">
                          {log.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Size: {log.size}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Tasks Checklist */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-blue-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Proactive Auditing</h3>
                </div>

                <div className="space-y-3">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-2.5 text-left cursor-pointer" 
                      onClick={() => handleToggleTask(task.id)}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // toggled on parent div click
                        className="h-3.5 w-3.5 text-blue-600 border-slate-350 dark:border-slate-700 rounded mt-0.5 cursor-pointer"
                      />
                      <span className={`text-xs font-semibold leading-tight select-none cursor-pointer ${
                        task.completed ? 'line-through text-slate-450 dark:text-slate-650' : 'text-slate-700 dark:text-slate-200'
                      }`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          )}

        </main>
      </div>
    </div>
  );
}
