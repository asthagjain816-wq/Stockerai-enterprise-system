import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Plus, X, Mail, Phone, MapPin } from 'lucide-react';

export default function Suppliers() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useThemeStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });

  const suppliers = [
    {
      id: 'TECH-001',
      name: 'TechCorp',
      email: 'contact@techcorp.com',
      phone: '+91-9999-999999',
      location: 'Mumbai',
    },
    {
      id: 'GLOB-001',
      name: 'GlobalSupply',
      email: 'info@globalsupply.com',
      phone: '+91-8888-888888',
      location: 'Delhi',
    },
  ];

  const handleAddSupplier = () => {
    if (formData.name && formData.email) {
      console.log('Supplier added:', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', location: '' });
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Suppliers
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Manage your supplier network
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition shadow-lg"
            >
              <Plus size={20} />
              Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:shadow-lg'} rounded-xl shadow-sm p-6 transition-all duration-300`}
              >
                <div className="mb-4">
                  <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {supplier.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {supplier.id}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                      {supplier.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                      {supplier.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className={isDark ? 'text-red-400' : 'text-red-600'} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                      {supplier.location}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl p-8 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Add Supplier
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 hover:${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg transition`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter supplier name"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@email.com"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-0000-000000"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <button
                onClick={handleAddSupplier}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 rounded-lg transition"
              >
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}