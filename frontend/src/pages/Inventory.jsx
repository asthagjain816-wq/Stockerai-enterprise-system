import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useNotificationStore from '../store/notificationStore';
import useToastStore from '../store/toastStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { getApiBaseUrl } from '../config/apiConfig';
import { handleRipple } from '../utils/ripple';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimatedCounter from '../components/AnimatedCounter';
import HighlightText from '../components/HighlightText';
import { 
  Plus, 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  Check, 
  ArrowRightLeft, 
  Eye, 
  SlidersHorizontal, 
  Package, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Database,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  FolderMinus,
  Download,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Printer,
  Loader2
} from 'lucide-react';

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const { isDark } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const { showToast } = useToastStore();
  const [searchParams] = useSearchParams();

  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New Interactivity state variables
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState(null);
  const [selectedMovementLog, setSelectedMovementLog] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  // Stock Movement Modal States
  const [activeModalType, setActiveModalType] = useState(''); // 'receive' | 'issue' | 'transfer' | 'adjust' | ''
  const [movementForm, setMovementForm] = useState({
    productId: '',
    warehouse: 'WH-Alpha',
    targetWarehouse: 'WH-Beta',
    quantity: 10,
    reorderLevel: 10,
    reference: '',
    reason: 'Cycle Count',
    notes: '',
    operator: ''
  });

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  // Warehouse State & Detail Drawer
  const [warehouses, setWarehouses] = useState([
    { id: 'WH-Alpha', name: 'WH-Alpha (Sensors)', location: 'Sector 4, New Delhi', supervisor: 'Arjun Mehta', capacity: 5000, currentStock: 1200, status: 'Active', phone: '+91 98765 12345', email: 'alpha@stocker.ai' },
    { id: 'WH-Beta', name: 'WH-Beta (Hardware)', location: 'Sector 9, Bangalore', supervisor: 'Karan Sharma', capacity: 10000, currentStock: 4500, status: 'Active', phone: '+91 88772 54321', email: 'beta@stocker.ai' },
    { id: 'WH-Gamma', name: 'WH-Gamma (Cold Storage)', location: 'Sector 12, Mumbai', supervisor: 'Rohan Deshmukh', capacity: 2000, currentStock: 950, status: 'Active', phone: '+91 77665 98765', email: 'gamma@stocker.ai' },
    { id: 'WH-Delta', name: 'WH-Delta (Clothing)', location: 'Sector 15, Chennai', supervisor: 'Vijay Iyer', capacity: 8000, currentStock: 3200, status: 'Active', phone: '+91 66554 12345', email: 'delta@stocker.ai' }
  ]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showWarehouseDrawer, setShowWarehouseDrawer] = useState(false);

  // Confirmation Modal & Loader States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmActionData, setConfirmActionData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic Movement Ledger Log (Local Storage Mock for realism)
  const [movementLogs, setMovementLogs] = useState(() => {
    const saved = localStorage.getItem('inventory_movement_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'Receive', product: 'Laser Proximity Sensor', sku: 'SKU-EL-941', qty: 50, warehouse: 'WH-Alpha', operator: 'Arjun Mehta', ref: 'PO-92041', time: 'Today • 10:30 AM', notes: 'Initial batch from suppliers', hash: 'SHA-8291a' },
      { id: 2, type: 'Transfer', product: 'Alloy Bracket Mounts', sku: 'SKU-HW-102', qty: 20, warehouse: 'WH-Beta', targetWarehouse: 'WH-Gamma', operator: 'Karan Sharma', ref: 'TR-1192', time: 'Yesterday • 04:15 PM', notes: 'Transferred for rebalancing', hash: 'SHA-4182b' },
      { id: 3, type: 'Issue', product: 'OLED Display Modules', sku: 'SKU-EL-309', qty: 5, warehouse: 'WH-Alpha', operator: 'Vijay Iyer', ref: 'SO-0294', time: '2 days ago • 11:20 AM', notes: 'Fulfillment order outbound', hash: 'SHA-1029c' },
    ];
  });

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    product: true,
    sku: true,
    warehouse: true,
    availableQty: true,
    reservedQty: true,
    reorderLevel: true,
    status: true,
    lastUpdated: true,
    actions: true
  });

  // Column Order State
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('inventory_column_order');
    return saved ? JSON.parse(saved) : ['product', 'sku', 'warehouse', 'availableQty', 'reservedQty', 'reorderLevel', 'status', 'lastUpdated'];
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
    localStorage.setItem('inventory_column_order', JSON.stringify(newOrder));
    addNotification('Table column layout updated.', 'info');
  };

  // Form Autosave Draft Effects
  useEffect(() => {
    if (activeModalType) {
      localStorage.setItem('inventory_movement_draft', JSON.stringify({ activeModalType, movementForm }));
    }
  }, [movementForm, activeModalType]);

  useEffect(() => {
    if (activeModalType) {
      const saved = localStorage.getItem('inventory_movement_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.activeModalType === activeModalType) {
            setMovementForm(parsed.movementForm);
            setDraftLoaded(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setDraftLoaded(false);
    }
  }, [activeModalType]);

  useEffect(() => {
    localStorage.setItem('inventory_movement_logs', JSON.stringify(movementLogs));
  }, [movementLogs]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products`, { credentials: 'include' });
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

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/suppliers`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.warn('API suppliers unavailable');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchInventory(), fetchSuppliers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Pre-filter from URL Query params & Action Triggers
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilterStatus(statusParam);
    }
    
    const actionParam = searchParams.get('action');
    if (actionParam) {
      window.history.replaceState(null, '', window.location.pathname);
      if (['receive', 'issue', 'transfer', 'adjust'].includes(actionParam)) {
        setActiveModalType(actionParam);
      }
    }
  }, [searchParams]);

  // Decoders for description parameters
  const getBrand = (item) => {
    if (!item.description) return 'Acme Corp';
    try {
      const obj = JSON.parse(item.description);
      return obj.brand || 'Acme Corp';
    } catch (e) {
      return 'Acme Corp';
    }
  };

  const getStockStatus = (item) => {
    const current = item.stock?.current || 0;
    const minimum = item.stock?.minimum || 10;
    if (current === 0) return 'Out of Stock';
    if (current <= minimum) return 'Low Stock';
    return 'In Stock';
  };

  const getWarehouse = (category) => {
    switch (category) {
      case 'Electronics': return 'WH-Alpha';
      case 'Hardware': return 'WH-Beta';
      case 'Food': return 'WH-Gamma';
      case 'Clothing': return 'WH-Delta';
      default: return 'Central Depot';
    }
  };

  // Submit Stock Operation Form
  const handleStockOperationSubmit = (e) => {
    e.preventDefault();
    if (!movementForm.productId) {
      showToast('Please select a product.', 'error');
      return;
    }

    const targetProduct = inventory.find(p => p._id === movementForm.productId);
    if (!targetProduct) return;

    const availableQty = targetProduct.stock?.current || 0;
    const reqQty = Number(movementForm.quantity);

    // Validations
    if (activeModalType === 'transfer' && movementForm.warehouse === movementForm.targetWarehouse) {
      showToast('Source and destination warehouses must be different.', 'error');
      return;
    }

    if ((activeModalType === 'issue' || activeModalType === 'transfer') && reqQty > availableQty) {
      showToast(`Insufficient stock! Only ${availableQty} units available.`, 'error');
      return;
    }

    if (reqQty <= 0) {
      showToast('Quantity must be greater than zero.', 'error');
      return;
    }

    // Set confirmation payload
    setConfirmActionData({
      type: activeModalType,
      productId: movementForm.productId,
      productName: targetProduct.name,
      sku: targetProduct.sku,
      quantity: reqQty,
      warehouse: movementForm.warehouse,
      targetWarehouse: activeModalType === 'transfer' ? movementForm.targetWarehouse : undefined,
      reference: movementForm.reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      operator: movementForm.operator || 'System Admin',
      notes: movementForm.notes || 'Routine stock ledger modification.',
      reorderLevel: Number(movementForm.reorderLevel)
    });
    
    setShowConfirmModal(true);
  };

  // Commit Confirmed Stock Ledger Changes
  const handleConfirmSubmit = async () => {
    if (!confirmActionData) return;
    setIsProcessing(true);

    const { type, productId, productName, sku, quantity, warehouse, targetWarehouse, reference, operator, notes, reorderLevel } = confirmActionData;
    const targetProduct = inventory.find(p => p._id === productId);
    if (!targetProduct) {
      setIsProcessing(false);
      return;
    }

    let newQty = targetProduct.stock?.current || 0;
    if (type === 'receive') {
      newQty += quantity;
    } else if (type === 'issue') {
      newQty = Math.max(0, newQty - quantity);
    } else if (type === 'adjust') {
      newQty = quantity;
    } else if (type === 'transfer') {
      newQty = Math.max(0, newQty - quantity);
    }

    // Prepare API updates
    const payload = {
      'stock.current': newQty,
      ...(type === 'adjust' && { 'stock.minimum': reorderLevel })
    };

    // Simulate async network request lag
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Success callback
      }
    } catch (err) {
      console.warn('API update unavailable, applying changes locally.');
    }

    // Local cached inventory state updates
    setInventory(prev => prev.map(p => {
      if (p._id === productId) {
        return {
          ...p,
          stock: {
            ...p.stock,
            current: newQty,
            ...(type === 'adjust' && { minimum: reorderLevel })
          },
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    // For transfers: simulate destination increase if the product exists in the target location
    if (type === 'transfer') {
      addNotification(`Transferred ${quantity} units of ${productName} from ${warehouse} to ${targetWarehouse}.`, 'info');
    }

    // Create Audit Ledger Log
    const auditHash = `SHA256-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;
    const newLog = {
      id: Date.now(),
      type: type === 'receive' ? 'Receive' : type === 'issue' ? 'Issue' : type === 'transfer' ? 'Transfer' : 'Adjust',
      product: productName,
      sku: sku,
      qty: quantity,
      warehouse: warehouse,
      targetWarehouse: targetWarehouse,
      ref: reference,
      operator: operator,
      notes: notes,
      hash: auditHash,
      time: 'Just now'
    };

    setMovementLogs(prev => [newLog, ...prev]);
    addNotification(`Audit trace compiled. Stock ledger entry written successfully.`, 'success');

    // Clean up modal states
    localStorage.removeItem('inventory_movement_draft');
    setIsProcessing(false);
    setShowConfirmModal(false);
    setConfirmActionData(null);
    setActiveModalType('');
    setMovementForm({
      productId: '',
      warehouse: 'WH-Alpha',
      targetWarehouse: 'WH-Beta',
      quantity: 10,
      reorderLevel: 10,
      reference: '',
      reason: 'Cycle Count',
      notes: '',
      operator: ''
    });
  };

  const handleOpenMovementModal = (type, productId = '') => {
    const item = inventory.find(p => p._id === productId);
    setActiveModalType(type);
    setMovementForm({
      productId: productId,
      warehouse: item ? getWarehouse(item.category) : 'WH-Alpha',
      targetWarehouse: 'WH-Beta',
      quantity: 10,
      reorderLevel: item ? (item.stock?.minimum || 10) : 10,
      reference: '',
      reason: 'Cycle Count'
    });
  };

  const handleOpenHistory = (item) => {
    setHistoryProduct(item);
    setShowHistoryModal(true);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (inventory.length === 0) {
      showToast('No inventory to export.', 'error');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Product Name,SKU,Warehouse,Available Quantity,Reserved Quantity,Reorder Level,Status\n';
    
    inventory.forEach(p => {
      const warehouse = getWarehouse(p.category);
      const reserved = Math.round((p.stock?.current || 0) * 0.15);
      const status = getStockStatus(p);
      csvContent += `"${p.name}","${p.sku}","${warehouse}",${p.stock?.current || 0},${reserved},${p.stock?.minimum || 10},"${status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_export_${Date.now()}.csv`);
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

  // Filters & Search Matching logic
  const filteredInventory = inventory.filter(item => {
    const warehouse = getWarehouse(item.category);
    const status = getStockStatus(item);
    const brand = getBrand(item);

    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWarehouse = filterWarehouse === 'All' || warehouse === filterWarehouse;
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

    return matchesSearch && matchesWarehouse && matchesStatus && matchesCategory;
  });

  // Sorting logic
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortBy === 'sku') {
      valA = a.sku.toLowerCase();
      valB = b.sku.toLowerCase();
    } else if (sortBy === 'warehouse') {
      valA = getWarehouse(a.category).toLowerCase();
      valB = getWarehouse(b.category).toLowerCase();
    } else if (sortBy === 'available') {
      valA = a.stock?.current || 0;
      valB = b.stock?.current || 0;
    } else if (sortBy === 'reserved') {
      valA = Math.round((a.stock?.current || 0) * 0.15);
      valB = Math.round((b.stock?.current || 0) * 0.15);
    } else if (sortBy === 'reorder') {
      valA = a.stock?.minimum || 10;
      valB = b.stock?.minimum || 10;
    } else if (sortBy === 'status') {
      valA = getStockStatus(a);
      valB = getStockStatus(b);
    } else if (sortBy === 'updatedAt') {
      valA = new Date(a.updatedAt || a.createdAt);
      valB = new Date(b.updatedAt || b.createdAt);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = sortedInventory.slice(startIndex, startIndex + itemsPerPage);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedInventory.map(item => item._id));
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
  const totalInventoryCount = inventory.length;
  const availableStockSum = inventory.reduce((sum, item) => sum + (item.stock?.current || 0), 0);
  const lowStockCount = inventory.filter(item => getStockStatus(item) === 'Low Stock').length;
  const outOfStockCount = inventory.filter(item => getStockStatus(item) === 'Out of Stock').length;

  const timelineEvents = [
    ...movementLogs.slice(0, 3).map(log => ({
      id: `mov-${log.id}`,
      title: `Stock ${log.type} Transaction`,
      desc: `Processed ${log.qty} units of ${log.product} (${log.sku}) at ${log.warehouse}${log.targetWarehouse ? ` to ${log.targetWarehouse}` : ''}.`,
      time: log.time,
      status: 'Verified',
      category: 'Ledger Audit'
    })),
    { id: 'aud-1', title: 'Warehouse Audit Completed', desc: 'Stock level sync verified for WH-Alpha and WH-Beta nodes.', time: 'Today • 12:40 PM', status: 'Verified', category: 'Compliance' },
    { id: 'aud-2', title: 'Reorder Limits Mapped', desc: 'Automatic safety stock alert triggers compiled on 12 critical SKUs.', time: 'Yesterday • 09:15 AM', status: 'Success', category: 'Reorder Rules' }
  ];

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
                Warehouse Stock Ledger
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Audit warehouse storage nodes, available stock reserves, and reorder alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={14} className="text-blue-650 mr-1" />

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

              {/* Warehouse selector */}
              <select
                value={filterWarehouse}
                onChange={(e) => { setFilterWarehouse(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Warehouse: All</option>
                <option value="WH-Alpha">WH-Alpha (Sensors)</option>
                <option value="WH-Beta">WH-Beta (Hardware)</option>
                <option value="WH-Gamma">WH-Gamma (Cold Storage)</option>
                <option value="WH-Delta">WH-Delta (Clothing)</option>
              </select>

              {/* Stock Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Status: All</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              {/* Stock movement quick actions */}
              <button
                onClick={() => handleOpenMovementModal('receive')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <ArrowDownLeft size={13} />
                Receive
              </button>
              <button
                onClick={() => handleOpenMovementModal('issue')}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <ArrowUpRight size={13} />
                Issue
              </button>
              <button
                onClick={() => handleOpenMovementModal('transfer')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                <ArrowRightLeft size={13} />
                Transfer
              </button>
            </div>
          </div>

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
                {/* Total Catalog Items */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog Items</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={totalInventoryCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>

                {/* Available Quantity */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('In Stock'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'In Stock' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Quantity</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={availableStockSum} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Low Stock'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Low Stock' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
                    <span className={`text-xl font-black ${lowStockCount > 0 ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                      <AnimatedCounter value={lowStockCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-550 flex items-center justify-center">
                    <AlertTriangle size={16} />
                  </div>
                </div>

                {/* Out of Stock */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Out of Stock'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Out of Stock' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
                    <span className={`text-xl font-black ${outOfStockCount > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      <AnimatedCounter value={outOfStockCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-505 flex items-center justify-center">
                    <Trash2 size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MAIN WAREHOUSE STOCK LEDGER TABLE */}
          <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {selectedIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-105 flex items-center justify-between text-xs font-bold animate-slide-up">
                <span className="text-blue-700 dark:text-blue-400">{selectedIds.length} items checked for movement</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenMovementModal('transfer', selectedIds[0])}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Transfer Stock
                  </button>
                  <button
                    onClick={() => handleOpenMovementModal('adjust', selectedIds[0])}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg"
                  >
                    Adjust Quantities
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
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedInventory.length}
                        className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns[colKey]) return null;
                      
                      let label = '';
                      if (colKey === 'product') label = 'Product';
                      else if (colKey === 'sku') label = 'SKU';
                      else if (colKey === 'warehouse') label = 'Warehouse';
                      else if (colKey === 'availableQty') label = 'Available Qty';
                      else if (colKey === 'reservedQty') label = 'Reserved Qty';
                      else if (colKey === 'reorderLevel') label = 'Reorder Level';
                      else if (colKey === 'status') label = 'Status';
                      else if (colKey === 'lastUpdated') label = 'Last Updated';
                      
                      return (
                        <th
                          key={colKey}
                          draggable
                          onDragStart={(e) => handleDragStart(e, colKey)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, colKey)}
                          onClick={() => {
                            const sortMapping = {
                              product: 'name',
                              sku: 'sku',
                              warehouse: 'warehouse',
                              availableQty: 'available',
                              reservedQty: 'reserved',
                              reorderLevel: 'reorder',
                              status: 'status',
                              lastUpdated: 'updatedAt'
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
                  ) : paginatedInventory.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.filter(c => visibleColumns[c]).length + 2} className="py-6">
                        <EmptyState 
                          title="No Inventory Records" 
                          description="No active product records matched your search term or warehouse filters."
                          actionText="Clear Filters"
                          onAction={() => { setSearchTerm(''); setFilterWarehouse('All'); setFilterStatus('All'); }}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedInventory.map((item) => {
                      const warehouseName = getWarehouse(item.category);
                      const status = getStockStatus(item);
                      const reserved = Math.round((item.stock?.current || 0) * 0.15);

                      return (
                        <tr 
                          key={item._id} 
                          onClick={() => handleOpenHistory(item)} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition duration-150 text-left cursor-pointer"
                        >
                          {/* Checkbox selection */}
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item._id)}
                              onChange={(e) => handleSelectRow(item._id, e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>

                          {columnOrder.map((colKey) => {
                            if (!visibleColumns[colKey]) return null;

                            if (colKey === 'product') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <p className="text-xs font-bold text-slate-905 dark:text-white truncate max-w-[150px]">
                                    <HighlightText text={item.name} search={searchTerm} />
                                  </p>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    <HighlightText text={item.category} search={searchTerm} /> catalog
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'sku') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-105 dark:bg-slate-850 px-2 py-0.5 rounded">
                                    <HighlightText text={item.sku} search={searchTerm} />
                                  </code>
                                </td>
                              );
                            }
                            if (colKey === 'warehouse') {
                              const whId = warehouseName.split(' ')[0];
                              const whObj = warehouses.find(w => w.id === whId) || warehouses[0];
                              return (
                                <td 
                                  key={colKey} 
                                  className="px-4 py-3 whitespace-nowrap text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWarehouse(whObj);
                                    setShowWarehouseDrawer(true);
                                  }}
                                >
                                  <span className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5">
                                    <Database size={12} className="text-slate-405" />
                                    {warehouseName}
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'availableQty') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-black text-slate-900 dark:text-white">
                                  {item.stock?.current || 0} units
                                </td>
                              );
                            }
                            if (colKey === 'reservedQty') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-455">
                                  {reserved} units
                                </td>
                              );
                            }
                            if (colKey === 'reorderLevel') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-extrabold text-slate-455">
                                  {item.stock?.minimum || 10} units
                                </td>
                              );
                            }
                            if (colKey === 'status') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' :
                                    status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20' :
                                    'bg-red-50 text-red-605 border-red-100'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      status === 'In Stock' ? 'bg-emerald-500' :
                                      status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    {status}
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'lastUpdated') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-[10.5px] font-bold text-slate-400">
                                  {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </td>
                              );
                            }
                            return null;
                          })}

                          {/* Action triggers */}
                          {visibleColumns.actions && (
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenMovementModal('receive', item._id)}
                                  className="p-1.5 text-emerald-600 hover:bg-slate-105 rounded transition"
                                  title="Receive Stock"
                                >
                                  <ArrowDownLeft size={13} />
                                </button>
                                <button
                                  onClick={() => handleOpenMovementModal('issue', item._id)}
                                  className="p-1.5 text-red-600 hover:bg-slate-105 rounded transition"
                                  title="Issue Stock"
                                >
                                  <ArrowUpRight size={13} />
                                </button>
                                <button
                                  onClick={() => handleOpenMovementModal('transfer', item._id)}
                                  className="p-1.5 text-blue-600 hover:bg-slate-105 rounded transition"
                                  title="Transfer Stock"
                                >
                                  <ArrowRightLeft size={13} />
                                </button>
                                <button
                                  onClick={() => handleOpenMovementModal('adjust', item._id)}
                                  className="p-1.5 text-slate-600 hover:bg-slate-105 rounded transition"
                                  title="Adjust Quantities"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleOpenHistory(item)}
                                  className="p-1.5 text-slate-400 hover:text-blue-605 rounded transition"
                                  title="Movement History"
                                >
                                  <History size={13} />
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
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-6.5 h-6.5 rounded-lg text-[10.5px] font-extrabold flex items-center justify-center transition border ${currentPage === idx + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* LOWER SECTION: ACTIVITY TIMELINE, STOCK MOVEMENT LEDGER & RECENT UPDATES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left: Inventory Activity Timeline */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Activity size={14} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Inventory Activity Timeline</h3>
              </div>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3.5 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : (
                  timelineEvents.map((event, idx) => (
                    <div 
                      key={event.id}
                      onClick={(e) => { handleRipple(e); setSelectedTimelineEvent(event); }}
                      className={`flex gap-2.5 items-start text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        event.category === 'Compliance' ? 'bg-emerald-500' : event.category === 'Ledger Audit' ? 'bg-indigo-550' : 'bg-blue-650'
                      }`} />
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{event.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{event.desc}</p>
                        <span className="text-[8.5px] text-slate-455 block mt-1 font-semibold">{event.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Center: Stock Movement History */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Stock Movement History</h3>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3.5 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-855 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-855 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-855 rounded-xl w-full" />
                  </div>
                ) : (
                  movementLogs.map((log, idx) => (
                    <div 
                      key={log.id} 
                      onClick={(e) => { handleRipple(e); setSelectedMovementLog(log); }}
                      className={`flex items-start gap-2.5 text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        log.type === 'Receive' ? 'bg-emerald-50 text-emerald-650' :
                        log.type === 'Issue' ? 'bg-red-50 text-red-550' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {log.type === 'Receive' && <ArrowDownLeft size={12} />}
                        {log.type === 'Issue' && <ArrowUpRight size={12} />}
                        {log.type === 'Transfer' && <ArrowRightLeft size={12} />}
                        {log.type === 'Adjust' && <Activity size={12} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-white truncate">{log.product}</p>
                        <p className="text-[9.5px] text-slate-400 mt-0.5">
                          {log.type} {log.qty} units • {log.warehouse} {log.targetWarehouse ? `→ ${log.targetWarehouse}` : ''}
                        </p>
                        <span className="text-[8.5px] text-slate-455 block mt-1 font-semibold">{log.time} • Ref: {log.ref}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Recent Inventory Updates / Warehouse Actions */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Database size={14} className="text-purple-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Warehouse Actions</h3>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <button
                  disabled={loadingAction !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingAction('receive');
                    setTimeout(() => { setLoadingAction(null); handleOpenMovementModal('receive'); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingAction === 'receive' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <ArrowDownLeft size={13} className="text-emerald-500" />}
                    Receive Stock Order
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingAction !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingAction('issue');
                    setTimeout(() => { setLoadingAction(null); handleOpenMovementModal('issue'); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingAction === 'issue' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <ArrowUpRight size={13} className="text-red-500" />}
                    Issue Stock Outbound
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingAction !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingAction('csv');
                    setTimeout(() => { setLoadingAction(null); handleExportCSV(); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingAction === 'csv' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <FileSpreadsheet size={13} className="text-blue-500" />}
                    Download Stock Sheets (CSV)
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>

                <button
                  disabled={loadingAction !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingAction('print');
                    setTimeout(() => { setLoadingAction(null); window.print(); }, 400);
                  }}
                  className={`w-full p-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center justify-between hover:scale-[1.01] hover:shadow-xs active:scale-[0.99] widget-interactive-item ${
                    isDark ? 'border-slate-800 hover:border-slate-700 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {loadingAction === 'print' ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Printer size={13} className="text-slate-550 dark:text-slate-400" />}
                    Print Stock List
                  </span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* INDIVIDUAL PRODUCT MOVEMENT LEDGER HISTORICAL MODAL */}
      {showHistoryModal && historyProduct && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-200 text-gray-800'} rounded-2xl shadow-2xl p-6 max-w-lg w-full animate-scale-up text-left`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white">Movement Ledger</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{historyProduct.name} • SKU: {historyProduct.sku}</span>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-450 border-b border-slate-100 dark:border-slate-800 font-extrabold uppercase">
                    <th className="p-2">Type</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Warehouse</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-600 dark:text-slate-350">
                  {movementLogs.filter(log => log.sku === historyProduct.sku).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-slate-400 font-bold">No registered logs for this SKU.</td>
                    </tr>
                  ) : (
                    movementLogs.filter(log => log.sku === historyProduct.sku).map((log) => (
                      <tr key={log.id}>
                        <td className="p-2 font-bold text-slate-800 dark:text-white">{log.type}</td>
                        <td className="p-2 font-black">{log.qty} units</td>
                        <td className="p-2">{log.warehouse} {log.targetWarehouse ? `→ ${log.targetWarehouse}` : ''}</td>
                        <td className="p-2">{log.ref}</td>
                        <td className="p-2 text-right text-[10.5px] text-slate-400">{log.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC STOCK TRANSACTION MODAL (RECEIVE / ISSUE / TRANSFER / ADJUST) */}
      {activeModalType && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-up text-left`}>
            
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-905 dark:text-white">
                {activeModalType === 'receive' && 'Receive Warehouse Stock'}
                {activeModalType === 'issue' && 'Issue Outbound Stock'}
                {activeModalType === 'transfer' && 'Transfer Warehouse Stock'}
                {activeModalType === 'adjust' && 'Adjust Stock Quantities'}
              </h2>
              <button onClick={() => setActiveModalType('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {draftLoaded && (
              <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-105 dark:border-blue-900/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-3 animate-fade-in select-none">
                <span>Loaded unsaved transaction draft.</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('inventory_movement_draft');
                    setDraftLoaded(false);
                    setMovementForm({
                      productId: '',
                      warehouse: 'WH-Alpha',
                      targetWarehouse: 'WH-Beta',
                      quantity: 10,
                      reorderLevel: 10,
                      reference: '',
                      reason: 'Cycle Count'
                    });
                  }}
                  className="text-red-500 hover:text-red-700 underline text-[10px] uppercase font-black"
                >
                  Discard
                </button>
              </div>
            )}

            <form onSubmit={handleStockOperationSubmit} className="space-y-3.5 text-xs">
              
              {/* Product Selector */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Select Product *</label>
                <select
                  value={movementForm.productId}
                  onChange={(e) => {
                    const item = inventory.find(p => p._id === e.target.value);
                    setMovementForm({
                      ...movementForm,
                      productId: e.target.value,
                      warehouse: item ? getWarehouse(item.category) : 'WH-Alpha',
                      reorderLevel: item ? (item.stock?.minimum || 10) : 10
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  required
                >
                  <option value="">Select product to allocate...</option>
                  {inventory.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Source Warehouse */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    {activeModalType === 'receive' ? 'Destination Warehouse' : 'Source Warehouse'}
                  </label>
                  <select
                    value={movementForm.warehouse}
                    onChange={(e) => setMovementForm({ ...movementForm, warehouse: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                    }`}
                  >
                    <option value="WH-Alpha">WH-Alpha (Sensors)</option>
                    <option value="WH-Beta">WH-Beta (Hardware)</option>
                    <option value="WH-Gamma">WH-Gamma (Cold Storage)</option>
                    <option value="WH-Delta">WH-Delta (Clothing)</option>
                  </select>
                </div>

                {/* Target Warehouse (Only for transfers) */}
                {activeModalType === 'transfer' && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Target Destination Warehouse *</label>
                    <select
                      value={movementForm.targetWarehouse}
                      onChange={(e) => setMovementForm({ ...movementForm, targetWarehouse: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                      }`}
                      required
                    >
                      <option value="WH-Alpha">WH-Alpha (Sensors)</option>
                      <option value="WH-Beta">WH-Beta (Hardware)</option>
                      <option value="WH-Gamma">WH-Gamma (Cold Storage)</option>
                      <option value="WH-Delta">WH-Delta (Clothing)</option>
                    </select>
                  </div>
                )}

                {/* Adjust Reorder Level (Only for adjust) */}
                {activeModalType === 'adjust' && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">New Reorder level *</label>
                    <input
                      type="number"
                      value={movementForm.reorderLevel}
                      onChange={(e) => setMovementForm({ ...movementForm, reorderLevel: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                      }`}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    {activeModalType === 'adjust' ? 'New Absolute Quantity *' : 'Quantity *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                    required
                  />
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Transaction Ref / Order Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-9281"
                    value={movementForm.reference}
                    onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
              </div>
                {/* Reason (Only for adjust) */}
              {activeModalType === 'adjust' && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Reason for Adjustment</label>
                  <select
                    value={movementForm.reason}
                    onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                    }`}
                  >
                    <option value="Cycle Count">Cycle Count Correction</option>
                    <option value="Damaged Stock">Damaged / Broken Stock</option>
                    <option value="Theft/Loss">Inventory Loss / Write-off</option>
                    <option value="Audit Adjustment">Periodic Audit Balance</option>
                  </select>
                </div>
              )}

              {/* Operator Name */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Authorized Operator Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Mehta"
                  value={movementForm.operator}
                  onChange={(e) => setMovementForm({ ...movementForm, operator: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-855 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                  }`}
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Transaction Ledger Notes</label>
                <textarea
                  placeholder="Slip reference, invoice tracking details, comments..."
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-855 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                  }`}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md"
                >
                  Submit Stock Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalType('')}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Timeline Event Detail Modal */}
        {selectedTimelineEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedTimelineEvent(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-blue-600 animate-pulse" />
                <h3 className="text-base font-black uppercase tracking-wider">Audit Log Details</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Event Action</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedTimelineEvent.title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Operational Context</span>
                  <p className="text-slate-550 dark:text-slate-300 font-medium leading-relaxed">{selectedTimelineEvent.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Category Tag</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border text-slate-655 dark:text-slate-300">{selectedTimelineEvent.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Execution Time</span>
                    <span>{selectedTimelineEvent.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movement Log Detail Modal */}
        {selectedMovementLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl text-left relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-800'
            }`}>
              <button 
                onClick={() => setSelectedMovementLog(null)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={18} className="text-emerald-600" />
                <h3 className="text-base font-black uppercase tracking-wider">Movement Log Details</h3>
              </div>
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Product Ledger Node</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedMovementLog.product} (SKU: {selectedMovementLog.sku})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Transaction Type</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      selectedMovementLog.type === 'Receive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      selectedMovementLog.type === 'Issue' ? 'bg-red-50 text-red-650 border-red-100' : 'bg-blue-50 text-blue-650 border-blue-100'
                    }`}>{selectedMovementLog.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Units Quantity</span>
                    <span className="font-extrabold text-sm">{selectedMovementLog.qty} units</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Warehouse Pinned</span>
                    <span>{selectedMovementLog.warehouse} {selectedMovementLog.targetWarehouse ? `→ ${selectedMovementLog.targetWarehouse}` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Reference Code</span>
                    <span className="font-mono text-slate-550">{selectedMovementLog.ref}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Operator Name</span>
                    <span>{selectedMovementLog.operator || 'System Admin'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Audit Signature</span>
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{selectedMovementLog.hash || 'SHA-UNVERIFIED'}</span>
                  </div>
                </div>
                {selectedMovementLog.notes && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Notes / Slip References</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-normal mt-1">{selectedMovementLog.notes}</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Timestamp</span>
                  <span>{selectedMovementLog.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Warehouse Detail Drawer */}
      {showWarehouseDrawer && selectedWarehouse && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setShowWarehouseDrawer(false)}
          />
          <div 
            className={`fixed top-0 right-0 h-screen w-full max-w-sm z-[120] shadow-2xl border-l flex flex-col transition-all duration-300 animate-slide-left text-left ${
              isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-800 shadow-slate-350/40'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-405 block tracking-widest leading-none">Warehouse Node</span>
                <p className="text-sm font-black truncate max-w-[240px] mt-1.5">{selectedWarehouse.name}</p>
              </div>
              <button 
                onClick={() => setShowWarehouseDrawer(false)}
                className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Location Tag Card */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Location & Info</span>
                <p className="text-xs font-bold">{selectedWarehouse.location}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-955/20 text-blue-655 dark:text-blue-400">
                  Status: {selectedWarehouse.status}
                </span>
              </div>

              {/* Occupancy details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <span>Occupancy Gauge</span>
                  <span className="text-slate-900 dark:text-white">
                    {Math.round((selectedWarehouse.currentStock / selectedWarehouse.capacity) * 100)}% Used
                  </span>
                </div>
                <div className="w-full bg-slate-105 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(selectedWarehouse.currentStock / selectedWarehouse.capacity) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>{selectedWarehouse.currentStock.toLocaleString()} units occupied</span>
                  <span>{selectedWarehouse.capacity.toLocaleString()} units max</span>
                </div>
              </div>

              {/* Supervisor Info */}
              <div className="space-y-3.5 text-xs font-semibold pt-4 border-t border-slate-105 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Supervisor Node</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">{selectedWarehouse.supervisor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Direct Hotline</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{selectedWarehouse.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Network Address</span>
                  <span className="text-xs font-mono font-bold text-blue-605">{selectedWarehouse.email}</span>
                </div>
              </div>

              {/* Stored Items */}
              <div className="space-y-2.5 pt-4 border-t border-slate-105 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Stored Items</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inventory.filter(item => getWarehouse(item.category) === selectedWarehouse.id).map(item => (
                    <div 
                      key={item._id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        isDark ? 'bg-slate-850/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-150 text-slate-700'
                      }`}
                    >
                      <div className="truncate max-w-[150px]">
                        <p className="font-extrabold truncate">{item.name}</p>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{item.sku}</p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-slate-100">{item.stock?.current || 0} units</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className={`p-4 border-t flex gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => { setShowWarehouseDrawer(false); handleOpenMovementModal('receive'); }}
                className="flex-1 py-2 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition animate-pulse"
              >
                Receive
              </button>
              <button
                onClick={() => { setShowWarehouseDrawer(false); handleOpenMovementModal('transfer'); }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition"
              >
                Transfer
              </button>
            </div>

          </div>
        </>
      )}

      {/* Transaction Confirmation Dialog Modal */}
      {showConfirmModal && confirmActionData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-202 text-gray-800'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            
            <div className="flex items-center gap-3 text-blue-600 mb-3">
              <Info size={20} />
              <h3 className="text-sm font-black uppercase tracking-wider">Confirm Stock Movement</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-relaxed">
              Are you sure you want to finalize this stock ledger change? This action will adjust available quantities and log a secure audit trace code.
            </p>

            {/* Details Panel */}
            <div className={`p-3 rounded-xl border text-[11px] font-bold space-y-2 mb-5 ${
              isDark ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-150'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="uppercase text-blue-600 dark:text-blue-450">{confirmActionData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Product SKU:</span>
                <span>{confirmActionData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span>{confirmActionData.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Warehouse:</span>
                <span>{confirmActionData.warehouse} {confirmActionData.targetWarehouse ? `→ ${confirmActionData.targetWarehouse}` : ''}</span>
              </div>
              {confirmActionData.reference && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Ref Code:</span>
                  <span className="font-mono">{confirmActionData.reference}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                disabled={isProcessing}
                onClick={() => { setShowConfirmModal(false); setConfirmActionData(null); }}
                className="flex-1 py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-white font-bold rounded-xl text-xs transition border dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmSubmit}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-755 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm & Write'
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Mock inventory fallback dataset
function getMockInventory() {
  return [
    { _id: '1', sku: 'SKU-EL-941', name: 'Laser Proximity Sensor', category: 'Electronics', stock: { current: 15, minimum: 5 }, description: '{"brand":"StockerAI Premium"}', updatedAt: '2026-07-16T12:00:00.000Z' },
    { _id: '2', sku: 'SKU-HW-102', name: 'Alloy Bracket Mounts', category: 'Hardware', stock: { current: 120, minimum: 20 }, description: '{"brand":"Acme Corp"}', updatedAt: '2026-07-15T09:00:00.000Z' },
    { _id: '3', sku: 'SKU-EL-309', name: 'OLED Display Modules', category: 'Electronics', stock: { current: 3, minimum: 10 }, description: '{"brand":"StockerAI Premium"}', updatedAt: '2026-07-16T10:30:00.000Z' },
    { _id: '4', sku: 'SKU-FD-029', name: 'Dehydrated Ration Packs', category: 'Food', stock: { current: 50, minimum: 15 }, description: '{"brand":"Nexus Goods"}', updatedAt: '2026-07-14T02:00:00.000Z' },
    { _id: '5', sku: 'SKU-CL-808', name: 'Cleanroom Cotton Coveralls', category: 'Clothing', stock: { current: 25, minimum: 5 }, description: '{"brand":"Acme Corp"}', updatedAt: '2026-07-15T11:45:00.000Z' }
  ];
}
