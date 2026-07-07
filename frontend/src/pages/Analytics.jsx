import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import useThemeStore from '../store/themeStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, Users } from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useThemeStore();
  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    inventoryValue: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/dashboard-stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStatsData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Electronics', value: 60 },
    { name: 'Supplies', value: 25 },
    { name: 'Services', value: 15 },
  ];

  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Your live enterprise business metrics & insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Inventory Items" value={statsData.totalProducts} change="+12%" icon={BarChart3} color="blue" onClick={() => navigate('/inventory')} />
            <StatsCard title="Pending Orders" value={statsData.pendingOrders} change="+8%" icon={TrendingUp} color="green" onClick={() => navigate('/orders')} />
            <StatsCard title="Monthly Revenue" value={`₹${statsData.monthlyRevenue.toLocaleString()}`} change="+15%" icon={BarChart3} color="purple" onClick={() => navigate('/orders')} />
            <StatsCard title="Active Suppliers" value={statsData.totalSuppliers} change="+5%" icon={Users} color="orange" onClick={() => navigate('/suppliers')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-xl shadow-sm p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={`rounded-xl shadow-sm p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4">Monthly Sales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}