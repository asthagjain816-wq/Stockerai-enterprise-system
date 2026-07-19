import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import useActivityStore from '../store/activityStore';
import AnimatedCounter from '../components/AnimatedCounter';
import { handleRipple } from '../utils/ripple';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Activity, 
  Plus, 
  X, 
  SlidersHorizontal,
  Info,
  Calendar,
  DollarSign,
  Eye,
  FileEdit
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const { activities, addActivity } = useActivityStore();

  // Core Data States
  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    inventoryValue: 0,
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Suggestion & Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [tableSearch, setTableSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Table Sorting & Pagination States
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Detail Modal/Drawer States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const suggestionsRef = useRef(null);

  // Fetch Dashboard Stats & Primary Collections
  const fetchDashboardData = async () => {
    try {
      const resStats = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/dashboard-stats`, { credentials: 'include' });
      const dataStats = await resStats.json();
      if (dataStats.success) {
        setStatsData(dataStats.data);
      }

      const resProducts = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, { credentials: 'include' });
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.data);
      }

      const resSuppliers = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/suppliers`, { credentials: 'include' });
      const dataSuppliers = await resSuppliers.json();
      if (dataSuppliers.success) {
        setSuppliers(dataSuppliers.data);
      }

      const resOrders = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, { credentials: 'include' });
      const dataOrders = await resOrders.json();
      if (dataOrders.success) {
        setOrders(dataOrders.data);
      }

      const resLow = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/low-stock/alert`, { credentials: 'include' });
      const dataLow = await resLow.json();
      if (dataLow.success) {
        setLowStockItems(dataLow.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    initData();

    // Auto-refresh pending orders and stats every 10s
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  // Handle outside click to dismiss search suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Spacing helper for status indicators
  const getStockStatus = (product) => {
    const current = product.stock?.current || 0;
    const minimum = product.stock?.minimum || 10;
    if (current === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-805 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30' };
    if (current <= minimum) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-805 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-805 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' };
  };

  // Relative Time Formatter
  const getRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  // --- Live Search Suggestions Mapping ---
  const getFilteredSuggestions = () => {
    if (!globalSearch.trim()) return [];

    const query = globalSearch.toLowerCase();
    const matches = [];

    // Search Products
    products.forEach(p => {
      if (p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)) {
        matches.push({ type: 'Product', label: p.name, value: p.sku, data: p });
      }
    });

    // Search Suppliers
    suppliers.forEach(s => {
      if (s.name.toLowerCase().includes(query)) {
        matches.push({ type: 'Supplier', label: s.name, value: s.email, data: s });
      }
    });

    // Search Orders
    orders.forEach(o => {
      if (o.orderNumber.toLowerCase().includes(query)) {
        matches.push({ type: 'Order', label: `Order ${o.orderNumber}`, value: o.status, data: o });
      }
    });

    // Search Categories
    const categories = ['Electronics', 'Hardware', 'Food', 'Clothing', 'Other'];
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(query)) {
        matches.push({ type: 'Category', label: `Filter Category: ${cat}`, value: cat });
      }
    });

    return matches.slice(0, 8); // limit to top 8 suggestions
  };

  const suggestions = getFilteredSuggestions();

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setGlobalSearch('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    if (sug.type === 'Product') {
      setSelectedProduct(sug.data);
      addActivity(`Viewed details for product "${sug.data.name}"`, 'info');
    } else if (sug.type === 'Supplier') {
      navigate(`/suppliers?search=${sug.label}`);
    } else if (sug.type === 'Order') {
      setSelectedOrder(sug.data);
      addActivity(`Viewed details for order "${sug.data.orderNumber}"`, 'info');
    } else if (sug.type === 'Category') {
      setCategoryFilter(sug.value);
      setCurrentPage(1);
    }
  };

  // --- Enterprise Catalog Sorting & Filtering ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(tableSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortBy === 'sku') {
      aVal = a.sku.toLowerCase();
      bVal = b.sku.toLowerCase();
    } else if (sortBy === 'category') {
      aVal = a.category.toLowerCase();
      bVal = b.category.toLowerCase();
    } else if (sortBy === 'price') {
      aVal = a.price?.selling || 0;
      bVal = b.price?.selling || 0;
    } else if (sortBy === 'stock') {
      aVal = a.stock?.current || 0;
      bVal = b.stock?.current || 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // List of unique categories for filters
  const categories = ['All', 'Electronics', 'Hardware', 'Food', 'Clothing', 'Other'];

  const getSupplierName = (supplierId) => {
    if (!supplierId) return 'N/A';
    const found = suppliers.find(s => s._id === supplierId);
    return found ? found.name : 'Unknown Supplier';
  };

  const getOrderCustomer = (o) => {
    const sName = getSupplierName(o.supplier);
    return sName !== 'N/A' && sName !== 'Unknown Supplier' 
      ? sName 
      : o.orderType === 'Purchase' 
        ? 'Internal WH-Alpha' 
        : 'Apex Commerce Ltd';
  };

  const handleReorder = (product) => {
    addActivity(`Dispatched stock reorder request for product "${product.name}"`, 'success');
    showToast(`Stock replenishment request generated for ${product.name}!`, 'success');
  };

  const getFormattedDate = () => {
    const date = new Date();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const pendingOrdersList = orders.filter(o => o.status === 'Pending');

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-955 text-white' : 'bg-white text-slate-800'}`}>
      
      {/* Background radial gradients for rich aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0"></div>

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none text-left">
          
          {/* Welcome Banner Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Welcome back, Astha 👋
              </h1>
              <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage your inventory efficiently.
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-600'
            }`}>
              <Calendar size={13} className="text-blue-600" />
              <span>Today is {getFormattedDate()}</span>
            </div>
          </div>

          {/* Interactive KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonStats key={i} />)
            ) : (
              <>
                {/* Total Products */}
                <div 
                  onClick={(e) => { handleRipple(e); navigate('/products'); }}
                  className={`rounded-2xl p-5 border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/60 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Total Products</p>
                    <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                      <AnimatedCounter value={statsData.totalProducts} />
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Package size={20} />
                  </div>
                </div>

                {/* Low Stock */}
                <div 
                  onClick={(e) => { handleRipple(e); navigate('/inventory?status=Low Stock'); }}
                  className={`rounded-2xl p-5 border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/60 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Low Stock</p>
                    <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                      <AnimatedCounter value={lowStockItems.length} />
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <AlertCircle size={20} />
                  </div>
                </div>

                {/* Pending Orders */}
                <div 
                  onClick={(e) => { handleRipple(e); navigate('/orders'); }}
                  className={`rounded-2xl p-5 border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/60 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Pending Orders</p>
                    <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                      <AnimatedCounter value={statsData.pendingOrders} />
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
                    <ShoppingCart size={20} />
                  </div>
                </div>

                {/* Suppliers */}
                <div 
                  onClick={(e) => { handleRipple(e); navigate('/suppliers'); }}
                  className={`rounded-2xl p-5 border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/60 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Suppliers</p>
                    <p className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                      <AnimatedCounter value={statsData.totalSuppliers} />
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <Users size={20} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Enterprise Catalog Datagrid Section */}
          <div className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80 shadow-sm'
          }`}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight uppercase text-slate-800 dark:text-white">
                    Enterprise Catalog
                  </h2>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-semibold mt-0.5`}>
                    Live search, filter, and sort stock allocations.
                  </p>
                </div>

                {/* Datagrid header search and categories */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className={`relative flex items-center rounded-lg border ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  } px-2.5 py-1.5 w-full sm:w-44 shadow-xs`}>
                    <Search size={13} className="text-slate-400 mr-1.5" />
                    <input
                      type="text"
                      placeholder="Live Search..."
                      value={tableSearch}
                      onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                      className="bg-transparent border-0 outline-0 p-0 text-[11px] font-semibold text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className={`text-[11px] font-bold py-1.5 px-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Sticky Header Table Datagrid wrapper */}
              <div className="overflow-x-auto max-h-[380px] relative rounded-xl border border-slate-100 dark:border-slate-850">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 z-20 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th onClick={() => handleSort('name')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Product Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('sku')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('category')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('supplier')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Supplier {sortBy === 'supplier' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('stock')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('price')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Unit Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th className="px-4 py-3">Status</th>
                      <th onClick={() => handleSort('updatedAt')} className="px-4 py-3 cursor-pointer hover:text-blue-600 select-none">
                        <span className="flex items-center gap-1.5">Last Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold">
                    {loading ? (
                      <SkeletonRow cols={9} />
                    ) : paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-slate-400 font-bold">
                          No catalog items found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(p => {
                        const status = getStockStatus(p);
                        return (
                          <tr
                            key={p._id}
                            onClick={() => { setSelectedProduct(p); addActivity(`Inspected catalog product "${p.name}" details.`, 'info'); }}
                            className={`cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850/40 transition duration-150 border-b border-slate-100 dark:border-slate-850 ${
                              isDark ? 'text-slate-350' : 'text-slate-700'
                            }`}
                          >
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                              {p.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{p.sku}</td>
                            <td className="px-4 py-3 text-[11px] font-bold text-slate-500">{p.category}</td>
                            <td className="px-4 py-3 text-[11px] font-bold text-slate-550">
                              {getSupplierName(p.supplier)}
                            </td>
                            <td className="px-4 py-3 font-bold">{p.stock?.current || 0}</td>
                            <td className="px-4 py-3 font-bold">₹{p.price?.selling?.toLocaleString() || '0'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold tracking-wide uppercase ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[10px] text-slate-400 font-bold">
                              {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedProduct(p)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  onClick={() => navigate(`/products?search=${p.sku}`)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Manage Product"
                                >
                                  <FileEdit size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4 mt-4 select-none text-[10px] font-extrabold text-slate-400">
                <div>Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-850 disabled:opacity-40 hover:bg-slate-105 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-6.5 h-6.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center border transition cursor-pointer ${
                        currentPage === idx + 1 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-850 disabled:opacity-40 hover:bg-slate-105 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Below Table Section: Recent Activity & Pending Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Recent Activity */}
            <div className={`rounded-2xl border p-5 backdrop-blur-md ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80 shadow-sm'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4 flex items-center gap-2">
                <Activity size={15} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <div className="py-6 text-center text-xs font-bold text-slate-400">
                    No system operations recorded.
                  </div>
                ) : (
                  activities.slice(0, 4).map((act) => (
                    <div 
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className={`flex gap-3 text-xs p-2 rounded-xl cursor-pointer transition hover:bg-slate-100/50 dark:hover:bg-slate-850/50`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                          <Clock size={12} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight block truncate">
                          {act.message}
                        </p>
                        <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">
                          {getRelativeTime(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Pending Orders */}
            <div className={`rounded-2xl border p-5 backdrop-blur-md flex flex-col justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80 shadow-sm'
            }`}>
              <div>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={15} className="text-purple-500" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Pending Orders
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                    {pendingOrdersList.length} Active
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-850 animate-pulse w-full" />
                  ) : pendingOrdersList.length === 0 ? (
                    <div className="py-6 text-center text-xs font-bold text-slate-400">
                      No pending orders record.
                    </div>
                  ) : (
                    pendingOrdersList.slice(0, 4).map(o => (
                      <div
                        key={o._id}
                        onClick={() => { setSelectedOrder(o); addActivity(`Viewed details for pending order ${o.orderNumber}`, 'info'); }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all duration-150 ${
                          isDark ? 'bg-slate-900/50 border-slate-850 hover:border-slate-700' : 'bg-white border-slate-200/60 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="text-xs font-bold space-y-0.5">
                          <span className="text-slate-900 dark:text-white block">{o.orderNumber}</span>
                          <span className="text-[9px] text-slate-450 block">
                            Customer: <span className="text-slate-500 font-extrabold">{getOrderCustomer(o)}</span>
                          </span>
                        </div>
                        <div className="text-right text-xs">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-bold mb-1 bg-amber-150 text-amber-850 border border-amber-200/50`}>
                            {o.status}
                          </span>
                          <span className="text-[9.5px] text-slate-450 block font-semibold">
                            Del: {o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Low Stock Alerts & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Low Stock Alerts */}
            <div className={`rounded-2xl border p-5 backdrop-blur-md ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80 shadow-sm'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <AlertCircle size={15} className="text-red-500 animate-pulse" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Low Stock Alerts
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {lowStockItems.length === 0 ? (
                  <div className="py-6 text-center text-xs font-bold text-slate-400">
                    All product stock thresholds are normal.
                  </div>
                ) : (
                  lowStockItems.slice(0, 4).map(p => (
                    <div
                      key={p._id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isDark ? 'bg-slate-900/50 border-slate-850' : 'bg-white border-slate-200/60'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">
                        <span className="text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[9.5px] text-slate-450 block mt-0.5">Min Threshold: {p.stock?.minimum || 10} Units</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-red-650 bg-red-100/50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg">
                          {p.stock?.current || 0} left
                        </span>
                        <button
                          onClick={() => handleReorder(p)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase transition cursor-pointer"
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Quick Actions */}
            <div className={`rounded-2xl border p-5 backdrop-blur-md flex flex-col justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80 shadow-sm'
            }`}>
              <div>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Quick Actions
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/products')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      isDark 
                        ? 'bg-slate-850 border-slate-800 text-white hover:bg-slate-800' 
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <Package size={16} className="text-blue-600" />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      isDark 
                        ? 'bg-slate-850 border-slate-800 text-white hover:bg-slate-800' 
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <ShoppingCart size={16} className="text-purple-500" />
                    <span>Create Order</span>
                  </button>
                  <button
                    onClick={() => navigate('/analytics')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      isDark 
                        ? 'bg-slate-850 border-slate-800 text-white hover:bg-slate-800' 
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <TrendingUp size={16} className="text-emerald-500" />
                    <span>Generate Report</span>
                  </button>
                  <button
                    onClick={() => navigate('/suppliers')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      isDark 
                        ? 'bg-slate-850 border-slate-800 text-white hover:bg-slate-800' 
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    <Users size={16} className="text-cyan-600" />
                    <span>Add Supplier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* --- Detail Modals & Drawers --- */}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl text-left relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          } animate-scale-up`}>
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b border-slate-150/40 dark:border-slate-850">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Package size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  {selectedProduct.name}
                </h3>
                <span className="text-[10px] text-slate-455 font-mono">SKU: {selectedProduct.sku}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Category</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{selectedProduct.category}</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${getStockStatus(selectedProduct).color}`}>
                    {getStockStatus(selectedProduct).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Selling Price</span>
                  <span className="text-slate-800 dark:text-white font-extrabold text-sm flex items-center gap-0.5">
                    ₹ {selectedProduct.price?.selling?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Cost Price</span>
                  <span className="text-slate-800 dark:text-white font-extrabold text-sm flex items-center gap-0.5">
                    ₹ {selectedProduct.price?.cost?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Current Stock</span>
                  <span className="text-slate-800 dark:text-white font-extrabold text-sm">{selectedProduct.stock?.current || 0} Units</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Reorder Level</span>
                  <span className="text-slate-800 dark:text-white font-extrabold text-sm">{selectedProduct.stock?.minimum || 10} Units</span>
                </div>
              </div>

              <div className="bg-slate-100/50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-150/30">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Description</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedProduct.description || 'No supplementary details provided for this catalog template.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl text-left relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          } animate-scale-up`}>
            
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-3.5 border-b border-slate-150/40 dark:border-slate-850">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <ShoppingCart size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Order Details
                </h3>
                <span className="text-[10px] text-slate-455 font-mono">Invoice Number: {selectedOrder.orderNumber}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Transaction Type</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                    selectedOrder.orderType === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedOrder.orderType}
                  </span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Date Created</span>
                  <span className="text-slate-800 dark:text-white font-extrabold flex items-center gap-1">
                    <Calendar size={13} className="text-slate-455" />
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-100/50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-150/30">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1.5">Line Items Summary</span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span>{item.name || `Item ${idx + 1}`}</span>
                        <span>{item.quantity} x ₹{item.price?.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-medium">No custom item parameters saved on line records.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-150/30 mt-2">
                <span className="text-slate-400 font-extrabold uppercase tracking-wide text-[10px]">Total Amount</span>
                <span className="text-slate-900 dark:text-white font-black text-base">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl text-left relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          } animate-scale-up`}>
            
            <button 
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-150/40 dark:border-slate-850">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Trace Details
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Operation Message</span>
                <p className="text-slate-800 dark:text-white font-extrabold text-xs leading-relaxed">
                  {selectedActivity.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Time Logged</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{new Date(selectedActivity.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="bg-slate-100/50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150/30">
                  <span className="text-[9.5px] uppercase tracking-wider text-slate-455 block mb-1">Trace Index</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">#{selectedActivity.id.toString().slice(-6)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}