import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useNotificationStore from '../store/notificationStore';
import useToastStore from '../store/toastStore';
import useConfirmStore from '../store/confirmStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { handleRipple } from '../utils/ripple';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimatedCounter from '../components/AnimatedCounter';
import HighlightText from '../components/HighlightText';
import { AlertTriangle } from 'lucide-react';
import { 
  Plus, 
  X, 
  Check, 
  Trash2, 
  PartyPopper, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FolderMinus,
  Printer,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Dialog and spinner state variables
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loadingInvoiceOp, setLoadingInvoiceOp] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isDark } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const { showToast } = useToastStore();
  const [searchParams] = useSearchParams();
  const { askConfirm } = useConfirmStore();

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('orderNumber');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    orderID: true,
    type: true,
    party: true,
    orderDate: true,
    deliveryDate: true,
    amount: true,
    status: true,
    actions: true
  });

  // Column Order State
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('orders_column_order');
    return saved ? JSON.parse(saved) : ['orderID', 'type', 'party', 'orderDate', 'deliveryDate', 'amount', 'status'];
  });
  const [draggedCol, setDraggedCol] = useState(null);

  // Form draft loading
  const [draftLoaded, setDraftLoaded] = useState(false);

  const handleDragStart = (e, colKey) => {
    setDraggedCol(colKey);
    e.dataTransfer.setData('text/plain', colKey);
  };

  const handleDrop = (e, targetColKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetColKey) return;
    
    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedCol);
    const targetIdx = newOrder.indexOf(targetColKey);
    
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedCol);
    
    setColumnOrder(newOrder);
    localStorage.setItem('orders_column_order', JSON.stringify(newOrder));
    addNotification('Table column layout updated.', 'info');
  };

  const [formData, setFormData] = useState({
    orderType: 'Purchase',
    supplier: '',
    selectedProduct: '',
    quantity: 1,
    status: 'Pending'
  });

  // Form Autosave Draft Effects
  useEffect(() => {
    if (showModal) {
      localStorage.setItem('orders_form_draft', JSON.stringify({ formData }));
    }
  }, [formData, showModal]);

  useEffect(() => {
    if (showModal) {
      const saved = localStorage.getItem('orders_form_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed.formData);
          setDraftLoaded(true);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setDraftLoaded(false);
    }
  }, [showModal]);

  // View Invoice State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setOrders(getMockOrders());
      }
    } catch (err) {
      setOrders(getMockOrders());
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      } else {
        setSuppliers(getMockSuppliers());
      }
    } catch (err) {
      setSuppliers(getMockSuppliers());
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      } else {
        setInventory(getMockInventory());
      }
    } catch (err) {
      setInventory(getMockInventory());
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchSuppliers(), fetchInventory()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Pre-filter from URL Query Parameter & Quick Actions
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilterStatus(statusParam);
    }
    const actionParam = searchParams.get('action');
    if (actionParam) {
      window.history.replaceState(null, '', window.location.pathname);
      if (actionParam === 'create') {
        if (suppliers.length > 0) setFormData(f => ({ ...f, supplier: suppliers[0]._id }));
        if (inventory.length > 0) setFormData(f => ({ ...f, selectedProduct: inventory[0]._id }));
        setFormData(f => ({ ...f, orderType: 'Purchase' }));
        setShowModal(true);
      }
    }
  }, [searchParams, suppliers, inventory]);

  const handleSaveOrder = async () => {
    if (formData.orderType === 'Purchase' && !formData.supplier) {
      showToast('Please select a supplier for Purchase orders', 'error');
      return;
    }
    if (!formData.selectedProduct || formData.quantity <= 0) {
      showToast('Please select a product and enter a valid quantity', 'error');
      return;
    }

    const matchedProduct = inventory.find(p => p._id === formData.selectedProduct);
    const itemCost = formData.orderType === 'Purchase' 
      ? (matchedProduct?.price?.cost || 10) 
      : (matchedProduct?.price?.selling || 15);

    const payload = {
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      orderType: formData.orderType,
      supplier: formData.orderType === 'Purchase' ? formData.supplier : undefined,
      items: [{
        product: formData.selectedProduct,
        quantity: Number(formData.quantity),
        price: itemCost
      }],
      totalAmount: Number(formData.quantity) * itemCost,
      status: formData.status,
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
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
        addNotification(`Order ${payload.orderNumber} created successfully.`, 'success');
        localStorage.removeItem('orders_form_draft');
        setShowModal(false);
        fetchOrders();
      }
    } catch (err) {
      // Local state fallback
      setOrders(prev => [{ ...payload, _id: 'mock_' + Date.now(), orderDate: new Date().toISOString() }, ...prev]);
      addNotification(`Order ${payload.orderNumber} cached locally.`, 'success');
      localStorage.removeItem('orders_form_draft');
      setShowModal(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`Order status updated to ${newStatus}.`, 'success');
        if (newStatus === 'Completed') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        fetchOrders();
      }
    } catch (err) {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (newStatus === 'Completed') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      addNotification(`Order status cached locally to ${newStatus}.`, 'success');
    }
  };

  const handleDeleteOrder = (id) => {
    askConfirm({
      title: 'Cancel & Delete Order',
      message: 'Are you sure you want to cancel and delete this order? This action will restore related inventory stock points.',
      confirmText: 'Cancel & Delete',
      cancelText: 'Keep Order',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success) {
            addNotification('Order deleted.', 'warning');
            fetchOrders();
          }
        } catch (err) {
          setOrders(prev => prev.filter(o => o._id !== id));
          addNotification('Order deleted locally.', 'warning');
        }
      }
    });
  };

  const handleBulkComplete = () => {
    if (selectedIds.length === 0) return;
    setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, status: 'Completed' } : o));
    addNotification(`Bulk updated status to Completed for ${selectedIds.length} orders.`, 'success');
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    askConfirm({
      title: 'Cancel Selected Orders',
      message: `Are you sure you want to cancel the ${selectedIds.length} selected orders?`,
      confirmText: 'Cancel Orders',
      cancelText: 'Keep Orders',
      type: 'danger',
      onConfirm: () => {
        setOrders(prev => prev.filter(o => !selectedIds.includes(o._id)));
        addNotification(`Bulk deleted ${selectedIds.length} orders.`, 'warning');
        setSelectedIds([]);
      }
    });
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export.', 'error');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Type,Party,Order Date,Expected Delivery,Amount,Status\n';
    
    orders.forEach(o => {
      const s = suppliers.find(sup => sup._id === o.supplier)?.name || 'Direct Procurement';
      const party = o.orderType === 'Sales' ? 'Global Retailers' : s;
      csvContent += `"${o.orderNumber}","${o.orderType}","${party}","${new Date(o.orderDate).toLocaleDateString()}","${new Date(o.expectedDelivery || o.orderDate).toLocaleDateString()}",${o.totalAmount},"${o.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filters & Search matching
  const filteredOrders = orders.filter(order => {
    const supplierObj = suppliers.find(s => s._id === order.supplier);
    const supplierName = supplierObj?.name || 'Direct Procurement';
    const party = order.orderType === 'Sales' ? 'Global Retailers' : supplierName;

    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          party.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.orderType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesType = filterType === 'All' || order.orderType === filterType;
    
    // Simple Date filter mappings
    let matchesDate = true;
    if (filterDate === 'Today') {
      const today = new Date().toDateString();
      matchesDate = new Date(order.orderDate).toDateString() === today;
    } else if (filterDate === 'Week') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      matchesDate = new Date(order.orderDate).getTime() >= oneWeekAgo;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesType;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'orderNumber') {
      valA = a.orderNumber.toLowerCase();
      valB = b.orderNumber.toLowerCase();
    } else if (sortBy === 'type') {
      valA = a.orderType.toLowerCase();
      valB = b.orderType.toLowerCase();
    } else if (sortBy === 'party') {
      const sA = suppliers.find(s => s._id === a.supplier)?.name || 'Direct Procurement';
      const sB = suppliers.find(s => s._id === b.supplier)?.name || 'Direct Procurement';
      valA = (a.orderType === 'Sales' ? 'Global Retailers' : sA).toLowerCase();
      valB = (b.orderType === 'Sales' ? 'Global Retailers' : sB).toLowerCase();
    } else if (sortBy === 'orderDate') {
      valA = new Date(a.orderDate);
      valB = new Date(b.orderDate);
    } else if (sortBy === 'expectedDelivery') {
      valA = new Date(a.expectedDelivery || a.orderDate);
      valB = new Date(b.expectedDelivery || b.orderDate);
    } else if (sortBy === 'amount') {
      valA = a.totalAmount || 0;
      valB = b.totalAmount || 0;
    } else if (sortBy === 'status') {
      valA = a.status.toLowerCase();
      valB = b.status.toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOrders.map(o => o._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Status Summary Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
  const purchaseOrdersCount = orders.filter(o => o.orderType === 'Purchase').length;
  const salesOrdersCount = orders.filter(o => o.orderType === 'Sales').length;

  // Upcoming Pending Deliveries List
  const upcomingDeliveriesList = orders
    .filter(o => o.status === 'Pending')
    .sort((a,b) => new Date(a.expectedDelivery || a.orderDate) - new Date(b.expectedDelivery || b.orderDate))
    .slice(0, 3);

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {showConfetti && (
        <div className="fixed inset-0 z-55 pointer-events-none flex items-center justify-center bg-black/10 animate-fade-in">
          <div className="bg-white text-gray-905 px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-green-400 animate-bounce text-slate-900">
            <PartyPopper className="text-green-500 w-8 h-8" />
            <span className="text-lg font-black">Order Completed! Warehouse Stock Synchronized. 🎉</span>
          </div>
        </div>
      )}

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          searchVal={searchTerm} 
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-slide-up">
          
          {/* HEADER CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 text-left">
            <div>
              <Breadcrumbs />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Orders Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Audit transactions, purchase receipts, and invoice records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={14} className="text-blue-600 mr-1" />

              {/* Column Config Dropdown Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-202 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Columns
                </button>
                {showColumnDropdown && (
                  <div className={`absolute right-0 mt-1.5 w-44 rounded-xl border shadow-lg p-2.5 z-20 space-y-1.5 text-xs font-bold text-left ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-slate-700 shadow-slate-200/40'
                  }`}>
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={visibleColumns[col]}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                          className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter selector */}
              <select
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Date: All Time</option>
                <option value="Today">Date: Today</option>
                <option value="Week">Date: Last 7 Days</option>
              </select>

              {/* Status Filter selector */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Primary Create Button (Visible & Styled in Light Mode) */}
              <button
                onClick={() => {
                  if (suppliers.length > 0) setFormData(f => ({ ...f, supplier: suppliers[0]._id }));
                  if (inventory.length > 0) setFormData(f => ({ ...f, selectedProduct: inventory[0]._id }));
                  setFormData(f => ({ ...f, orderType: 'Purchase' }));
                  setShowModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus size={14} />
                Create Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              <>
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
              </>
            ) : (
              <>
                {/* Total Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); setFilterType('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' && filterType === 'All'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
                    <span className="text-xl font-black text-slate-905 dark:text-white">
                      <AnimatedCounter value={totalOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-605 flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                </div>

                {/* Pending Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Pending'); setFilterType('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Pending' && filterType === 'All'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                    <span className="text-xl font-black text-slate-905 dark:text-white">
                      <AnimatedCounter value={pendingOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-605 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                </div>

                {/* Completed Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Completed'); setFilterType('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Completed' && filterType === 'All'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
                    <span className="text-xl font-black text-emerald-600">
                      <AnimatedCounter value={completedOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 flex items-center justify-center">
                    <Check size={16} />
                  </div>
                </div>

                {/* Cancelled Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Cancelled'); setFilterType('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Cancelled' && filterType === 'All'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled</span>
                    <span className="text-xl font-black text-slate-400">
                      <AnimatedCounter value={cancelledOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-105 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                    <Trash2 size={16} />
                  </div>
                </div>

                {/* Purchase Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); setFilterType('Purchase'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' && filterType === 'Purchase'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Orders</span>
                    <span className="text-xl font-black text-blue-600">
                      <AnimatedCounter value={purchaseOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                </div>

                {/* Sales Orders Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); setFilterType('Sales'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' && filterType === 'Sales'
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sales Orders</span>
                    <span className="text-xl font-black text-emerald-600">
                      <AnimatedCounter value={salesOrdersCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 flex items-center justify-center">
                    <Check size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN TRANSACTION LEDGER CARD */}
          <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {selectedIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-105 flex items-center justify-between text-xs font-bold animate-slide-up">
                <span className="text-blue-700 dark:text-blue-400">{selectedIds.length} orders checked</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkComplete}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    Cancel Orders
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b border-slate-100 dark:border-slate-850 text-slate-450 sticky top-0 bg-white dark:bg-slate-900 z-10 ${
                    isDark ? 'bg-slate-950/20' : 'bg-slate-50/50'
                  }`}>
                    <th className="px-4 py-3 select-none w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedOrders.length}
                        className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns[colKey]) return null;
                      
                      let label = '';
                      if (colKey === 'orderID') label = 'Order ID';
                      else if (colKey === 'type') label = 'Type';
                      else if (colKey === 'party') label = 'Customer / Supplier';
                      else if (colKey === 'orderDate') label = 'Order Date';
                      else if (colKey === 'deliveryDate') label = 'Expected Delivery';
                      else if (colKey === 'amount') label = 'Total Amount';
                      else if (colKey === 'status') label = 'Status';
                      
                      return (
                        <th
                          key={colKey}
                          draggable
                          onDragStart={(e) => handleDragStart(e, colKey)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, colKey)}
                          onClick={() => {
                            const sortMapping = {
                              orderID: 'orderNumber',
                              type: 'type',
                              party: 'party',
                              orderDate: 'orderDate',
                              deliveryDate: 'expectedDelivery',
                              amount: 'amount',
                              status: 'status'
                            };
                            handleSort(sortMapping[colKey] || colKey);
                          }}
                          className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer hover:text-blue-600 select-none cursor-grab active:cursor-grabbing border-r last:border-r-0 border-slate-100 dark:border-slate-850 text-left"
                        >
                          <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} /></span>
                        </th>
                      );
                    })}
                    {visibleColumns.actions && (
                      <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider select-none text-right">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={columnOrder.filter(c => visibleColumns[c]).length} />)
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.filter(c => visibleColumns[c]).length + 2} className="py-6">
                        <EmptyState 
                          title="No Orders Mapped" 
                          description="No active order transactions matched your search query or status filters."
                          actionText="Clear Filters"
                          onAction={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o) => {
                      const sName = suppliers.find(s => s._id === o.supplier)?.name || 'Direct Procurement';
                      const party = o.orderType === 'Sales' ? 'Global Retailers' : sName;
                      const dateStr = new Date(o.orderDate).toLocaleDateString();
                      const expDateStr = new Date(o.expectedDelivery || o.orderDate).toLocaleDateString();

                      return (
                        <tr 
                          key={o._id} 
                          onClick={() => { setActiveInvoice(o); setShowInvoiceModal(true); }} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition duration-150 text-left cursor-pointer"
                        >
                          {/* Checkbox selection */}
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(o._id)}
                              onChange={(e) => handleSelectRow(o._id, e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          {columnOrder.map((colKey) => {
                            if (!visibleColumns[colKey]) return null;

                            if (colKey === 'orderID') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap font-bold text-slate-905 dark:text-white">
                                  #<HighlightText text={o.orderNumber} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'type') {
                              return (
                                <td key={colKey} className={`px-4 py-3 whitespace-nowrap text-xs font-bold ${
                                  o.orderType === 'Purchase' ? 'text-blue-600' : 'text-emerald-600'
                                }`}>
                                  <HighlightText text={o.orderType} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'party') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500 max-w-[130px] truncate">
                                  <HighlightText text={party} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'orderDate') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs text-slate-455 font-bold">
                                  {dateStr}
                                </td>
                              );
                            }
                            if (colKey === 'deliveryDate') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs text-slate-455 font-bold">
                                  {expDateStr}
                                </td>
                              );
                            }
                            if (colKey === 'amount') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-black text-slate-900 dark:text-white">
                                  ₹{o.totalAmount?.toLocaleString() || 0}
                                </td>
                              );
                            }
                            if (colKey === 'status') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' :
                                    o.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20' :
                                    'bg-red-50 text-red-655 border-red-100'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      o.status === 'Completed' ? 'bg-emerald-500' :
                                      o.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    <HighlightText text={o.status} search={searchTerm} />
                                  </span>
                                </td>
                              );
                            }
                            return null;
                          })}
                          {visibleColumns.actions && (
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {o.status === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(o._id, 'Completed')}
                                    className="p-1 hover:bg-emerald-55 text-emerald-605 rounded transition"
                                    title="Complete Transaction"
                                  >
                                    <Check size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => { setActiveInvoice(o); setShowInvoiceModal(true); }}
                                  className="p-1 hover:bg-slate-100 text-blue-650 rounded transition"
                                  title="View Invoice"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                   onClick={() => setDeleteConfirmId(o._id)}
                                   className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                                   title="Cancel Transaction"
                                 >
                                   <Trash2 size={13} />
                                 </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px] font-bold text-slate-450 select-none bg-white dark:bg-slate-900">
                <div>Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-6.5 h-6.5 rounded-lg text-[10.5px] font-extrabold flex items-center justify-center transition border ${currentPage === idx + 1 ? 'bg-blue-600 border-blue-600 text-white animate-scale-up' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* LOWER SECTION: TIMELINE, INVOICES & QUICK BUTTONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left: Recent Invoices activity timeline */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Transactions</h3>
              </div>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3.5 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : (
                  [
                    { id: 1, title: 'Purchase Order Created', desc: 'PO-0294 compiled for 50 units display modules.', time: 'Today • 11:30 AM', ref: 'PO-0294', type: 'Purchase', amount: 15000 },
                    { id: 2, title: 'Invoice Mapped & Cleared', desc: 'SO-9410 payment received. Warehouse stock allocations completed.', time: 'Yesterday • 02:40 PM', ref: 'SO-9410', type: 'Sales', amount: 32000 }
                  ].map((tx, idx) => (
                    <div 
                      key={tx.id}
                      onClick={(e) => { handleRipple(e); setSelectedTx(tx); }}
                      className={`flex gap-2.5 items-start text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tx.type === 'Purchase' ? 'bg-blue-650' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{tx.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tx.desc}</p>
                        <span className="text-[8.5px] text-slate-455 block mt-1 font-semibold">{tx.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Center: Upcoming Pending Deliveries */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Deliveries</h3>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : upcomingDeliveriesList.length === 0 ? (
                  <p className="text-xs text-slate-455 font-semibold py-2">No pending deliveries registered.</p>
                ) : (
                  upcomingDeliveriesList.map((del, idx) => (
                    <div 
                      key={del._id}
                      onClick={(e) => { handleRipple(e); setSelectedDelivery(del); }}
                      className={`flex justify-between items-center text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block">Order #{del.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Delivery: {new Date(del.expectedDelivery || del.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-black text-slate-800 dark:text-white font-mono">
                        ₹{del.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Quick Invoicing & CSV Export actions */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Invoice Operations</h3>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <button
                  disabled={loadingInvoiceOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingInvoiceOp('purchase');
                    setTimeout(() => {
                      setLoadingInvoiceOp(null);
                      if (suppliers.length > 0) setFormData(f => ({ ...f, supplier: suppliers[0]._id }));
                      if (inventory.length > 0) setFormData(f => ({ ...f, selectedProduct: inventory[0]._id }));
                      setFormData(f => ({ ...f, orderType: 'Purchase' }));
                      setShowModal(true);
                    }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingInvoiceOp === 'purchase' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <ShoppingCart size={13} className="text-blue-500" />}
                    Create Purchase Order
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingInvoiceOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingInvoiceOp('sales');
                    setTimeout(() => {
                      setLoadingInvoiceOp(null);
                      if (suppliers.length > 0) setFormData(f => ({ ...f, supplier: suppliers[0]._id }));
                      if (inventory.length > 0) setFormData(f => ({ ...f, selectedProduct: inventory[0]._id }));
                      setFormData(f => ({ ...f, orderType: 'Sales' }));
                      setShowModal(true);
                    }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingInvoiceOp === 'sales' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <CheckCircle2 size={13} className="text-emerald-500" />}
                    Create Sales Order
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingInvoiceOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingInvoiceOp('csv');
                    setTimeout(() => { setLoadingInvoiceOp(null); handleExportCSV(); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingInvoiceOp === 'csv' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <FileSpreadsheet size={13} className="text-blue-500" />}
                    Export Invoices CSV
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingInvoiceOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingInvoiceOp('print');
                    setTimeout(() => { setLoadingInvoiceOp(null); window.print(); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingInvoiceOp === 'print' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Printer size={13} className="text-slate-550 dark:text-slate-400" />}
                    Print Orders Ledger
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* VIEW INVOICE DETAIL MODAL */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-200 text-gray-800'} rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-up text-left`}>
            
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">StockerAI Invoice Receipt</span>
                <h2 className="text-base font-black uppercase text-slate-900 dark:text-white mt-0.5">Order #{activeInvoice.orderNumber}</h2>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Checkout Type</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{activeInvoice.orderType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Party Destination</span>
                  <span className="font-extrabold text-slate-808 dark:text-white">
                    {activeInvoice.orderType === 'Sales' ? 'Global Retailers' : (suppliers.find(s => s._id === activeInvoice.supplier)?.name || 'Direct Procurement')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Billing Date</span>
                  <span>{new Date(activeInvoice.orderDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Status Badge</span>
                  <span className="text-[10px] font-black uppercase text-emerald-600">{activeInvoice.status}</span>
                </div>
              </div>

              {/* Itemized list */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-2">Itemized Ledger</span>
                <div className="space-y-2">
                  {activeInvoice.items?.map((item, idx) => {
                    const matchedProduct = inventory.find(p => p._id === item.product);
                    const prodName = matchedProduct?.name || 'Local Catalog Item';
                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800">
                        <div>
                          <span className="font-extrabold text-slate-905 dark:text-white block">{prodName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Quantity: {item.quantity} units</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          ₹{((item.price || 10) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-slate-800 dark:text-white">Grand Valuation Amount</span>
                <span className="text-blue-600 text-base">₹{activeInvoice.totalAmount?.toLocaleString() || 0}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => { window.print(); }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-755 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer size={13} />
                  Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl transition"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-up text-left`}>
            
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-905 dark:text-white">
                Create Transaction Order
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {draftLoaded && (
              <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-105 dark:border-blue-900/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-3 animate-fade-in select-none">
                <span>Loaded unsaved order draft from auto-save.</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('orders_form_draft');
                    setDraftLoaded(false);
                    setFormData({
                      orderType: 'Purchase',
                      supplier: '',
                      selectedProduct: '',
                      quantity: 1,
                      status: 'Pending'
                    });
                  }}
                  className="text-red-500 hover:text-red-700 underline text-[10px] uppercase font-black"
                >
                  Discard
                </button>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              
              {/* Order Type */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, orderType: 'Purchase' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.orderType === 'Purchase'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Purchase Order (Procure)
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, orderType: 'Sales' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.orderType === 'Sales'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Sales Order (Invoiced)
                  </button>
                </div>
              </div>

              {/* Supplier Selection (Only for Purchase) */}
              {formData.orderType === 'Purchase' && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Select Supplier *</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    required
                  >
                    <option value="">Select supplier node...</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Selector */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Select Catalog Item *</label>
                <select
                  value={formData.selectedProduct}
                  onChange={(e) => setFormData({ ...formData, selectedProduct: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  required
                >
                  <option value="">Select product SKU...</option>
                  {inventory.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                    required
                  />
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleSaveOrder}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-extrabold rounded-xl transition shadow-md"
                >
                  Generate Order Invoice
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Transaction Details Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-blue-600" />
                <h3 className="text-base font-black uppercase tracking-wider">Transaction Audit Details</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Operation Title</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedTx.title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Reference Ledger Code</span>
                  <span className="font-mono text-xs">{selectedTx.ref}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Category Type</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      selectedTx.type === 'Purchase' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>{selectedTx.type} Order</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Transaction Total</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">₹{selectedTx.amount?.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Details Log</span>
                  <p className="text-slate-550 dark:text-slate-350 leading-relaxed font-medium">{selectedTx.desc}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Timestamp</span>
                  <span>{selectedTx.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Details Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedDelivery(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-blue-600 animate-pulse" />
                <h3 className="text-base font-black uppercase tracking-wider">Delivery Tracker Details</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Order ID</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">#{selectedDelivery.orderNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Tracking Status</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold border bg-amber-50 text-amber-600 border-amber-100">{selectedDelivery.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ETA Delivery Date</span>
                    <span>{new Date(selectedDelivery.expectedDelivery || selectedDelivery.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Transaction Value</span>
                  <span className="font-extrabold text-blue-600">₹{selectedDelivery.totalAmount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Estimated Items Ledger</span>
                  <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border text-[11px] border-slate-150/50 dark:border-slate-800">
                    {selectedDelivery.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>Item Node Reference ({item.product})</span>
                        <span>{item.quantity} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Custom Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            } animate-scale-up`}>
              <div className="flex items-center gap-3 text-red-500 mb-3">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Cancel Order</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-5 leading-relaxed">
                Are you sure you want to cancel this order transaction? This action is permanent and updates stock levels.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-white font-bold rounded-xl text-xs transition border dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteOrder(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-xl text-xs transition shadow"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

// Fallback Mock Datasets
function getMockOrders() {
  return [
    { _id: 'o1', orderNumber: 'PO-92041', orderType: 'Purchase', totalAmount: 44500, orderDate: '2026-07-16T10:30:00.000Z', expectedDelivery: '2026-07-21T10:30:00.000Z', status: 'Pending', items: [{ product: '1', quantity: 50, price: 890 }] },
    { _id: 'o2', orderNumber: 'SO-02941', orderType: 'Sales', totalAmount: 2400, orderDate: '2026-07-14T11:20:00.000Z', expectedDelivery: '2026-07-19T11:20:00.000Z', status: 'Completed', items: [{ product: '3', quantity: 5, price: 480 }] },
    { _id: 'o3', orderNumber: 'PO-11928', orderType: 'Purchase', totalAmount: 3000, orderDate: '2026-07-15T16:15:00.000Z', expectedDelivery: '2026-07-20T16:15:00.000Z', status: 'Completed', items: [{ product: '2', quantity: 20, price: 150 }] }
  ];
}

function getMockSuppliers() {
  return [
    { _id: 's1', name: 'Tech Components Ltd' },
    { _id: 's2', name: 'Acme Metalworks Ltd' }
  ];
}

function getMockInventory() {
  return [
    { _id: '1', sku: 'SKU-EL-941', name: 'Laser Proximity Sensor', price: { cost: 450, selling: 890 } },
    { _id: '2', sku: 'SKU-HW-102', name: 'Alloy Bracket Mounts', price: { cost: 80, selling: 150 } },
    { _id: '3', sku: 'SKU-EL-309', name: 'OLED Display Modules', price: { cost: 240, selling: 480 } }
  ];
}