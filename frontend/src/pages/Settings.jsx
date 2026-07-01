import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Settings as SettingsIcon, LogOut, Save } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isDark } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appName, setAppName] = useState('StockerAI');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Settings
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Manage your application settings
              </p>
            </div>

            {/* Success Message */}
            {saved && (
              <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
                ✓ Settings saved successfully!
              </div>
            )}

            {/* General Settings */}
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-6`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <SettingsIcon size={24} className="text-blue-600" />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  General Settings
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:outline-none focus:border-blue-500`}
                  />
                  <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Current: <span className="font-bold">{appName}</span>
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className={`${isDark ? 'bg-slate-800 border-red-900/50' : 'bg-red-50 border-red-200'} border-2 rounded-xl shadow-sm p-8`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 rounded-lg">
                  <LogOut size={24} className="text-red-600" />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Danger Zone
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Logout
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    You will be logged out from your account. You'll need to sign in again to access the system.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}