import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Plus, Search, X, Edit, Trash2, Check, ArrowRightLeft } from 'lucide-react';

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=120&auto=format&fit=crop&q=60',
  Clothing: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&auto=format&fit=crop&q=60',
  Food: 'https://images.unsplash.com/photo-1549007994-cb92ca8a3bd0?w=120&auto=format&fit=crop&q=60',
  Hardware: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=60',
  Other: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=60'
};

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState('Purchase');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderQty, setOrderQty] = useState(5);
  const { isDark } = useThemeStore();

  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Electronics',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 10,
    minimumStock: 5,
    imageUrl: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [inlineEditStockId, setInlineEditStockId] = useState(null);
  const [inlineStockVal, setInlineStockVal] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    fetchInventory();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, inventory]);

  const handleSaveItem = async () => {
    const payload = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      price: {
        cost: Number(formData.costPrice),
        selling: Number(formData.sellingPrice)
      },
      stock: {
        current: Number(formData.currentStock),
        minimum: Number(formData.minimumStock)
      },
      imageUrl: formData.imageUrl
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/api/products', {
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
          sku: '',
          description: '',
          category: 'Electronics',
          costPrice: 0,
          sellingPrice: 0,
          currentStock: 10,
          minimumStock: 5,
          imageUrl: ''
        });
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      category: item.category,
      costPrice: item.price?.cost || 0,
      sellingPrice: item.price?.selling || 0,
      currentStock: item.stock?.current || 0,
      minimumStock: item.stock?.minimum || 0,
      imageUrl: item.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this item?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          fetchInventory();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInlineStockSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          'stock.current': Number(inlineStockVal)
        })
      });
      const data = await res.json();
      if (data.success) {
        setInlineEditStockId(null);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkOrder = async () => {
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    const itemsPayload = selectedIds.map(id => {
      const item = inventory.find(i => i._id === id);
      return {
        product: id,
        quantity: Number(orderQty),
        price: orderType === 'Purchase' ? (item.price?.cost || 0) : (item.price?.selling || 0)
      };
    });

    const totalAmount = itemsPayload.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          orderType,
          supplier: selectedSupplier,
          items: itemsPayload,
          totalAmount,
          status: 'Pending'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowOrderModal(false);
        setSelectedIds([]);
        alert('Order generated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedIds.length > 0) {
      const firstItem = inventory.find(i => i._id === selectedIds[0]);
      if (firstItem) {
        const matched = suppliers.find(s => s.categories?.includes(firstItem.category));
        if (matched) {
          setSelectedSupplier(matched._id);
        } else if (suppliers.length > 0) {
          setSelectedSupplier(suppliers[0]._id);
        }
      }
    }
  }, [selectedIds, inventory, suppliers]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(inventory.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-55 text-gray-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Inventory Management
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                View, search, edit, and bulk-order your inventory catalog items
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  sku: '',
                  description: '',
                  category: 'Electronics',
                  costPrice: 0,
                  sellingPrice: 0,
                  currentStock: 10,
                  minimumStock: 5,
                  imageUrl: ''
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg animate-fade-in"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className={`absolute left-4 top-3.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="Search items by Name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute left-0 right-0 mt-1 rounded-lg shadow-xl border-2 z-40 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSearchTerm(item.name);
                      setShowSuggestions(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between border-b last:border-0 ${
                      isDark ? 'border-slate-700 hover:bg-slate-750' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.sku} - {item.category}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                      Stock: {item.stock?.current}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-md animate-slide-up">
              <span className="text-sm font-semibold text-blue-850">
                {selectedIds.length} items selected for ordering
              </span>
              <button
                onClick={() => setShowOrderModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow"
              >
                <ArrowRightLeft size={18} />
                Bulk Order Selected
              </button>
            </div>
          )}

          <div className={`rounded-xl shadow-sm overflow-hidden border ${isDark ? 'bg-slate-855 border-slate-750' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === inventory.length && inventory.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </th>
                    <th className="p-4 font-bold text-sm">Item</th>
                    <th className="p-4 font-bold text-sm">SKU</th>
                    <th className="p-4 font-bold text-sm">Category</th>
                    <th className="p-4 font-bold text-sm">Cost Price</th>
                    <th className="p-4 font-bold text-sm">Selling Price</th>
                    <th className="p-4 font-bold text-sm">Stock (Click to Edit)</th>
                    <th className="p-4 font-bold text-sm text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        No inventory items found. Add one above!
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr
                        key={item._id}
                        className={`border-b last:border-0 hover:${isDark ? 'bg-slate-800/50' : 'bg-gray-50/50'} transition`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={() => handleSelectRow(item._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <div>
                            <p className="font-bold text-base">{item.name}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.description}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold">{item.sku}</td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            item.category === 'Electronics' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'Clothing' ? 'bg-purple-100 text-purple-800' :
                            item.category === 'Food' ? 'bg-green-100 text-green-800' :
                            item.category === 'Hardware' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-semibold">₹{item.price?.cost || 0}</td>
                        <td className="p-4 text-sm font-semibold">₹{item.price?.selling || 0}</td>
                        <td className="p-4 text-sm">
                          {inlineEditStockId === item._id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={inlineStockVal}
                                onChange={(e) => setInlineStockVal(e.target.value)}
                                className={`w-16 px-1.5 py-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                                }`}
                              />
                              <button
                                onClick={() => handleInlineStockSave(item._id)}
                                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setInlineEditStockId(item._id);
                                setInlineStockVal(item.stock?.current || 0);
                              }}
                              className={`px-2.5 py-1 rounded text-sm font-bold border transition ${
                                (item.stock?.current || 0) <= (item.stock?.minimum || 0)
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                              }`}
                            >
                              {item.stock?.current || 0} / Min {item.stock?.minimum || 0}
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(item._id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden p-4 space-y-4">
              {filteredInventory.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No items found.</p>
              ) : (
                filteredInventory.map((item) => (
                  <div 
                    key={item._id}
                    className={`p-4 rounded-xl border flex flex-col gap-3 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-150 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => handleSelectRow(item._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <div>
                          <h4 className="font-bold text-base">{item.name}</h4>
                          <p className={`text-xs ${isDark ? 'text-slate-450' : 'text-gray-500'}`}>{item.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.category === 'Electronics' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'Clothing' ? 'bg-purple-100 text-purple-800' :
                        item.category === 'Food' ? 'bg-green-100 text-green-800' :
                        item.category === 'Hardware' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-dashed py-2.5 my-0.5 border-slate-700/20">
                      <div>
                        <span className="text-gray-400 font-semibold">SKU:</span> <span className="font-bold">{item.sku}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold">Cost:</span> <span className="font-bold">₹{item.price?.cost || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold">Selling:</span> <span className="font-bold text-emerald-500">₹{item.price?.selling || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {inlineEditStockId === item._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={inlineStockVal}
                              onChange={(e) => setInlineStockVal(e.target.value)}
                              className={`w-16 px-1.5 py-0.5 rounded border text-xs focus:outline-none ${
                                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'
                              }`}
                            />
                            <button
                              onClick={() => handleInlineStockSave(item._id)}
                              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setInlineEditStockId(item._id);
                              setInlineStockVal(item.stock?.current || 0);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold border transition ${
                              (item.stock?.current || 0) <= (item.stock?.minimum || 0)
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            Stock: {item.stock?.current || 0} / Min {item.stock?.minimum || 0}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleSoftDelete(item._id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-2xl p-6 max-w-lg w-full animate-scale-up`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-semibold mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">SKU (Unique Code) *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Current Stock *</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Minimum Alert Qty *</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveItem}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-md mt-2"
              >
                Save Inventory Item
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-2xl p-6 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Generate Collective Order</h2>
              <button onClick={() => setShowOrderModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <option value="Purchase">Purchase (Stock Addition)</option>
                  <option value="Sales">Sales (Stock Reduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Supplier *</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Quantity per Selected Item</label>
                <input
                  type="number"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>

              <button
                onClick={handleBulkOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition"
              >
                Place Bulk Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
