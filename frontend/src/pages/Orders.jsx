import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Plus, X, Check, Trash2, PartyPopper } from 'lucide-react';

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isDark } = useThemeStore();

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [formData, setFormData] = useState({
    orderType: 'Purchase',
    supplier: '',
    selectedProduct: '',
    quantity: 1,
    status: 'Pending'
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
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

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchInventory();
  }, []);

  const handleCreateOrder = async () => {
    if (!formData.selectedProduct) {
      alert('Please select a product');
      return;
    }
    const itemObj = inventory.find(p => p._id === formData.selectedProduct);
    const itemPrice = formData.orderType === 'Purchase' ? (itemObj.price?.cost || 0) : (itemObj.price?.selling || 0);

    const payload = {
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      orderType: formData.orderType,
      supplier: formData.supplier || undefined,
      items: [{
        product: formData.selectedProduct,
        quantity: Number(formData.quantity),
        price: itemPrice,
        unitPrice: itemPrice,
        total: itemPrice * Number(formData.quantity)
      }],
      totalAmount: itemPrice * Number(formData.quantity),
      status: formData.status
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchOrders();
        setFormData({
          orderType: 'Purchase',
          supplier: '',
          selectedProduct: '',
          quantity: 1,
          status: 'Pending'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkComplete = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Completed' })
      });
      const data = await res.json();
      if (data.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Delete this order record?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          fetchOrders();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') {
      return isDark ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700 border border-green-200';
    }
    if (status === 'Pending') {
      return isDark ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' : 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    }
    return isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-55 text-gray-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/10 animate-fade-in">
          <div className="bg-white text-gray-900 px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-green-400 animate-bounce">
            <PartyPopper className="text-green-500 w-8 h-8" />
            <span className="text-xl font-bold">Order Completed! Stock Synchronized. 🎉</span>
          </div>
        </div>
      )}

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Orders
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                View and manage your transaction invoices, sales receipts, and stock purchases
              </p>
            </div>
            <button
              onClick={() => {
                if (suppliers.length > 0) setFormData(f => ({ ...f, supplier: suppliers[0]._id }));
                if (inventory.length > 0) setFormData(f => ({ ...f, selectedProduct: inventory[0]._id }));
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg"
            >
              <Plus size={20} />
              Create Order
            </button>
          </div>

          <div className={`rounded-xl shadow-sm p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-6">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className="py-4 px-6 text-sm font-bold">Order ID</th>
                    <th className="py-4 px-6 text-sm font-bold">Type</th>
                    <th className="py-4 px-6 text-sm font-bold">Supplier</th>
                    <th className="py-4 px-6 text-sm font-bold">Items Count</th>
                    <th className="py-4 px-6 text-sm font-bold">Amount</th>
                    <th className="py-4 px-6 text-sm font-bold">Status</th>
                    <th className="py-4 px-6 text-sm font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No orders generated yet. Use Inventory bulk actions or add one above!
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className={`border-b hover:${isDark ? 'bg-slate-700/50' : 'bg-gray-50/50'} transition ${
                          isDark ? 'border-slate-700' : 'border-gray-100'
                        }`}
                      >
                        <td className="py-4 px-6 font-bold">{order.orderNumber}</td>
                        <td className={`py-4 px-6 text-sm font-semibold ${
                          order.orderType === 'Purchase' ? 'text-blue-500' : 'text-emerald-500'
                        }`}>{order.orderType}</td>
                        <td className="py-4 px-6 text-sm">{order.supplier?.name || 'Customer checkout'}</td>
                        <td className="py-4 px-6 text-sm">{order.items?.length || 0} items</td>
                        <td className="py-4 px-6 font-bold">₹{order.totalAmount?.toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleMarkComplete(order._id)}
                                title="Mark Completed & Sync Stock"
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 bg-red-105 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} rounded-xl shadow-2xl p-8 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Single Order</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Order Type</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <option value="Purchase">Purchase (Stock Addition)</option>
                  <option value="Sales">Sales (Stock Reduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Supplier (For Purchases)</label>
                <select
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Inventory Item *</label>
                <select
                  value={formData.selectedProduct}
                  onChange={(e) => setFormData({ ...formData, selectedProduct: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-55 border-gray-200'
                  }`}
                >
                  <option value="">Select Item</option>
                  {inventory.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Order Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark ? 'bg-slate-700 border-slate-650' : 'bg-gray-55 border-gray-200'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed (Auto Syncs Stock)</option>
                </select>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Generate Order Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}