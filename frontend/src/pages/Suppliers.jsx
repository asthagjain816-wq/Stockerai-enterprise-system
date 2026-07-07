import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Plus, X, Mail, Phone, MapPin, Tag } from 'lucide-react';

export default function Suppliers() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useThemeStore();
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    categories: ['Electronics']
  });

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSaveSupplier = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill out all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        city: formData.location
      },
      categories: formData.categories
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:5000/api/suppliers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          categories: ['Electronics']
        });
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (s) => {
    setEditingId(s._id);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone,
      location: s.address?.city || '',
      categories: s.categories || ['Electronics']
    });
    setShowModal(true);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          fetchSuppliers();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCategoryCheckbox = (cat) => {
    setFormData(prev => {
      const current = prev.categories || [];
      if (current.includes(cat)) {
        return { ...prev, categories: current.filter(c => c !== cat) };
      } else {
        return { ...prev, categories: [...current, cat] };
      }
    });
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-55 text-gray-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Suppliers
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Manage your supplier network and configure categories supplied
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '', email: '', phone: '', location: '', categories: ['Electronics'] });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition shadow-lg"
            >
              <Plus size={20} />
              Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier._id}
                className={`${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:shadow-lg'} rounded-xl shadow-sm p-6 transition-all duration-300 border ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                <div className="mb-4">
                  <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {supplier.name}
                  </h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-450' : 'text-gray-450'}`}>
                    {supplier.code}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className={isDark ? 'text-blue-400' : 'text-blue-650'} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-705'}>
                      {supplier.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className={isDark ? 'text-green-400' : 'text-green-650'} />
                    <span className={isDark ? 'text-slate-300' : 'text-gray-705'}>
                      {supplier.phone}
                    </span>
                  </div>
                  {supplier.address?.city && (
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className={isDark ? 'text-red-400' : 'text-red-650'} />
                      <span className={isDark ? 'text-slate-300' : 'text-gray-705'}>
                        {supplier.address.city}
                      </span>
                    </div>
                  )}
                  {supplier.categories && supplier.categories.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Tag size={18} className="text-purple-500 mt-0.5" />
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.categories.map((c) => (
                          <span key={c} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold border border-purple-100 animate-pulse">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => handleEditClick(supplier)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier._id)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-2xl p-8 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Supplier' : 'Add Supplier'}
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
                <label className="block text-sm font-semibold mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter supplier name"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@email.com"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-0000-000000"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  City Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-55 border-gray-200'
                  } focus:outline-none focus:border-green-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Supplied Categories
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'].map(cat => (
                    <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.categories?.includes(cat)}
                        onChange={() => handleCategoryCheckbox(cat)}
                        className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveSupplier}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 rounded-lg transition"
              >
                Save Supplier Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}