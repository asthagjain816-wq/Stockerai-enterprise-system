import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Plus, X } from 'lucide-react';

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useThemeStore();
  const [formData, setFormData] = useState({
    orderNum: '',
    product: '',
    quantity: '',
    amount: '',
    status: 'Pending',
  });

  const orders = [
    { id: 'ORD-001', date: '2024-06-27', amount: '₹2,500', status: 'Pending' },
    { id: 'ORD-002', date: '2024-06-26', amount: '₹1,200', status: 'Completed' },
  ];

  const handleCreateOrder = () => {
    if (formData.orderNum && formData.product && formData.amount) {
      console.log('Order created:', formData);
      setShowModal(false);
      setFormData({ orderNum: '', product: '', quantity: '', amount: '', status: 'Pending' });
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') {
      return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
    }
    return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
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
                Orders
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Manage purchase orders
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-lg"
            >
              <Plus size={20} />
              Create Order
            </button>
          </div>

          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              All Orders
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-4 px-6 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Order #</th>
                    <th className={`text-left py-4 px-6 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Date</th>
                    <th className={`text-left py-4 px-6 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Amount</th>
                    <th className={`text-left py-4 px-6 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-4 px-6 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-b ${
                        isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'
                      } transition`}
                    >
                      <td className={`py-4 px-6 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {order.id}
                      </td>
                      <td className={`py-4 px-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {order.date}
                      </td>
                      <td className={`py-4 px-6 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {order.amount}
                      </td>
                      <td className={`py-4 px-6`}>
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className={`py-4 px-6`}>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl p-8 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Create Order
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
                  Order Number *
                </label>
                <input
                  type="text"
                  value={formData.orderNum}
                  onChange={(e) => setFormData({ ...formData, orderNum: e.target.value })}
                  placeholder="ORD-001"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Product *
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="Product name"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Amount *
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹0"
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 rounded-lg transition"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}