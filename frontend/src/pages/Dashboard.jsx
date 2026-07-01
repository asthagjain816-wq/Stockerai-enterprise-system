import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle, X, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useThemeStore();

  const chartData = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398 },
    { month: 'Mar', sales: 2000, revenue: 9800 },
    { month: 'Apr', sales: 2780, revenue: 3908 },
    { month: 'May', sales: 1890, revenue: 4800 },
    { month: 'Jun', sales: 2390, revenue: 3800 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 60, color: '#3b82f6' },
    { name: 'Services', value: 15, color: '#f59e0b' },
    { name: 'Supplies', value: 25, color: '#10b981' },
  ];

  const stats = [
    { title: 'Total Products', value: '2', change: '+12%', icon: Package, color: 'blue', path: '/products' },
    { title: 'Total Suppliers', value: '2', change: '+5%', icon: Users, color: 'green', path: '/suppliers' },
    { title: 'Total Orders', value: '1', change: '+8%', icon: ShoppingCart, color: 'purple', path: '/orders' },
    { title: 'Revenue', value: '₹12K', change: '+15%', icon: TrendingUp, color: 'orange', path: '/analytics' },
  ];

  const recentOrders = [
    { id: 'ORD-001', product: 'MacBook Pro', amount: '₹2,500', status: 'Pending' },
    { id: 'ORD-002', product: 'iPhone 15', amount: '₹1,200', status: 'Completed' },
  ];

  const lowStockItems = [
    { name: 'Product A', current: 5, minimum: 10 },
    { name: 'Product B', current: 3, minimum: 15 },
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-8`}>
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Welcome Back! 👋
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Here's your inventory overview for today
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.title}
                  onClick={() => navigate(stat.path)}
                  className={`${
                    isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:shadow-lg'
                  } rounded-xl shadow-sm p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClass(stat.color)} text-white shadow-lg`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-sm font-bold ${stat.change.includes('+') ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      {stat.change}
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <div className={`lg:col-span-2 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Sales Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 5 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Sales by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {cat.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Distribution Chart */}
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Monthly Sales Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#6b7280'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Order ID</th>
                        <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Product</th>
                        <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Amount</th>
                        <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className={`border-b ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'} transition`}>
                          <td className={`py-4 px-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {order.id}
                          </td>
                          <td className={`py-4 px-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {order.product}
                          </td>
                          <td className={`py-4 px-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {order.amount}
                          </td>
                          <td className={`py-4 px-4 text-sm`}>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Completed'
                                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                : isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Low Stock Items
                </h2>
              </div>
              <div className="space-y-4">
                {lowStockItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50'} rounded-lg border border-red-200`}
                  >
                    <p className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      <span className="font-bold">Current:</span> {item.current} | <span className="font-bold">Minimum:</span> {item.minimum}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.current / item.minimum) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}