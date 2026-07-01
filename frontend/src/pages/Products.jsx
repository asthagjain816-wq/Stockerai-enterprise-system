import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import useThemeStore from '../store/themeStore';
import { Plus, Search, X } from 'lucide-react';

export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useThemeStore();
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock: '' });

  const products = [
    { name: 'MacBook Pro', sku: 'PROD-001', category: 'Electronics', price: '₹2,500', stock: '50' },
    { name: 'iPhone 15', sku: 'PROD-002', category: 'Electronics', price: '₹1,200', stock: '30' },
  ];

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddProduct = () => {
    console.log('Adding product:', formData);
    setShowModal(false);
    setFormData({ name: '', sku: '', price: '', stock: '' });
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
                Products
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Manage your inventory items
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute left-4 top-3.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              />
            </div>
          </div>

          <Table
            title="All Products"
            columns={['Product Name', 'SKU', 'Category', 'Price', 'Stock']}
            data={filtered}
          />
        </main>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl p-8 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Add Product
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 hover:${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {['name', 'sku', 'price', 'stock'].map((field) => (
                <div key={field}>
                  <label className={`block text-sm font-semibold mb-2 capitalize ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    {field}
                  </label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-2 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    } focus:outline-none focus:border-blue-500`}
                  />
                </div>
              ))}

              <button
                onClick={handleAddProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}