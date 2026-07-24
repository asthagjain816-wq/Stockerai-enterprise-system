import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useNotificationStore from '../store/notificationStore';
import useToastStore from '../store/toastStore';
import useConfirmStore from '../store/confirmStore';
import { getApiBaseUrl } from '../config/apiConfig';
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
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  Trash2, 
  Check, 
  Download, 
  Upload, 
  Star, 
  Send, 
  Activity, 
  Clock, 
  FolderMinus,
  Printer,
  FileSpreadsheet,
  Loader2,
  ShoppingCart
} from 'lucide-react';

export default function Suppliers() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Interactivity state variables
  const [selectedSupplierActivity, setSelectedSupplierActivity] = useState(null);
  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState(null);
  const { isDark } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const { showToast } = useToastStore();
  const [searchParams] = useSearchParams();
  const { askConfirm } = useConfirmStore();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    supplierName: true,
    company: true,
    email: true,
    phone: true,
    location: true,
    products: true,
    orders: true,
    status: true,
    actions: true
  });

  // Column Order State
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('suppliers_column_order');
    return saved ? JSON.parse(saved) : ['supplierName', 'company', 'email', 'phone', 'location', 'products', 'orders', 'status'];
  });
  const [draggedCol, setDraggedCol] = useState(null);

  // Form draft loading
  const [draftLoaded, setDraftLoaded] = useState(false);

  // CSV Drag and drop import states
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvFile, setImportCsvFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    categories: ['Electronics'],
    contactPerson: '',
    rating: 5,
    outstandingBalance: 0,
    paymentStatus: 'Paid',
    performance: 100
  });

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSupplier, setViewSupplier] = useState(null);

  // Quick Contact Form State
  const [contactSupplierId, setContactSupplierId] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

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
    localStorage.setItem('suppliers_column_order', JSON.stringify(newOrder));
    addNotification('Table column layout updated.', 'info');
  };

  // Form Autosave Draft Effects
  useEffect(() => {
    if (showModal) {
      localStorage.setItem('suppliers_form_draft', JSON.stringify({ editingId, formData }));
    }
  }, [formData, showModal, editingId]);

  useEffect(() => {
    if (showModal) {
      const saved = localStorage.getItem('suppliers_form_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.editingId === editingId) {
            setFormData(parsed.formData);
            setDraftLoaded(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setDraftLoaded(false);
    }
  }, [showModal, editingId]);

  // CSV Drag and drop file handlers
  const handleDragOverFile = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeaveFile = () => {
    setIsDragOver(false);
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setImportCsvFile(file);
      addNotification(`CSV File loaded: ${file.name}`, 'info');
    } else {
      showToast('Please drop a valid .csv file.', 'error');
    }
  };

  const handleImportCsvSubmit = (e) => {
    if (e) e.preventDefault();
    if (!importCsvFile) {
      showToast('Please upload a valid CSV file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) {
        showToast('CSV file is empty.', 'error');
        return;
      }

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const name = values[0] || 'Spreadsheet Supplier';
        const contactPerson = values[1] || 'Supplier Contact';
        const email = values[2] || `procure-${i}@corp-supplier.com`;
        const phone = values[3] || '+91 99999 88888';
        const city = values[4] || 'Mumbai';

        const payload = {
          name,
          contactPerson,
          email,
          phone,
          address: { city, state: 'Maharashtra', country: 'India', zip: '400001' },
          categories: ['Electronics']
        };

        try {
          await fetch(`${getApiBaseUrl()}/api/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          importedCount++;
        } catch (err) {
          setSuppliers(prev => [{ ...payload, _id: 'mock_' + Date.now() + '_' + i }, ...prev]);
          importedCount++;
        }
      }

      addNotification(`CSV Import: Merged ${importedCount} supplier nodes successfully.`, 'success');
      setShowImportModal(false);
      setImportCsvFile(null);
      fetchSuppliers();
    };
    reader.readAsText(importCsvFile);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/suppliers`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
        if (data.data.length > 0) {
          setContactSupplierId(data.data[0]._id);
        }
      } else {
        setSuppliers(getMockSuppliers());
      }
    } catch (err) {
      setSuppliers(getMockSuppliers());
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.warn('Products fetch error');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/orders`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.warn('Orders fetch error');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSuppliers(), fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Pre-filter from URL Query Parameter & Quick Actions
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam) {
      window.history.replaceState(null, '', window.location.pathname);
      if (actionParam === 'create') {
        setEditingId(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          location: '',
          categories: ['Hardware'],
          isActive: true,
          rating: 5
        });
        setShowModal(true);
      }
    }
  }, [searchParams]);

  const handleSaveSupplier = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        city: formData.location
      },
      categories: formData.categories,
      contact: {
        person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone
      },
      rating: Number(formData.rating),
      outstandingBalance: Number(formData.outstandingBalance),
      paymentStatus: formData.paymentStatus,
      performanceMetrics: {
        onTimeDeliveryRate: Number(formData.performance)
      }
    };

    try {
      let res;
      const baseUrl = getApiBaseUrl();
      if (editingId) {
        res = await fetch(`${baseUrl}/api/suppliers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${baseUrl}/api/suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        addNotification(`Supplier "${formData.name}" profile saved successfully.`, 'success');
        localStorage.removeItem('suppliers_form_draft');
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          categories: ['Electronics'],
          contactPerson: '',
          rating: 5,
          outstandingBalance: 0,
          paymentStatus: 'Paid',
          performance: 100
        });
        fetchSuppliers();
      }
    } catch (err) {
      // Local state fallback
      if (editingId) {
        setSuppliers(prev => prev.map(s => s._id === editingId ? { ...s, ...payload } : s));
      } else {
        const newSup = { ...payload, _id: 'mock_' + Date.now(), code: 'SUP-' + Math.floor(100 + Math.random() * 900), isActive: true };
        setSuppliers(prev => [newSup, ...prev]);
      }
      localStorage.removeItem('suppliers_form_draft');
      setShowModal(false);
      setEditingId(null);
      addNotification(`Supplier "${formData.name}" cached locally.`, 'success');
    }
  };

  const handleEditClick = (s) => {
    setEditingId(s._id);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone,
      location: s.address?.city || '',
      categories: s.categories || ['Electronics'],
      contactPerson: s.contact?.person || '',
      rating: s.rating || 5,
      outstandingBalance: s.outstandingBalance || 0,
      paymentStatus: s.paymentStatus || 'Paid',
      performance: s.performanceMetrics?.onTimeDeliveryRate || 100
    });
    setShowModal(true);
  };

  const handleDeleteSupplier = async (id) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/suppliers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Supplier deactivated.', 'warning');
        fetchSuppliers();
      }
    } catch (err) {
      setSuppliers(prev => prev.filter(s => s._id !== id));
      addNotification('Supplier removed locally.', 'warning');
    }
  };

  const handleCategoryCheckbox = (cat) => {
    const prevCats = formData.categories || [];
    if (prevCats.includes(cat)) {
      setFormData({ ...formData, categories: prevCats.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...prevCats, cat] });
    }
  };

  const handleSendQuickContact = (e) => {
    e.preventDefault();
    if (!contactSupplierId || !contactSubject || !contactMessage) {
      showToast('Please fill out all contact fields', 'error');
      return;
    }
    const supObj = suppliers.find(s => s._id === contactSupplierId);
    addNotification(`Quick Email sent to "${supObj?.name || 'Supplier'}".`, 'success');
    setContactSubject('');
    setContactMessage('');
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.length === 0) return;
    setSuppliers(prev => prev.map(s => selectedIds.includes(s._id) ? { ...s, isActive: false } : s));
    addNotification(`Bulk deactivated ${selectedIds.length} supplier nodes.`, 'warning');
    setSelectedIds([]);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (suppliers.length === 0) {
      showToast('No suppliers to export.', 'error');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Supplier ID,Name,Email,Phone,Location,Status\n';
    
    suppliers.forEach(s => {
      csvContent += `"${s.code || 'SUP-000'}","${s.name}","${s.email}","${s.phone}","${s.address?.city || ''}","${s.isActive !== false ? 'Active' : 'Inactive'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suppliers_export_${Date.now()}.csv`);
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
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Active' ? s.isActive !== false : filterStatus === 'Inactive' ? s.isActive === false : (s.rating || 0) >= 4.5);

    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortBy === 'email') {
      valA = a.email.toLowerCase();
      valB = b.email.toLowerCase();
    } else if (sortBy === 'phone') {
      valA = a.phone.toLowerCase();
      valB = b.phone.toLowerCase();
    } else if (sortBy === 'location') {
      valA = (a.address?.city || '').toLowerCase();
      valB = (b.address?.city || '').toLowerCase();
    } else if (sortBy === 'status') {
      valA = (a.isActive !== false ? 'Active' : 'Inactive').toLowerCase();
      valB = (b.isActive !== false ? 'Active' : 'Inactive').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = sortedSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedSuppliers.map(s => s._id));
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

  // Metrics summary
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.isActive !== false).length;
  const inactiveSuppliers = suppliers.filter(s => s.isActive === false).length;
  const highRatingCount = suppliers.filter(s => (s.rating || 5) >= 4.5).length;

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          searchVal={searchTerm} 
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 pb-24 sm:pb-8 space-y-6 animate-slide-up">
          
          {/* HEADER CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 text-left">
            <div>
              <Breadcrumbs />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Suppliers Registry
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Manage distributor references, emails, locations, and compliance indexes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={14} className="text-blue-605 mr-1" />

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

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition"
              >
                <Download size={13} />
                Export CSV
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition animate-fade-in"
              >
                <Printer size={13} />
                Print List
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-705 dark:text-white rounded-xl text-xs font-bold transition"
              >
                <Upload size={13} />
                Import CSV
              </button>

              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', email: '', phone: '', location: '', categories: ['Electronics'] });
                  setShowModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus size={14} />
                Add Supplier
              </button>
            </div>
          </div>

          {/* FOUR COMPACT SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
                <SkeletonStats />
              </>
            ) : (
              <>
                {/* Total Suppliers Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Suppliers</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={totalSuppliers} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Star size={16} />
                  </div>
                </div>

                {/* Active Accounts Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Active'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Active' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
                    <span className="text-xl font-black text-emerald-600">
                      <AnimatedCounter value={activeSuppliers} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Check size={16} />
                  </div>
                </div>

                {/* Inactive Accounts Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Inactive'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Inactive' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inactive Accounts</span>
                    <span className="text-xl font-black text-slate-400">
                      <AnimatedCounter value={inactiveSuppliers} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                </div>

                {/* Preferred Nodes Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Preferred'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Preferred' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Nodes</span>
                    <span className="text-xl font-black text-amber-500">
                      <AnimatedCounter value={highRatingCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-550 flex items-center justify-center">
                    <Star size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN SUPPLIERS TABLE */}
          <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {selectedIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-105 flex items-center justify-between text-xs font-bold animate-slide-up">
                <span className="text-blue-700 dark:text-blue-400">{selectedIds.length} suppliers checked</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDeactivate}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Bulk Deactivate
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
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedSuppliers.length}
                        className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns[colKey]) return null;
                      
                      let label = '';
                      if (colKey === 'supplierName') label = 'Supplier Name';
                      else if (colKey === 'company') label = 'Code ID';
                      else if (colKey === 'email') label = 'Email';
                      else if (colKey === 'phone') label = 'Phone';
                      else if (colKey === 'location') label = 'Location';
                      else if (colKey === 'products') label = 'Catalog Assets';
                      else if (colKey === 'orders') label = 'PO Orders';
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
                              supplierName: 'name',
                              company: 'company',
                              email: 'email',
                              phone: 'phone',
                              location: 'location',
                              products: 'products',
                              orders: 'orders',
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
                  ) : paginatedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.filter(c => visibleColumns[c]).length + 2} className="py-6">
                        <EmptyState 
                          title="No Suppliers Found" 
                          description="No registered suppliers matched your search query or status filter."
                          actionText="Clear Filters"
                          onAction={() => { setSearchTerm(''); setFilterStatus('All'); }}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedSuppliers.map((s) => {
                      const countProd = products.filter(p => p.supplier === s._id).length;
                      const countOrd = orders.filter(o => o.supplier === s._id).length;
                      const activeStatus = s.isActive !== false;

                      return (
                        <tr 
                          key={s._id} 
                          onClick={() => { setViewSupplier(s); setShowViewModal(true); }} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition duration-150 text-left cursor-pointer"
                        >
                          {/* Checkbox selection */}
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(s._id)}
                              onChange={(e) => handleSelectRow(s._id, e.target.checked)}
                              className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>

                          {columnOrder.map((colKey) => {
                            if (!visibleColumns[colKey]) return null;

                            if (colKey === 'supplierName') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <p className="text-xs font-bold text-slate-905 dark:text-white truncate max-w-[150px]">
                                    <HighlightText text={s.name} search={searchTerm} />
                                  </p>
                                  <span className="text-[9.5px] text-slate-400 block mt-0.5 capitalize truncate max-w-[150px]">
                                    <HighlightText text={(s.categories || ['Hardware']).join(', ')} search={searchTerm} />
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'company') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <code className="text-[10.5px] font-mono font-bold text-slate-655 bg-slate-105 dark:bg-slate-850 px-2 py-0.5 rounded">
                                    <HighlightText text={s.code || 'SUP-MAIN'} search={searchTerm} />
                                  </code>
                                </td>
                              );
                            }
                            if (colKey === 'email') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                  <HighlightText text={s.email} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'phone') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                  <HighlightText text={s.phone} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'location') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                  <HighlightText text={s.address?.city || 'India'} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'products') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900 dark:text-white">
                                  {countProd} catalog items
                                </td>
                              );
                            }
                            if (colKey === 'orders') {
                              return (
                                <td 
                                  key={colKey} 
                                  onClick={(e) => { e.stopPropagation(); setSelectedSupplierHistory(s); }}
                                  className="px-4 py-3 whitespace-nowrap text-xs font-bold text-blue-600 dark:text-blue-450 hover:text-blue-750 cursor-pointer select-none hover:underline"
                                  title="Click to view purchase order logs history"
                                >
                                  {countOrd} PO units
                                </td>
                              );
                            }
                            if (colKey === 'status') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    activeStatus ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' : 'bg-red-50 text-red-600 border-red-100'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${activeStatus ? 'bg-emerald-500' : 'bg-red-550'}`} />
                                    {activeStatus ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              );
                            }
                            return null;
                          })}

                          {visibleColumns.actions && (
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditClick(s)}
                                  className="p-1.5 hover:bg-slate-105 text-slate-600 rounded-lg transition"
                                  title="Edit Supplier Account"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => { setViewSupplier(s); setShowViewModal(true); }}
                                  className="p-1.5 hover:bg-slate-105 text-blue-605 rounded-lg transition"
                                  title="View Account Details"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => { askConfirm({ title: 'Delete Supplier Record', message: `Are you sure you want to deactivate and remove supplier "${s.name}"? This action will archive their contact history.`, type: 'danger', confirmText: 'Deactivate', onConfirm: () => handleDeleteSupplier(s._id) }); }}
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                                  title="Deactivate Supplier Record"
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
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-6.5 h-6.5 rounded-lg text-[10.5px] font-extrabold flex items-center justify-center transition border ${currentPage === idx + 1 ? 'bg-blue-605 border-blue-605 text-white' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* LOWER PANEL: EMAIL CONTACT & TIMELINES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left: Quick Contact Form */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Mail size={14} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Quick Contact Dispatch</h3>
              </div>

              <form onSubmit={handleSendQuickContact} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Select Supplier</label>
                  <select
                    value={contactSupplierId}
                    onChange={(e) => setContactSupplierId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Subject Header</label>
                  <input
                    type="text"
                    placeholder="e.g. Inbound Stock Inquiry"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Message Content</label>
                  <textarea
                    placeholder="Write message to send via ERP mailbox..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 shadow active:scale-[0.99]"
                >
                  <Send size={13} />
                  Send Dispatch Email
                </button>
              </form>
            </div>

            {/* Middle: Recent Supplier Activity */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-blue-650" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Supplier Activity</h3>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : (
                  [
                    { id: 1, title: 'Profile Updated', desc: 'Tech Components Ltd address nodes synced.', time: 'Today • 11:15 AM', status: 'Success', node: 'API Gateway' },
                    { id: 2, title: 'PO Dispatch Logged', desc: 'PO-11928 dispatched to Acme Metalworks.', time: 'Yesterday • 04:20 PM', status: 'Dispatched', node: 'EDI-Procure' }
                  ].map((act, idx) => (
                    <div 
                      key={act.id}
                      onClick={(e) => { handleRipple(e); setSelectedSupplierActivity(act); }}
                      className={`flex gap-2.5 items-start text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-855' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-600`} />
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{act.title}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{act.desc}</p>
                        <span className="text-[8.5px] text-slate-455 block mt-1 font-semibold">{act.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Purchase History */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-855 mb-3 flex items-center gap-2">
                <ShoppingCart size={14} className="text-blue-650" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Purchase History</h3>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : (
                  (orders.filter(o => o.orderType === 'Purchase').length > 0
                    ? orders.filter(o => o.orderType === 'Purchase')
                    : [
                        { _id: 'po1', orderNumber: 'PO-0294', supplier: 'Tech Components Ltd', orderDate: '2026-07-18T11:30:00.000Z', totalAmount: 15000, status: 'Completed' },
                        { _id: 'po2', orderNumber: 'PO-1192', supplier: 'Acme Metalworks Ltd', orderDate: '2026-07-17T16:20:00.000Z', totalAmount: 42000, status: 'Pending' }
                      ]
                  ).map((po, idx) => (
                    <div 
                      key={po._id}
                      onClick={(e) => { handleRipple(e); setSelectedPurchaseOrder(po); }}
                      className={`flex justify-between items-center text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-855' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block">Order #{po.orderNumber}</span>
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-black text-slate-800 dark:text-white font-mono">
                        ₹{po.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* VIEW SUPPLIER DIALOG PROFILE */}
      {showViewModal && viewSupplier && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-200 text-gray-800'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-850">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">{viewSupplier.name}</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Code ID: {viewSupplier.code || 'SUP-MAIN'}</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400" />
                <span>{viewSupplier.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>{viewSupplier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" />
                <span>{viewSupplier.address?.city || 'India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-slate-400" />
                <span>Categories: {(viewSupplier.categories || ['Electronics']).join(', ')}</span>
              </div>
              {viewSupplier.contact?.person && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase w-24">Contact Person:</span>
                  <span className="font-extrabold">{viewSupplier.contact.person}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase w-24">Supplier Rating:</span>
                <span className="font-extrabold text-amber-500">★ {viewSupplier.rating || 5.0} / 5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase w-24">Performance:</span>
                <span className="font-extrabold text-emerald-600">{viewSupplier.performanceMetrics?.onTimeDeliveryRate || 100}% On-Time Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase w-24">Balance:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">₹{(viewSupplier.outstandingBalance || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase w-24">Payment Status:</span>
                <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded-full border ${
                  viewSupplier.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  viewSupplier.paymentStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-red-50 text-red-600 border-red-105'
                }`}>{viewSupplier.paymentStatus || 'Paid'}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl transition"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SUPPLIER DIALOG */}
      {showModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-black uppercase text-slate-905 dark:text-white">
                {editingId ? 'Edit Supplier Node' : 'Add Supplier Node'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {draftLoaded && (
              <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-105 dark:border-blue-900/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-3 animate-fade-in select-none">
                <span>Loaded unsaved supplier draft.</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('suppliers_form_draft');
                    setDraftLoaded(false);
                    if (editingId) {
                      const item = suppliers.find(s => s._id === editingId);
                      if (item) handleEditClick(item);
                    } else {
                      setFormData({ name: '', email: '', phone: '', location: '', categories: ['Electronics'], contactPerson: '', rating: 5, outstandingBalance: 0, paymentStatus: 'Paid', performance: 100 });
                    }
                  }}
                  className="text-red-500 hover:text-red-700 underline text-[10px] uppercase font-black"
                >
                  Discard
                </button>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tech Components Ltd"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">City Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sales@techcomponents.com"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 09281"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    value={formData.outstandingBalance}
                    onChange={(e) => setFormData({ ...formData, outstandingBalance: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                    }`}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Supplier Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Delivery Performance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performance}
                    onChange={(e) => setFormData({ ...formData, performance: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Supplied Categories</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'].map(cat => (
                    <label 
                      key={cat} 
                      className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer select-none text-[10px] font-extrabold transition ${
                        (formData.categories || []).includes(cat)
                          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-955/35 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(formData.categories || []).includes(cat)}
                        onChange={() => handleCategoryCheckbox(cat)}
                        className="hidden"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleSaveSupplier}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-extrabold rounded-xl transition shadow-md"
                >
                  Save Supplier Profile
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-white font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CSV IMPORT DIALOG */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-105 dark:border-slate-800">
              <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white">Import Suppliers CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportCsvSubmit} className="space-y-4">
              <div
                onDragOver={handleDragOverFile}
                onDragLeave={handleDragLeaveFile}
                onDrop={handleDropFile}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition duration-150 ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-55/20 dark:bg-blue-955/20' 
                    : isDark ? 'border-slate-800 hover:border-slate-750 bg-slate-850/20' : 'border-slate-202 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <Upload className="mx-auto text-slate-400 w-8 h-8 mb-2 animate-bounce" />
                <p className="text-[11px] font-bold text-slate-705 dark:text-white">
                  Drag and drop your suppliers .csv here
                </p>
                <p className="text-[9.5px] text-slate-450 mt-1 mb-3">or browse locally from device</p>
                
                <input
                  type="file"
                  accept=".csv"
                  id="csv-supplier-file-input"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImportCsvFile(e.target.files[0]);
                      addNotification(`Loaded file: ${e.target.files[0].name}`, 'info');
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="csv-supplier-file-input"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] uppercase font-black tracking-wide cursor-pointer transition select-none inline-block shadow-sm"
                >
                  Choose File
                </label>
                
                {importCsvFile && (
                  <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-450 mt-3 truncate">
                    Loaded: {importCsvFile.name} ({Math.round(importCsvFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-705 text-white font-bold rounded-xl text-xs transition shadow"
                >
                  Import Suppliers
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-white font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Supplier Activity Audit Modal */}
        {selectedSupplierActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-scale-up">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedSupplierActivity(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-blue-600 animate-pulse" />
                <h3 className="text-base font-black uppercase tracking-wider">Distributor Audit Log</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Activity Action</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedSupplierActivity.title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Details Log</span>
                  <p className="text-slate-550 dark:text-slate-350 leading-relaxed font-medium">{selectedSupplierActivity.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gateway Node</span>
                    <span className="font-mono text-slate-500">{selectedSupplierActivity.node}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Execution Time</span>
                    <span>{selectedSupplierActivity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Purchase Orders History Modal */}
        {selectedSupplierHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-scale-up">
            <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-805'
            }`}>
              <button 
                onClick={() => setSelectedSupplierHistory(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet size={18} className="text-blue-600" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">{selectedSupplierHistory.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Historical Purchase order receipts logs associated with this node.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[250px] border rounded-xl border-slate-150/40 dark:border-slate-850">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-b border-slate-100 dark:border-slate-850">
                      <th className="p-3 font-bold uppercase tracking-wider">Order ID</th>
                      <th className="p-3 font-bold uppercase tracking-wider">ETA Date</th>
                      <th className="p-3 font-bold uppercase tracking-wider">Value</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                    {orders.filter(o => o.supplier === selectedSupplierHistory._id || o.orderType === 'Purchase').length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-slate-450 italic">No purchase receipts mapped for this supplier node.</td>
                      </tr>
                    ) : (
                      orders.filter(o => o.supplier === selectedSupplierHistory._id || o.orderType === 'Purchase').map((o, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">#{o.orderNumber}</td>
                          <td className="p-3 text-slate-500 font-semibold">{new Date(o.expectedDelivery || o.orderDate).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-slate-805 dark:text-slate-300">₹{(o.totalAmount || 0).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                              o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>{o.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* PURCHASE ORDER DETAIL MODAL */}
        {selectedPurchaseOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedPurchaseOrder(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet size={18} className="text-blue-650" />
                <h3 className="text-base font-black uppercase tracking-wider">Purchase Order Details</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Order Reference</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">#{selectedPurchaseOrder.orderNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      selectedPurchaseOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{selectedPurchaseOrder.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Order Date</span>
                    <span>{new Date(selectedPurchaseOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Supplier Node</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">
                    {typeof selectedPurchaseOrder.supplier === 'string' 
                      ? (suppliers.find(s => s._id === selectedPurchaseOrder.supplier)?.name || selectedPurchaseOrder.supplier)
                      : (selectedPurchaseOrder.supplier?.name || 'Direct Supplier')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Value</span>
                  <span className="font-extrabold text-blue-600">₹{selectedPurchaseOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

// Fallback mock suppliers dataset
function getMockSuppliers() {
  return [
    { 
      _id: 's1', 
      name: 'Tech Components Ltd', 
      code: 'SUP-TECH', 
      email: 'sales@techcomponents.com', 
      phone: '+91 98765 09281', 
      address: { city: 'New Delhi' }, 
      categories: ['Electronics', 'Hardware'], 
      rating: 4.8, 
      isActive: true,
      contact: { person: 'John Doe' },
      outstandingBalance: 24500,
      paymentStatus: 'Pending',
      performanceMetrics: { onTimeDeliveryRate: 98 }
    },
    { 
      _id: 's2', 
      name: 'Acme Metalworks Ltd', 
      code: 'SUP-ACME', 
      email: 'orders@acmesteel.com', 
      phone: '+91 88772 10928', 
      address: { city: 'Bangalore' }, 
      categories: ['Hardware'], 
      rating: 4.5, 
      isActive: true,
      contact: { person: 'Jane Smith' },
      outstandingBalance: 0,
      paymentStatus: 'Paid',
      performanceMetrics: { onTimeDeliveryRate: 95 }
    },
    { 
      _id: 's3', 
      name: 'Global Textiles Ind.', 
      code: 'SUP-TEX', 
      email: 'shipments@globaltex.com', 
      phone: '+91 77281 99281', 
      address: { city: 'Mumbai' }, 
      categories: ['Clothing'], 
      rating: 4.2, 
      isActive: true,
      contact: { person: 'Robert Lee' },
      outstandingBalance: 12000,
      paymentStatus: 'Overdue',
      performanceMetrics: { onTimeDeliveryRate: 89 }
    }
  ];
}