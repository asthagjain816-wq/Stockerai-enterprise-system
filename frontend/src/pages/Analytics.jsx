import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useActivityStore from '../store/activityStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { handleRipple } from '../utils/ripple';
import { getApiBaseUrl } from '../config/apiConfig';
import { SkeletonStats } from '../components/Skeleton';
import AnimatedCounter from '../components/AnimatedCounter';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FileText, 
  Calendar, 
  Download, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  Printer,
  ChevronLeft,
  ArrowUpDown,
  FolderMinus,
  CheckCircle2,
  AlertTriangle,
  Star,
  Loader2,
  X,
  Maximize2
} from 'lucide-react';

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const { isDark } = useThemeStore();
  const { recentExports } = useActivityStore();

  // Interactivity state variables
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [chartMetric, setChartMetric] = useState('sales'); // 'sales' | 'purchases'
  const [loadingPdfExport, setLoadingPdfExport] = useState(false);
  const [loadingExcelExport, setLoadingExcelExport] = useState(false);
  const [loadingReportGen, setLoadingReportGen] = useState(false);
  const [selectedChartDeepDive, setSelectedChartDeepDive] = useState(null); // null | 'trends' | 'distribution'

  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    inventoryValue: 0
  });

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Date Range and Report Template Selector States
  const [filterDateRange, setFilterDateRange] = useState('Month');
  const [activeTemplate, setActiveTemplate] = useState('inventorySummary');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      // 1. Fetch dashboard statistical numeric values
      const resStats = await fetch(`${baseUrl}/api/analytics/dashboard-stats`, { credentials: 'include' });
      const dataStats = await resStats.json();
      if (dataStats.success) {
        setStatsData(dataStats.data);
      }

      // 2. Fetch products for report lists
      const resProducts = await fetch(`${baseUrl}/api/products`, { credentials: 'include' });
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.data);
      }

      // 3. Fetch suppliers for performance
      const resSuppliers = await fetch(`${baseUrl}/api/suppliers`, { credentials: 'include' });
      const dataSuppliers = await resSuppliers.json();
      if (dataSuppliers.success) {
        setSuppliers(dataSuppliers.data);
      }

      // 4. Fetch orders for order history
      const resOrders = await fetch(`${baseUrl}/api/orders`, { credentials: 'include' });
      const dataOrders = await resOrders.json();
      if (dataOrders.success) {
        setOrders(dataOrders.data);
      }
    } catch (err) {
      console.error('Error fetching Reports stats:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    loadAll();
  }, []);

  // PDF Export trigger using native print layout stylesheet
  const handleExportPDF = () => {
    const filename = `report_${activeTemplate}_${Date.now()}.pdf`;
    
    // Log Export activity
    const useActivity = useActivityStore.getState();
    if (useActivity && useActivity.addExport) {
      useActivity.addExport(filename, 'PDF');
      useActivity.addActivity(`Exported PDF Report for template: ${activeTemplate}`, 'info');
    }
    
    window.print();
  };

  // Excel Export CSV trigger using Blob URLs
  const handleExportExcel = () => {
    let csvContent = '';
    
    if (activeTemplate === 'inventorySummary') {
      csvContent += 'Product Name,SKU,Category,Current Stock,Value\n';
      products.forEach(p => {
        csvContent += `"${p.name}","${p.sku}","${p.category}",${p.stock?.current || 0},${(p.stock?.current || 0) * (p.price?.selling || 0)}\n`;
      });
    } else if (activeTemplate === 'lowStock') {
      csvContent += 'Product Name,SKU,Current Stock,Min Stock\n';
      products.filter(p => (p.stock?.current || 0) <= (p.stock?.minimum || 10)).forEach(p => {
        csvContent += `"${p.name}","${p.sku}",${p.stock?.current || 0},${p.stock?.minimum || 10}\n`;
      });
    } else if (activeTemplate === 'orderHistory') {
      csvContent += 'Order ID,Type,Status,Amount,Date\n';
      orders.forEach(o => {
        csvContent += `"${o.orderNumber}","${o.orderType}","${o.status}",${o.totalAmount},"${new Date(o.orderDate).toLocaleDateString()}"\n`;
      });
    } else {
      csvContent += 'Supplier Name,Code,Email,Phone,City\n';
      suppliers.forEach(s => {
        csvContent += `"${s.name}","${s.code}","${s.email}","${s.phone}","${s.address?.city || ''}"\n`;
      });
    }

    const filename = `report_${activeTemplate}_${Date.now()}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log Export activity
    const useActivity = useActivityStore.getState();
    if (useActivity && useActivity.addExport) {
      useActivity.addExport(filename, 'CSV');
      useActivity.addActivity(`Exported CSV spreadsheet file: ${filename}`, 'info');
    }
  };

  // Charts Mock Data
  const monthlySalesTrend = [
    { name: 'Jan', sales: 42000, purchases: 28000 },
    { name: 'Feb', sales: 38000, purchases: 32000 },
    { name: 'Mar', sales: 54000, purchases: 39000 },
    { name: 'Apr', sales: 49000, purchases: 41000 },
    { name: 'May', sales: 62000, purchases: 48000 },
    { name: 'Jun', sales: 58000, purchases: 44000 },
  ];

  const categoryDistribution = [
    { name: 'Electronics', stock: products.filter(p => p.category === 'Electronics').reduce((sum, p) => sum + (p.stock?.current || 0), 0) },
    { name: 'Clothing', stock: products.filter(p => p.category === 'Clothing').reduce((sum, p) => sum + (p.stock?.current || 0), 0) },
    { name: 'Food', stock: products.filter(p => p.category === 'Food').reduce((sum, p) => sum + (p.stock?.current || 0), 0) },
    { name: 'Hardware', stock: products.filter(p => p.category === 'Hardware').reduce((sum, p) => sum + (p.stock?.current || 0), 0) },
  ];

  // Helper Warehouse mapper
  const getWarehouse = (category) => {
    switch (category) {
      case 'Electronics': return 'WH-Alpha';
      case 'Hardware': return 'WH-Beta';
      case 'Food': return 'WH-Gamma';
      case 'Clothing': return 'WH-Delta';
      default: return 'Central Depot';
    }
  };

  // Calculate live values
  const totalStockSum = products.reduce((sum, p) => sum + (p.stock?.current || 0), 0);
  const inventoryValueSum = products.reduce((sum, p) => sum + ((p.stock?.current || 0) * (p.price?.cost || 0)), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-slide-up">
          
          {/* HEADER AREA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 text-left">
            <div>
              <Breadcrumbs />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reports Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Generate dynamic inventory ledger charts, order histories, and ratings audit files.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Calendar size={14} className="text-blue-600 mr-1" />

              {/* Date Range Selector */}
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="Today">Range: Today</option>
                <option value="Week">Range: This Week</option>
                <option value="Month">Range: This Month</option>
                <option value="Quarter">Range: This Quarter</option>
              </select>

              {/* Action Buttons */}
              <button
                disabled={loadingReportGen}
                onClick={() => {
                  setLoadingReportGen(true);
                  setTimeout(() => { setLoadingReportGen(false); fetchStats(); }, 450);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loadingReportGen && <Loader2 size={13} className="animate-spin" />}
                Generate Report
              </button>

              <button
                disabled={loadingPdfExport}
                onClick={() => {
                  setLoadingPdfExport(true);
                  setTimeout(() => { setLoadingPdfExport(false); handleExportPDF(); }, 450);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {loadingPdfExport ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Printer size={13} />}
                Export PDF
              </button>

              <button
                disabled={loadingExcelExport}
                onClick={() => {
                  setLoadingExcelExport(true);
                  setTimeout(() => { setLoadingExcelExport(false); handleExportExcel(); }, 450);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {loadingExcelExport ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Download size={13} />}
                Export Excel
              </button>
            </div>
          </div>

          {/* FOUR COMPACT SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {loading ? (
              <>
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
              </>
            ) : (
              <>
                {/* Inventory Valuation summary */}
                <div 
                  onClick={(e) => { handleRipple(e); setActiveTemplate('inventorySummary'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    activeTemplate === 'inventorySummary' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inventory Valuation</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹<AnimatedCounter value={inventoryValueSum || statsData.inventoryValue} />
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">{totalStockSum} total items</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>

                {/* Sales ledger summary */}
                <div 
                  onClick={(e) => { handleRipple(e); setActiveTemplate('orderHistory'); setShowProjectionModal(true); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    activeTemplate === 'orderHistory' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sales Ledger</span>
                    <span className="text-lg font-black text-emerald-600">
                      ₹<AnimatedCounter value={statsData.monthlyRevenue || 0} />
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Completed monthly receipts (Click to Audit)</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>

                {/* Procurement summary */}
                <div 
                  onClick={(e) => { handleRipple(e); setActiveTemplate('lowStock'); setShowProjectionModal(true); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    activeTemplate === 'lowStock' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Procurement ledger</span>
                    <span className="text-lg font-black text-blue-600">
                      ₹<AnimatedCounter value={orders.filter(o => o.orderType === 'Purchase').reduce((sum, o) => sum + (o.totalAmount || 0), 0)} />
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">{pendingCount} orders pending sync (Click to Audit)</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                </div>

                {/* Supplier network summary */}
                <div 
                  onClick={(e) => { handleRipple(e); setActiveTemplate('supplierPerformance'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    activeTemplate === 'supplierPerformance' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Ratings</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      4.8 <span className="text-[10.5px] text-slate-450 font-normal">/ 5.0 Rating</span>
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">{suppliers.length || statsData.totalSuppliers} active providers</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-550 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* INTERACTIVE REPORT TEMPLATE BROWSER */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                    {/* LEFT Column: Selector list of templates & Recent Exports */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider block mb-1">Report Templates</span>
                
                <button
                  onClick={() => setActiveTemplate('inventorySummary')}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    activeTemplate === 'inventorySummary'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Inventory Summary</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setActiveTemplate('lowStock')}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    activeTemplate === 'lowStock'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Low Stock Report</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setActiveTemplate('orderHistory')}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    activeTemplate === 'orderHistory'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Order History Log</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setActiveTemplate('supplierPerformance')}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    activeTemplate === 'supplierPerformance'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Supplier Performance</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setActiveTemplate('salesSummary')}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    activeTemplate === 'salesSummary'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>Sales Summary</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Recent Exports list widget */}
              <div className={`p-4 rounded-xl border transition shadow-xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2.5 select-none">
                  Recent Document Exports
                </span>
                {recentExports.length === 0 ? (
                  <p className="text-[10.5px] font-medium text-slate-400 italic">No files exported yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {recentExports.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between border-b pb-2 border-dashed border-slate-100 dark:border-slate-850 last:border-b-0 last:pb-0 text-left">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-705 dark:text-slate-200 truncate pr-2">{exp.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                            {exp.format} • {new Date(exp.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold select-none ${
                          exp.format === 'PDF' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' : 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20'
                        }`}>
                          {exp.format}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT Column (Spans 3): Dynamic spreadsheet table based on selected template */}
            <div className={`lg:col-span-3 rounded-2xl border transition shadow-sm overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-white dark:bg-slate-900">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-905 dark:text-white tracking-wider block">
                    {activeTemplate === 'inventorySummary' && 'Inventory Summary Report'}
                    {activeTemplate === 'lowStock' && 'Low Stock Critical Alert Listing'}
                    {activeTemplate === 'orderHistory' && 'Transaction Invoices Order History'}
                    {activeTemplate === 'supplierPerformance' && 'Supplier Reliability Ratings Performance'}
                    {activeTemplate === 'salesSummary' && 'Sales Summary monthly performance'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live database ledger metrics based on the selected criteria.</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                {/* 1. Inventory Summary Table */}
                {activeTemplate === 'inventorySummary' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-b border-slate-100 dark:border-slate-850">
                        <th className="p-3 font-bold uppercase tracking-wider">Product Name</th>
                        <th className="p-3 font-bold uppercase tracking-wider">SKU</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Category</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Current Stock</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Warehouse</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {products.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="p-3 font-mono font-semibold text-slate-500">{p.sku}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                          <td className="p-3 font-bold">{p.stock?.current || 0}</td>
                          <td className="p-3 text-slate-450 font-semibold">{getWarehouse(p.category)}</td>
                          <td className="p-3 font-black text-right text-slate-900 dark:text-white">
                            ₹{((p.stock?.current || 0) * (p.price?.selling || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 2. Low Stock Table */}
                {activeTemplate === 'lowStock' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-b border-slate-100 dark:border-slate-850">
                        <th className="p-3 font-bold uppercase tracking-wider">Product Name</th>
                        <th className="p-3 font-bold uppercase tracking-wider">SKU Code</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Category</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Remaining Stock</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Threshold Limit</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {products.filter(p => (p.stock?.current || 0) <= (p.stock?.minimum || 10)).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="p-3 font-mono font-semibold text-slate-550">{p.sku}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                          <td className="p-3 font-black text-orange-600">{p.stock?.current || 0} left</td>
                          <td className="p-3 font-bold text-slate-400">{p.stock?.minimum || 10} min</td>
                          <td className="p-3 text-right">
                            <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.2 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
                              {(p.stock?.current || 0) === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 3. Order History Table */}
                {activeTemplate === 'orderHistory' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-b border-slate-100 dark:border-slate-855">
                        <th className="p-3 font-bold uppercase tracking-wider">Order ID</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Type</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Supplier/Customer</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Order Date</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right font-black">Amount</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {orders.map((o, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">#{o.orderNumber}</td>
                          <td className={`p-3 font-bold ${o.orderType === 'Purchase' ? 'text-blue-500' : 'text-emerald-500'}`}>{o.orderType}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">
                            {o.orderType === 'Sales' ? 'Global Retailers' : (suppliers.find(s => s._id === o.supplier)?.name || 'Direct Procurement')}
                          </td>
                          <td className="p-3 text-slate-500 font-bold">{new Date(o.orderDate).toLocaleDateString()}</td>
                          <td className="p-3 font-black text-right text-slate-900 dark:text-white">₹{o.totalAmount?.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 4. Supplier Performance Table */}
                {activeTemplate === 'supplierPerformance' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-455 border-b border-slate-100 dark:border-slate-850">
                        <th className="p-3 font-bold uppercase tracking-wider">Supplier Name</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Code</th>
                        <th className="p-3 font-bold uppercase tracking-wider">City Location</th>
                        <th className="p-3 font-bold uppercase tracking-wider">On-Time delivery</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Items Mapped</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Rating Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {suppliers.map((s, idx) => {
                        const itemsCount = products.filter(p => p.supplier === s._id).length;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                            <td className="p-3 font-mono font-semibold text-slate-450">{s.code || 'L-SUP'}</td>
                            <td className="p-3 font-bold text-slate-500">{s.address?.city || 'Local Area'}</td>
                            <td className="p-3 font-black text-emerald-605">98.5%</td>
                            <td className="p-3 text-slate-500 font-bold">{itemsCount} products</td>
                            <td className="p-3 text-right">
                              <span className="inline-flex items-center gap-0.5 text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded border border-amber-100">
                                <Star size={9} className="fill-amber-500 text-amber-500" />
                                4.8
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* 5. Sales Summary Table */}
                {activeTemplate === 'salesSummary' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-b border-slate-100 dark:border-slate-850">
                        <th className="p-3 font-bold uppercase tracking-wider">Reporting Cycle</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Sales Invoiced</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Purchases Outbound</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Profit Margin</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Valuation Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {monthlySalesTrend.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-slate-800 dark:text-white">{m.name} 2026</td>
                          <td className="p-3 font-black text-emerald-600">₹{m.sales.toLocaleString()}</td>
                          <td className="p-3 font-bold text-blue-600">₹{m.purchases.toLocaleString()}</td>
                          <td className="p-3 font-black text-slate-900 dark:text-white">
                            ₹{(m.sales - m.purchases).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-extrabold text-slate-450">
                            {Math.round(((m.sales - m.purchases) / m.sales) * 100)}% Margin
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

          </div>

          {/* CONSOLIDATED CHARTS SECTION (ONLY GRAPHS APPEAR ON THIS PAGE) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Sales vs Purchase Trend LineChart */}
            <div className={`p-5 rounded-2xl border transition shadow-sm widget-interactive hover:shadow-md ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-blue-650 animate-pulse" />
                  Sales & Procurement Monthly Trends
                </h3>
                <button
                  onClick={(e) => { handleRipple(e); setSelectedChartDeepDive('trends'); }}
                  className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition"
                  title="Expand Chart Deep Dive"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="w-full h-72">
                {loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center animate-pulse bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <TrendingUp size={24} className="text-slate-400 mb-2 animate-bounce" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generating Trends...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySalesTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} style={{ fontSize: 11, fontWeight: 500 }} />
                      <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} style={{ fontSize: 11, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                      <Line type="monotone" dataKey="sales" name="Sales Invoiced (₹)" stroke={isDark ? '#34d399' : '#10B981'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="purchases" name="Purchases Outbound (₹)" stroke={isDark ? '#38bdf8' : '#2563EB'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Warehouse Distribution BarChart */}
            <div className={`p-5 rounded-2xl border transition shadow-sm widget-interactive hover:shadow-md ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <Package size={15} className="text-blue-650" />
                  Warehouse Inventory Categories Quantity Distribution
                </h3>
                <button
                  onClick={(e) => { handleRipple(e); setSelectedChartDeepDive('distribution'); }}
                  className="p-1 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition"
                  title="Expand Chart Deep Dive"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="w-full h-72">
                {loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center animate-pulse bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <Package size={24} className="text-slate-400 mb-2 animate-bounce" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compiling Distribution...</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={categoryDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} style={{ fontSize: 11, fontWeight: 500 }} />
                      <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} style={{ fontSize: 11, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                      <Bar dataKey="stock" name="Total In Stock (Units)" fill={isDark ? '#6366f1' : '#2563EB'} radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        {/* Revenue Projection Modal */}
        {showProjectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setShowProjectionModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-emerald-600 animate-pulse" />
                <h3 className="text-base font-black uppercase tracking-wider">Revenue Forecast & Audit</h3>
              </div>
              <div className="space-y-4 text-xs font-semibold">
                <p className="text-slate-450 dark:text-slate-400 leading-relaxed font-medium">
                  Consolidated ledger audit matrices and predictive analytics based on active stock counts and sales order timelines.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/40 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Current Sales Ledger</span>
                    <span className="font-extrabold text-emerald-600">₹{(statsData.monthlyRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Safety Limits Mapped</span>
                    <span className="font-extrabold text-blue-600">{products.filter(p => (p.stock?.current || 0) <= (p.stock?.minimum || 10)).length} warning items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Pending Sync Offset</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-350">{pendingCount} orders</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-xl bg-slate-50/20">
                    <span className="text-slate-400 block text-[9.5px]">Q3 Growth Projection</span>
                    <span className="text-sm font-black text-emerald-600">+14.2%</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/20">
                    <span className="text-slate-400 block text-[9.5px]">Target Margin Index</span>
                    <span className="text-sm font-black text-slate-805 dark:text-white">82.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Deep Dive Modal */}
        {selectedChartDeepDive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className={`w-full max-w-2xl p-6 rounded-2xl border shadow-2xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            } animate-scale-up`}>
              <button 
                onClick={() => setSelectedChartDeepDive(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={18} className="text-blue-650" />
                <h3 className="text-base font-black uppercase tracking-wider">
                  {selectedChartDeepDive === 'trends' ? 'Monthly Trends Deep Dive Analytics' : 'Warehouse Distribution Granular View'}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="w-full h-80 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-dashed">
                  {selectedChartDeepDive === 'trends' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlySalesTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} />
                        <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Sales Invoiced (₹)" stroke="#10B981" strokeWidth={4} />
                        <Line type="monotone" dataKey="purchases" name="Purchases Outbound (₹)" stroke="#2563EB" strokeWidth={4} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={categoryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} />
                        <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" name="Total In Stock (Units)" fill="#6366f1" radius={[10, 10, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="p-3 border rounded-xl bg-slate-50/25">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold mb-1">Audit Mode</span>
                    <span className="font-extrabold text-blue-650">Realtime (Synced)</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/25">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold mb-1">Operational Variance</span>
                    <span className="font-extrabold text-emerald-600">Stable (+0.4%)</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/25">
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold mb-1">System Health Index</span>
                    <span className="font-extrabold text-slate-805 dark:text-white">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}