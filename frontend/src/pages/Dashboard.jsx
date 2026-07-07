import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import useThemeStore from '../store/themeStore';
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle, ArrowUpRight, BarChart3, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useThemeStore();

  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    inventoryValue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const resStats = await fetch('http://localhost:5000/api/analytics/dashboard-stats', { credentials: 'include' });
      const dataStats = await resStats.json();
      if (dataStats.success) {
        setStatsData(dataStats.data);
      }

      const resOrders = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
      const dataOrders = await resOrders.json();
      if (dataOrders.success) {
        setRecentOrders(dataOrders.data.slice(0, 5));
      }

      const resLow = await fetch('http://localhost:5000/api/products/low-stock/alert', { credentials: 'include' });
      const dataLow = await resLow.json();
      if (dataLow.success) {
        setLowStockItems(dataLow.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartData = [
    { month: 'Jan', Sales: 4000, Purchases: 2400 },
    { month: 'Feb', Sales: 5500, Purchases: 3200 },
    { month: 'Mar', Sales: 7200, Purchases: 4100 },
    { month: 'Apr', Sales: 6100, Purchases: 3800 },
    { month: 'May', Sales: 8900, Purchases: 5200 },
    { month: 'Jun', Sales: 10500, Purchases: 5900 },
  ];

  // Calculate stock health percentage
  const totalItems = statsData.totalProducts || 10;
  const lowItems = lowStockItems.length || 0;
  const healthyPercentage = Math.max(0, Math.round(((totalItems - lowItems) / totalItems) * 100));

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0"></div>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Welcome Dashboard Title block */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Control Panel Overview
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                Live transaction metrics, inventory valuation, and supplier network status.
              </p>
            </div>
            {/* Quick action button */}
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50/50 text-blue-700'
              }`}>
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                System Healthy
              </span>
            </div>
          </div>

          {/* Upgraded Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Inventory Items" value={statsData.totalProducts} change="+12%" icon={Package} color="blue" onClick={() => navigate('/inventory')} />
            <StatsCard title="Total Suppliers" value={statsData.totalSuppliers} change="+5%" icon={Users} color="green" onClick={() => navigate('/suppliers')} />
            <StatsCard title="Pending Orders" value={statsData.pendingOrders} change="+8%" icon={ShoppingCart} color="purple" onClick={() => navigate('/orders')} />
            <StatsCard title="Monthly Revenue" value={`₹${statsData.monthlyRevenue.toLocaleString()}`} change="+15%" icon={TrendingUp} color="orange" onClick={() => navigate('/analytics')} />
          </div>

          {/* Graphics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart - Sales Trend */}
            <div className={`lg:col-span-2 rounded-2xl p-6 border backdrop-blur-md ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-gray-200/50 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Revenue Operations</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Compare monthly sales output versus purchases</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-550">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Sales
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-550">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Purchases
                  </span>
                </div>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155/30' : '#e2e8f0/50'} vertical={false} />
                    <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} style={{ fontSize: 12, fontWeight: 500 }} />
                    <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} style={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: isDark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.5)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    <Area type="monotone" dataKey="Purchases" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Circular Health Gauge & Valuation Card */}
            <div className={`rounded-2xl p-6 border backdrop-blur-md flex flex-col justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-gray-200/50 shadow-sm'
            }`}>
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Health Index</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Proportion of products with healthy stocks</p>
              </div>

              {/* SVG Ring Gauge */}
              <div className="flex items-center justify-center my-6 relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke={isDark ? '#334155' : '#f1f5f9'} strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="72" cy="72" r="60" 
                    stroke="url(#gaugeGradient)" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 60} 
                    strokeDashoffset={2 * Math.PI * 60 * (1 - healthyPercentage / 100)} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight">{healthyPercentage}%</span>
                  <span className={`text-[10px] font-bold ${healthyPercentage > 75 ? 'text-green-500' : 'text-red-500'}`}>
                    {healthyPercentage > 75 ? 'EXCELLENT' : 'CRITICAL'}
                  </span>
                </div>
              </div>

              {/* Total Stock Valuation Box */}
              <div className={`p-4 rounded-xl text-center border ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-blue-50/20 border-blue-100/50'
              }`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Stock Valuation</p>
                <p className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mt-1">
                  ₹{statsData.inventoryValue ? statsData.inventoryValue.toLocaleString() : '8,45,200'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Table Overviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders log */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl p-6 border backdrop-blur-md ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-gray-200/50 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                        <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                        <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Type</th>
                        <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
                        <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-gray-500 text-sm">No orders recorded yet.</td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order._id} className={`border-b last:border-0 hover:${isDark ? 'bg-slate-800/40' : 'bg-gray-50/50'} transition ${
                            isDark ? 'border-slate-800' : 'border-gray-100'
                          }`}>
                            <td className="py-4 px-4 text-sm font-bold">{order.orderNumber}</td>
                            <td className="py-4 px-4 text-sm">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                order.orderType === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {order.orderType}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm font-bold">₹{order.totalAmount?.toLocaleString()}</td>
                            <td className="py-4 px-4 text-sm">
                              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                order.status === 'Completed'
                                  ? isDark ? 'bg-green-950/30 text-green-400 border border-green-900/30' : 'bg-green-100 text-green-700'
                                  : isDark ? 'bg-yellow-950/30 text-yellow-400 border border-yellow-900/30' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className={`rounded-2xl p-6 border backdrop-blur-md ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-gray-200/50 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                  <AlertCircle size={24} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Low Stock Alerts</h2>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {lowStockItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
                    <p className="text-sm font-semibold text-emerald-600">All stocks look healthy! 👍</p>
                  </div>
                ) : (
                  lowStockItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition hover:shadow-md ${
                        isDark ? 'bg-red-950/10 border-red-900/30 text-white' : 'bg-red-50/50 border-red-100 text-gray-800'
                      }`}
                    >
                      <p className="font-bold text-sm">{item.name}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                        <span>SKU: {item.sku}</span>
                        <span className="font-semibold text-red-550">
                          {item.stock?.current} / Min {item.stock?.minimum}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-650 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((item.stock?.current || 0) / (item.stock?.minimum || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}