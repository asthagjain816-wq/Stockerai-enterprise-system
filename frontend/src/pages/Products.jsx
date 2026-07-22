import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useNotificationStore from '../store/notificationStore';
import useLanguageStore from '../store/languageStore';
import useToastStore from '../store/toastStore';
import useActivityStore from '../store/activityStore';
import useConfirmStore from '../store/confirmStore';
import { getApiBaseUrl } from '../config/apiConfig';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimatedCounter from '../components/AnimatedCounter';
import HighlightText from '../components/HighlightText';
import { getBarcodeSVG } from '../services/barcodeService';
import { getQrSVG } from '../services/qrService';
import { handleRipple } from '../utils/ripple';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  Plus, 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  Check, 
  Eye, 
  SlidersHorizontal, 
  Package, 
  AlertTriangle, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  QrCode,
  FileEdit,
  FolderMinus,
  Clock,
  TrendingUp,
  CheckCircle2,
  Lock,
  Copy,
  Printer,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loadingCatalogOp, setLoadingCatalogOp] = useState(null);
  const { isDark } = useThemeStore();
  const { addNotification } = useNotificationStore();
  const { showToast } = useToastStore();
  const [searchParams] = useSearchParams();
  const { t } = useLanguageStore();
  const { addActivity } = useActivityStore();
  const { askConfirm } = useConfirmStore();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Advanced Filters State
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Detail Drawer State
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [drawerItem, setDrawerItem] = useState(null);

  // Search, Filter, Sort, Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Electronics',
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    brand: 'StockerAI Premium',
    barcode: '',
    status: 'Active',
    image: '',
    warehouse: 'WH-Alpha',
    unit: 'pcs',
    variants: 'Standard'
  });

  // Dynamic Category, Brand, Warehouse, and Units States
  const [categoriesList, setCategoriesList] = useState(() => {
    const saved = localStorage.getItem('erp_categories');
    return saved ? JSON.parse(saved) : ['Electronics', 'Clothing', 'Food', 'Hardware', 'Other'];
  });

  const [brandsList, setBrandsList] = useState(() => {
    const saved = localStorage.getItem('erp_brands');
    return saved ? JSON.parse(saved) : ['StockerAI Premium', 'Acme Corp', 'Global Logistics', 'Standard Parts'];
  });

  const [warehousesList] = useState(['WH-Alpha', 'WH-Beta', 'WH-Gamma', 'WH-Delta', 'Central Depot']);
  const [unitsList] = useState(['pcs', 'units', 'kg', 'liters', 'boxes', 'packs']);

  const handleAddNewCategory = () => {
    const name = prompt('Enter new category name:');
    if (name && name.trim()) {
      const clean = name.trim();
      if (!categoriesList.includes(clean)) {
        const next = [...categoriesList, clean];
        setCategoriesList(next);
        localStorage.setItem('erp_categories', JSON.stringify(next));
      }
      setFormData(prev => ({ ...prev, category: clean }));
      showToast(`Category "${clean}" added.`, 'success');
    }
  };

  const handleAddNewBrand = () => {
    const name = prompt('Enter new brand name:');
    if (name && name.trim()) {
      const clean = name.trim();
      if (!brandsList.includes(clean)) {
        const next = [...brandsList, clean];
        setBrandsList(next);
        localStorage.setItem('erp_brands', JSON.stringify(next));
      }
      setFormData(prev => ({ ...prev, brand: clean }));
      showToast(`Brand "${clean}" added.`, 'success');
    }
  };

  const generateSKU = () => {
    const catCode = formData.category ? formData.category.substring(0, 2).toUpperCase() : 'XX';
    const rand = Math.floor(100 + Math.random() * 900);
    const newSku = `SKU-${catCode}-${rand}`;
    setFormData(prev => ({ ...prev, sku: newSku }));
    showToast(`Generated SKU Code: ${newSku}`, 'info');
  };

  const generateBarcode = () => {
    const num = Math.floor(1000000000 + Math.random() * 9000000000);
    const newBarcode = `890${num}`;
    setFormData(prev => ({ ...prev, barcode: newBarcode }));
    showToast(`Generated Barcode UPC: ${newBarcode}`, 'info');
  };

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Quick Action Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrItem, setQrItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('Electronics');
  const [importCsvFile, setImportCsvFile] = useState(null);

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    sku: true,
    category: true,
    brand: true,
    supplier: true,
    price: true,
    barcode: true,
    status: true,
    lastUpdated: true,
    actions: true
  });

  // Column Order State
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('products_column_order');
    return saved ? JSON.parse(saved) : ['name', 'sku', 'category', 'brand', 'supplier', 'price', 'barcode', 'status', 'lastUpdated'];
  });
  const [draggedCol, setDraggedCol] = useState(null);

  // Drag and Drop upload states
  const [isDragOver, setIsDragOver] = useState(false);

  // Recently Viewed product state
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    return JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
  });

  // Form draft loading
  const [draftLoaded, setDraftLoaded] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        // Fallback mock
        setProducts(getMockProducts());
      }
    } catch (err) {
      console.warn('API unavailable, loading mock products:', err);
      setProducts(getMockProducts());
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/suppliers`, { credentials: 'include' });
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

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchSuppliers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Sync Search Query Parameters & Quick Actions
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilterCategory(categoryParam);
    }
    const actionParam = searchParams.get('action');
    if (actionParam) {
      window.history.replaceState(null, '', window.location.pathname);
      if (actionParam === 'create') {
        setEditingId(null);
        setFormData({
          name: '',
          sku: '',
          description: '',
          category: 'Electronics',
          costPrice: 0,
          sellingPrice: 0,
          supplier: suppliers.length > 0 ? suppliers[0]._id : '',
          brand: 'StockerAI Premium',
          barcode: '',
          status: 'Active'
        });
        setShowModal(true);
      }
    }
  }, [searchParams, suppliers]);

  // Decoders for description parameters
  const decodeDescription = (item) => {
    let parsed = { desc: item.description || '', brand: 'Acme Corp', barcode: '', status: 'Active', image: '', warehouse: 'WH-Alpha', unit: 'pcs', variants: 'Standard' };
    if (!item.description) return parsed;
    try {
      const obj = JSON.parse(item.description);
      if (obj && typeof obj === 'object') {
        return {
          desc: obj.desc || '',
          brand: obj.brand || 'Acme Corp',
          barcode: obj.barcode || ('890' + item.sku.replace(/[^0-9]/g, '')),
          status: obj.status || (item.isActive ? 'Active' : 'Archived'),
          image: obj.image || '',
          warehouse: obj.warehouse || 'WH-Alpha',
          unit: obj.unit || 'pcs',
          variants: obj.variants || 'Standard'
        };
      }
    } catch (e) {
      // String parsing fallback
    }
    return {
      desc: item.description || '',
      brand: 'Acme Corp',
      barcode: '890' + (item.sku || '').replace(/[^0-9]/g, ''),
      status: item.isActive ? 'Active' : 'Archived',
      image: '',
      warehouse: 'WH-Alpha',
      unit: 'pcs',
      variants: 'Standard'
    };
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.sku) {
      showToast('Product Name and SKU are required.', 'error');
      return;
    }

    // Serialize custom fields into description to preserve backend compatibility
    const descObj = {
      desc: formData.description,
      brand: formData.brand || 'StockerAI Premium',
      barcode: formData.barcode || ('890' + formData.sku.replace(/[^0-9]/g, '')),
      status: formData.status,
      image: formData.image || '',
      warehouse: formData.warehouse || 'WH-Alpha',
      unit: formData.unit || 'pcs',
      variants: formData.variants || 'Standard'
    };

    const payload = {
      name: formData.name,
      sku: formData.sku,
      description: JSON.stringify(descObj),
      category: formData.category,
      price: {
        cost: Number(formData.costPrice),
        selling: Number(formData.sellingPrice)
      },
      // Catalog creates start with 0 stock. Warehouse inventory allocates them subsequently.
      stock: {
        current: 0,
        minimum: 10
      },
      supplier: formData.supplier || undefined,
      isActive: formData.status !== 'Archived'
    };

    try {
      let res;
      const baseUrl = getApiBaseUrl();
      if (editingId) {
        res = await fetch(`${baseUrl}/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${baseUrl}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (data.success) {
        addNotification(`Product "${formData.name}" successfully saved in catalog.`, 'success');
        setShowModal(false);
        setEditingId(null);
        fetchProducts();
      } else {
        showToast(data.message || 'Error saving product', 'error');
      }
    } catch (err) {
      // Mock save fallback
      if (editingId) {
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p));
      } else {
        setProducts(prev => [{ ...payload, _id: 'mock_' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
      }
      addNotification(`Product "${formData.name}" saved in local cache mode.`, 'success');
      setShowModal(false);
      setEditingId(null);
    }
  };

  const handleEditClick = (item) => {
    const decoded = decodeDescription(item);
    setEditingId(item._id);
    setFormData({
      name: item.name,
      sku: item.sku,
      description: decoded.desc,
      category: item.category || 'Electronics',
      costPrice: item.price?.cost || 0,
      sellingPrice: item.price?.selling || 0,
      supplier: item.supplier || '',
      brand: decoded.brand,
      barcode: decoded.barcode,
      status: decoded.status,
      image: decoded.image || '',
      warehouse: decoded.warehouse || 'WH-Alpha',
      unit: decoded.unit || 'pcs',
      variants: decoded.variants || 'Standard'
    });
    setShowModal(true);
  };

  // Bulk Operations Handlers
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const baseUrl = getApiBaseUrl();
      await Promise.all(selectedIds.map(id => 
        fetch(`${baseUrl}/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
      ));
      setProducts(prev => prev.filter(p => !selectedIds.includes(p._id)));
      showToast(`Successfully deleted ${selectedIds.length} products.`, 'success');
      setSelectedIds([]);
    } catch (err) {
      setProducts(prev => prev.filter(p => !selectedIds.includes(p._id)));
      showToast(`Deleted ${selectedIds.length} products (local cache).`, 'success');
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedIds.length === 0) return;
    const updatedProducts = products.map(p => {
      if (selectedIds.includes(p._id)) {
        const decoded = decodeDescription(p);
        const descObj = { ...decoded, status };
        return {
          ...p,
          description: JSON.stringify(descObj),
          isActive: status !== 'Archived',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    
    try {
      const baseUrl = getApiBaseUrl();
      await Promise.all(selectedIds.map(id => {
        const original = products.find(p => p._id === id);
        const decoded = decodeDescription(original);
        const descObj = { ...decoded, status };
        return fetch(`${baseUrl}/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...original,
            description: JSON.stringify(descObj),
            isActive: status !== 'Archived'
          })
        });
      }));
      setProducts(updatedProducts);
      showToast(`Updated status of ${selectedIds.length} items to ${status}.`, 'success');
      setSelectedIds([]);
    } catch (err) {
      setProducts(updatedProducts);
      showToast(`Updated status to ${status} (local cache).`, 'success');
      setSelectedIds([]);
    }
  };

  const handleBulkCategoryChange = async (category) => {
    if (selectedIds.length === 0) return;
    const updatedProducts = products.map(p => {
      if (selectedIds.includes(p._id)) {
        return {
          ...p,
          category,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    
    try {
      const baseUrl = getApiBaseUrl();
      await Promise.all(selectedIds.map(id => {
        const original = products.find(p => p._id === id);
        return fetch(`${baseUrl}/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...original,
            category
          })
        });
      }));
      setProducts(updatedProducts);
      showToast(`Moved ${selectedIds.length} items to ${category}.`, 'success');
      setSelectedIds([]);
      setShowBulkEditModal(false);
    } catch (err) {
      setProducts(updatedProducts);
      showToast(`Moved items to ${category} (local cache).`, 'success');
      setSelectedIds([]);
      setShowBulkEditModal(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        addNotification('Product deleted from inventory catalog.', 'warning');
        fetchProducts();
      }
    } catch (err) {
      setProducts(prev => prev.filter(p => p._id !== id));
      addNotification('Product deleted from local cache.', 'warning');
    }
  };

  const handleDuplicateProduct = (item) => {
    const decoded = decodeDescription(item);
    setEditingId(null);
    setFormData({
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      description: decoded.desc,
      category: item.category,
      costPrice: item.price?.cost || 0,
      sellingPrice: item.price?.selling || 0,
      supplier: item.supplier || '',
      brand: decoded.brand,
      barcode: decoded.barcode ? `${decoded.barcode}-1` : '',
      status: 'Draft'
    });
    setShowModal(true);
  };

  // Bulk actions are handled in updated methods below

  // CSV Exporter using high-reliability Blob
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('No products to export.', 'error');
      return;
    }
    let csvContent = 'Product Name,SKU,Category,Brand,Supplier,Unit Price,Barcode,Status\n';
    
    products.forEach(p => {
      const decoded = decodeDescription(p);
      const supplierName = suppliers.find(s => s._id === p.supplier)?.name || 'Local Supplier';
      csvContent += `"${p.name}","${p.sku}","${p.category}","${decoded.brand}","${supplierName}",${p.price?.selling || 0},"${decoded.barcode || ''}","${decoded.status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalog_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log Activity
    const useActivity = useActivityStore.getState();
    if (useActivity && useActivity.addExport) {
      useActivity.addExport(`catalog_export_${Date.now()}.csv`, 'CSV');
      useActivity.addActivity('Generated Products catalog CSV export file', 'info');
    }
  };

  // CSV Importer client-side parsing
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
        showToast('CSV file appears empty.', 'error');
        return;
      }

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple comma split
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        
        const name = values[0] || 'Imported SKU Item';
        const sku = values[1] || `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
        const category = values[2] || 'Other';
        const brand = values[3] || 'Generic';
        const costPrice = Number(values[5]) * 0.7 || 20;
        const sellingPrice = Number(values[5]) || 30;
        const barcode = values[6] || `890${sku.replace(/[^0-9]/g, '')}`;
        const status = values[7] || 'Active';

        const descObj = {
          desc: 'Spreadsheet imported catalog item.',
          brand,
          barcode,
          status
        };

        const payload = {
          name,
          sku,
          description: JSON.stringify(descObj),
          category,
          price: { cost: costPrice, selling: sellingPrice },
          stock: { current: 15, minimum: 5 },
          isActive: status !== 'Archived'
        };

        try {
          await fetch(`${getApiBaseUrl()}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          importedCount++;
        } catch (err) {
          // Fallback mock update
          setProducts(prev => [{ ...payload, _id: 'mock_' + Date.now() + '_' + i, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
          importedCount++;
        }
      }

      addNotification(`CSV Import Complete: Loaded ${importedCount} items.`, 'success');
      addActivity(`Imported ${importedCount} items from CSV spreadsheet`, 'info');
      setShowImportModal(false);
      setImportCsvFile(null);
      fetchProducts();
    };
    reader.readAsText(importCsvFile);
  };

  // Drag and Drop Table Columns Reordering handlers
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
    localStorage.setItem('products_column_order', JSON.stringify(newOrder));
    addNotification('Table column layout updated.', 'info');
  };

  // Drag and Drop files upload handlers
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
      showToast('Please drop a valid .csv file format.', 'error');
    }
  };

  // Recently Viewed product tracker
  const handleShowQrModal = (p) => {
    setQrItem(p);
    setShowQrModal(true);

    const stored = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
    const filtered = stored.filter(item => item._id !== p._id);
    const updated = [p, ...filtered].slice(0, 5);
    localStorage.setItem('recently_viewed_products', JSON.stringify(updated));
    setRecentlyViewed(updated);

    addActivity(`Inspected QR and Barcode tagging for SKU: ${p.sku}`, 'info');
  };

  // Form Autosave Draft Effects
  useEffect(() => {
    if (showModal) {
      localStorage.setItem('product_form_draft', JSON.stringify({ editingId, formData }));
    }
  }, [formData, showModal, editingId]);

  useEffect(() => {
    if (showModal) {
      const saved = localStorage.getItem('product_form_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.editingId === editingId) {
            setFormData(parsed.formData);
            setDraftLoaded(true);
          }
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
    } else {
      setDraftLoaded(false);
    }
  }, [showModal, editingId]);

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
  const filteredProducts = products.filter(item => {
    const decoded = decodeDescription(item);
    const supplierObj = suppliers.find(s => s._id === item.supplier);
    const supplierName = supplierObj?.name || 'Local Supplier';

    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (decoded.barcode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (decoded.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSupplier = filterSupplier === 'All' || item.supplier === filterSupplier;
    const matchesStatus = filterStatus === 'All' || (decoded.status || 'Active') === filterStatus;

    // Advanced filters
    const priceVal = item.price?.selling || 0;
    const matchesMinPrice = !minPriceFilter || priceVal >= Number(minPriceFilter);
    const matchesMaxPrice = !maxPriceFilter || priceVal <= Number(maxPriceFilter);

    let matchesStockStatus = true;
    const currentStock = item.stock?.current || 0;
    const minStock = item.stock?.minimum || 10;
    if (stockStatusFilter === 'Low Stock') {
      matchesStockStatus = currentStock <= minStock && currentStock > 0;
    } else if (stockStatusFilter === 'Out of Stock') {
      matchesStockStatus = currentStock === 0;
    } else if (stockStatusFilter === 'In Stock') {
      matchesStockStatus = currentStock > minStock;
    }

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesMinPrice && matchesMaxPrice && matchesStockStatus;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA, valB;
    const decA = decodeDescription(a);
    const decB = decodeDescription(b);

    if (sortBy === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortBy === 'sku') {
      valA = a.sku.toLowerCase();
      valB = b.sku.toLowerCase();
    } else if (sortBy === 'category') {
      valA = a.category.toLowerCase();
      valB = b.category.toLowerCase();
    } else if (sortBy === 'brand') {
      valA = decA.brand.toLowerCase();
      valB = decB.brand.toLowerCase();
    } else if (sortBy === 'supplier') {
      valA = (suppliers.find(s => s._id === a.supplier)?.name || '').toLowerCase();
      valB = (suppliers.find(s => s._id === b.supplier)?.name || '').toLowerCase();
    } else if (sortBy === 'price') {
      valA = a.price?.selling || 0;
      valB = b.price?.selling || 0;
    } else if (sortBy === 'barcode') {
      valA = decA.barcode.toLowerCase();
      valB = decB.barcode.toLowerCase();
    } else if (sortBy === 'status') {
      valA = decA.status.toLowerCase();
      valB = decB.status.toLowerCase();
    } else if (sortBy === 'lastUpdated') {
      valA = new Date(a.updatedAt || a.createdAt);
      valB = new Date(b.updatedAt || b.createdAt);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Row selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map(p => p._id));
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
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter(p => decodeDescription(p).status === 'Active').length;
  const draftProductsCount = products.filter(p => decodeDescription(p).status === 'Draft').length;
  const archivedProductsCount = products.filter(p => decodeDescription(p).status === 'Archived').length;

  // Bottom widgets lists
  const recentAdded = [...products].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const lowStock = products.filter(p => (p.stock?.current || 0) <= (p.stock?.minimum || 10)).slice(0, 4);

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

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-slide-up">
          
          {/* HEADER CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 text-left">
            <div>
              <Breadcrumbs />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Products Catalog
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Register item templates, cost limits, barcode identifiers, and catalog status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                  showAdvancedFilters || minPriceFilter || maxPriceFilter || stockStatusFilter !== 'All'
                    ? 'bg-blue-650 border-blue-650 text-white hover:bg-blue-700'
                    : isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-202 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal size={12} />
                Filters
              </button>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Category: All</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>

              {/* Supplier Filter */}
              <select
                value={filterSupplier}
                onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="All">Supplier: All</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    sku: '',
                    description: '',
                    category: 'Electronics',
                    costPrice: 0,
                    sellingPrice: 0,
                    supplier: suppliers.length > 0 ? suppliers[0]._id : '',
                    brand: 'StockerAI Premium',
                    barcode: '',
                    status: 'Active',
                    image: ''
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus size={14} />
                Add Product
              </button>
            </div>
          </div>

          {/* ADVANCED FILTERS PANEL */}
          {showAdvancedFilters && (
            <div className={`p-4 rounded-2xl border text-xs font-bold text-left animate-slide-up space-y-3.5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/45' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/40'
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-slate-105 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400">Advanced Catalog Filters</span>
                <button 
                  onClick={() => { setMinPriceFilter(''); setMaxPriceFilter(''); setStockStatusFilter('All'); setFilterCategory('All'); setFilterSupplier('All'); setFilterStatus('All'); setSearchTerm(''); }}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    value={minPriceFilter}
                    onChange={(e) => { setMinPriceFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="Min"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    value={maxPriceFilter}
                    onChange={(e) => { setMaxPriceFilter(e.target.value); setCurrentPage(1); }}
                    placeholder="Max"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Stock Level Status</label>
                  <select
                    value={stockStatusFilter}
                    onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                    }`}
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="In Stock">In Stock (Normal)</option>
                    <option value="Low Stock">Low Stock Warning</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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
                {/* Total Products Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('All'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
                    <span className="text-xl font-black text-slate-905 dark:text-white">
                      <AnimatedCounter value={totalProductsCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>

                {/* Active Products Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Active'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Active' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Products</span>
                    <span className="text-xl font-black text-emerald-605">
                      <AnimatedCounter value={activeProductsCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                </div>

                {/* Draft Products Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Draft'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Draft' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Draft Products</span>
                    <span className="text-xl font-black text-amber-505">
                      <AnimatedCounter value={draftProductsCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-500 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                </div>

                {/* Archived Products Card */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus('Archived'); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Archived' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Archived Products</span>
                    <span className="text-xl font-black text-slate-405">
                      <AnimatedCounter value={archivedProductsCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-550 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recently Viewed Products Panel */}
          {recentlyViewed.length > 0 && (
            <div className={`p-4 rounded-xl border transition shadow-xs text-left animate-fade-in ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 select-none">
                <Clock size={11} className="text-blue-500" />
                Recently Viewed Catalog
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentlyViewed.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleShowQrModal(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition select-none ${
                      isDark 
                        ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Box size={10} className="text-slate-400" />
                    <span>{item.name}</span>
                    <span className="text-[9px] font-mono text-slate-450 font-medium">({item.sku})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAIN FULL WIDTH CATALOG TABLE */}
          <div className={`rounded-2xl border transition shadow-sm overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {selectedIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/85 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs font-bold animate-slide-up">
                <span className="text-blue-700 dark:text-blue-400">{selectedIds.length} items checked</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider select-none">Status:</span>
                  <button
                    onClick={() => handleBulkStatusChange('Active')}
                    className="px-2.5 py-1.5 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-100 rounded-lg transition"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Draft')}
                    className="px-2.5 py-1.5 border border-amber-250 dark:border-amber-900 bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-505 hover:bg-amber-100 rounded-lg transition"
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Archived')}
                    className="px-2.5 py-1.5 border border-slate-202 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg transition"
                  >
                    Archive
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Bulk Category Apply
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1.5 bg-red-655 hover:bg-red-700 text-white rounded-lg flex items-center gap-1 transition"
                  >
                    <Trash2 size={11} />
                    Delete Selected
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
                    {/* Bulk Selection Box Column */}
                    <th className="px-4 py-3 select-none w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedProducts.length}
                        className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    {columnOrder.map((colKey) => {
                      if (!visibleColumns[colKey]) return null;
                      
                      let label = '';
                      if (colKey === 'name') label = 'Product Name';
                      else if (colKey === 'sku') label = 'SKU';
                      else if (colKey === 'category') label = 'Category';
                      else if (colKey === 'brand') label = 'Brand';
                      else if (colKey === 'supplier') label = 'Supplier';
                      else if (colKey === 'price') label = 'Unit Price';
                      else if (colKey === 'barcode') label = 'Barcode';
                      else if (colKey === 'status') label = 'Status';
                      else if (colKey === 'lastUpdated') label = 'Last Updated';
                      
                      return (
                        <th
                          key={colKey}
                          draggable
                          onDragStart={(e) => handleDragStart(e, colKey)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, colKey)}
                          onClick={() => handleSort(colKey)}
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
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.filter(c => visibleColumns[c]).length + 2} className="py-6">
                        <EmptyState 
                          title="No Catalog Items" 
                          description="No active product records matched your search query or status filters."
                          actionText="Clear Filters"
                          onAction={() => { setSearchTerm(''); setFilterStatus('All'); setFilterSupplier('All'); }}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => {
                      const decoded = decodeDescription(p);
                      const supplierObj = suppliers.find(s => s._id === p.supplier);
                      const supplierName = supplierObj?.name || 'Local Supplier';

                      return (
                        <tr 
                          key={p._id} 
                          onClick={() => { setDrawerItem(p); setShowDetailDrawer(true); }} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition duration-150 text-left cursor-pointer"
                        >
                          {/* Checked Checkbox */}
                          <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p._id)}
                              onChange={(e) => handleSelectRow(p._id, e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          {columnOrder.map((colKey) => {
                            if (!visibleColumns[colKey]) return null;
                            
                            if (colKey === 'name') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg border overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-xs">
                                      {p.image || decoded.image ? (
                                        <img src={p.image || decoded.image} alt={p.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package size={14} className="text-slate-400" />
                                      )}
                                    </div>
                                    <div className="truncate">
                                      <p className="text-xs font-bold text-slate-905 dark:text-white truncate max-w-[130px]">
                                        <HighlightText text={p.name} search={searchTerm} />
                                      </p>
                                      <p className="text-[9.5px] text-slate-400 truncate max-w-[130px] mt-0.5 leading-none">{decoded.desc || 'No product description'}</p>
                                    </div>
                                  </div>
                                </td>
                              );
                            }
                            if (colKey === 'sku') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <code className="text-[10.5px] font-mono font-bold text-slate-650 bg-slate-105 dark:bg-slate-850 px-2 py-0.5 rounded">
                                    <HighlightText text={p.sku} search={searchTerm} />
                                  </code>
                                </td>
                              );
                            }
                            if (colKey === 'category') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50 dark:bg-slate-850 dark:border-slate-800">
                                    <HighlightText text={p.category} search={searchTerm} />
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'brand') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                  <HighlightText text={decoded.brand} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'supplier') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-500">
                                  <HighlightText text={supplierName} search={searchTerm} />
                                </td>
                              );
                            }
                            if (colKey === 'price') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-xs font-black text-slate-900 dark:text-white">
                                  ₹{p.price?.selling?.toLocaleString() || 0}
                                </td>
                              );
                            }
                            if (colKey === 'barcode') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap font-mono text-[10px] text-slate-455">
                                  {decoded.barcode || 'UPC-MAPPED'}
                                </td>
                              );
                            }
                            if (colKey === 'status') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    decoded.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' :
                                    decoded.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20' :
                                    'bg-red-50 text-red-600 border-red-100'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      decoded.status === 'Active' ? 'bg-emerald-500' :
                                      decoded.status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    {decoded.status}
                                  </span>
                                </td>
                              );
                            }
                            if (colKey === 'lastUpdated') {
                              return (
                                <td key={colKey} className="px-4 py-3 whitespace-nowrap text-[10.5px] font-bold text-slate-400">
                                  {new Date(p.updatedAt || p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </td>
                              );
                            }
                            return null;
                          })}
                          {visibleColumns.actions && (
                            <td className="px-4 py-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleEditClick(p)} className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-605 rounded-lg transition" title="Edit Catalog"><Edit3 size={12} /></button>
                                <button onClick={() => handleDuplicateProduct(p)} className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-blue-600 rounded-lg transition" title="Duplicate Item"><Copy size={12} /></button>
                                <button onClick={() => handleShowQrModal(p)} className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-emerald-600 rounded-lg transition" title="QR Tags"><QrCode size={12} /></button>
                                <button onClick={() => { setViewItem(p); setShowViewModal(true); }} className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-600 rounded-lg transition" title="Quick Label Card Preview"><Eye size={12} /></button>
                                <button onClick={() => { askConfirm({ title: 'Delete Product', message: `Are you sure you want to delete "${p.name}"? This action cannot be undone and will permanently erase this record.`, type: 'danger', confirmText: 'Delete', onConfirm: () => handleDeleteProduct(p._id) }); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition" title="Delete Product"><Trash2 size={12} /></button>
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

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-450 select-none bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span>Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} items</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className={`ml-1.5 px-2 py-0.5 rounded border text-[10px] focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-705'
                  }`}
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-6.5 h-6.5 rounded-lg text-[10.5px] font-extrabold flex items-center justify-center transition border ${currentPage === idx + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>{idx + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          </div>

          {/* PRODUCTS PAGE BOTTOM AREA: THREE EQUAL COHESIVE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Card 1: Recent Products */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-blue-650" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Catalog Additions</h3>
              </div>
              <div className="space-y-3.5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : recentAdded.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-2">No product records logged.</p>
                ) : (
                  recentAdded.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={(e) => { handleRipple(e); setViewItem(p); setShowViewModal(true); }}
                      className={`flex justify-between items-center text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block truncate max-w-[155px]">{p.name}</span>
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">SKU: {p.sku}</span>
                      </div>
                      <span className="text-[10.5px] font-black text-slate-800 dark:text-white font-mono">
                        ₹{(p.price?.selling || 0).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 2: Low Stock Products */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Low Stock Warnings</h3>
              </div>
              <div className="space-y-3.5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                    <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl w-full" />
                  </div>
                ) : lowStock.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-2">All warehouse stock is balanced.</p>
                ) : (
                  lowStock.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={(e) => { handleRipple(e); handleEditClick(p); }}
                      className={`flex justify-between items-center text-xs p-2 rounded-xl widget-interactive-item animate-slide-up-item ${
                        isDark ? 'bg-slate-900/50 border border-slate-850' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      title="Click to adjust stock limits"
                    >
                      <div>
                        <span className="font-extrabold text-slate-805 dark:text-white block truncate max-w-[155px]">{p.name}</span>
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">SKU: {p.sku}</span>
                      </div>
                      <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        {p.stock?.current || 0} left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card 3: Catalog Quick Actions / Catalog Operations */}
            <div className={`p-4 rounded-xl border transition shadow-xs widget-interactive ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="pb-2 border-b border-slate-100 dark:border-slate-850 mb-3 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-blue-500" />
                <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Catalog Operations</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('add');
                    setTimeout(() => { setLoadingCatalogOp(null); setEditingId(null); setFormData({ name: '', sku: '', description: '', category: 'Electronics', costPrice: 0, sellingPrice: 0, supplier: '', brand: 'StockerAI Premium', barcode: '', status: 'Active', image: '', warehouse: 'WH-Alpha', unit: 'pcs', variants: 'Standard' }); setShowModal(true); }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'add' ? <Loader2 size={13} className="animate-spin text-blue-605" /> : <Plus size={13} className="text-blue-500" />}
                  Add Product
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('import');
                    setTimeout(() => { setLoadingCatalogOp(null); setShowImportModal(true); }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'import' ? <Loader2 size={13} className="animate-spin text-blue-655" /> : <Upload size={13} className="text-emerald-500" />}
                  Import Catalog
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('csv');
                    setTimeout(() => { setLoadingCatalogOp(null); handleExportCSV(); }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'csv' ? <Loader2 size={13} className="animate-spin text-blue-655" /> : <Download size={13} className="text-blue-500" />}
                  Export CSV
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('qr');
                    setTimeout(() => {
                      setLoadingCatalogOp(null);
                      if (products.length > 0) { setQrItem(products[0]); setShowQrModal(true); }
                    }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'qr' ? <Loader2 size={13} className="animate-spin text-purple-550" /> : <QrCode size={13} className="text-purple-500" />}
                  Generate QR
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('print');
                    setTimeout(() => { setLoadingCatalogOp(null); window.print(); }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'print' ? <Loader2 size={13} className="animate-spin text-slate-505" /> : <Printer size={13} className="text-slate-500" />}
                  Print Labels
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('bulk');
                    setTimeout(() => { setLoadingCatalogOp(null); setShowBulkEditModal(true); }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'bulk' ? <Loader2 size={13} className="animate-spin text-amber-505" /> : <FileEdit size={13} className="text-amber-505" />}
                  Bulk Category
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    setLoadingCatalogOp('duplicate');
                    setTimeout(() => {
                      setLoadingCatalogOp(null);
                      if (products.length > 0) handleDuplicateProduct(products[0]);
                    }, 400);
                  }}
                  className={`p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition flex items-center gap-1.5 hover:scale-[1.01] widget-interactive-item ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-700'}`}
                >
                  {loadingCatalogOp === 'duplicate' ? <Loader2 size={13} className="animate-spin text-indigo-505" /> : <Copy size={13} className="text-indigo-505" />}
                  Duplicate First
                </button>

                <button
                  disabled={loadingCatalogOp !== null}
                  onClick={(e) => {
                    handleRipple(e);
                    if (selectedIds.length === 0) {
                      showToast('Please select products to delete.', 'warning');
                      return;
                    }
                    askConfirm({
                      title: 'Delete Selected Products',
                      message: `Are you sure you want to permanently delete the ${selectedIds.length} checked items from your catalog?`,
                      confirmText: 'Delete Checked',
                      cancelText: 'Cancel',
                      type: 'danger',
                      onConfirm: () => {
                        setLoadingCatalogOp('delete');
                        setTimeout(() => { setLoadingCatalogOp(null); handleBulkDelete(); }, 400);
                      }
                    });
                  }}
                  className="p-2 border rounded-xl hover:bg-red-50 hover:text-red-750 text-left transition flex items-center gap-1.5 border-red-105/10 hover:scale-[1.01] widget-interactive-item"
                >
                  {loadingCatalogOp === 'delete' ? <Loader2 size={13} className="animate-spin text-red-605" /> : <Trash2 size={13} className="text-red-505" />}
                  Delete Checked
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showViewModal && viewItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/50' : 'bg-white border border-slate-200 text-gray-800 shadow-slate-200/40'} rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-up text-left`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-black uppercase text-slate-400">Barcode & Product Card</h2>
                <span className="text-base font-black truncate block mt-0.5">{viewItem.name}</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg transition text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Preview Sheet Content */}
            <div className="space-y-4">
              
              {/* Visual Card (Barcode Sheet Mockup) */}
              <div className={`p-4 rounded-xl border flex flex-col items-center text-center shadow-inner relative ${
                isDark ? 'bg-slate-850/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Product category tag */}
                <span className="absolute top-3 left-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-wide border border-blue-500/20">
                  {viewItem.category}
                </span>

                {/* Status indicator */}
                <span className="absolute top-3 right-3 text-[9px] uppercase font-bold">
                  {decodeDescription(viewItem).status}
                </span>

                {/* Image preview frame */}
                <div className="w-20 h-20 rounded-xl border overflow-hidden mt-4 bg-white flex items-center justify-center shadow-sm">
                  {viewItem.image || decodeDescription(viewItem).image ? (
                    <img src={viewItem.image || decodeDescription(viewItem).image} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={28} className="text-slate-350" />
                  )}
                </div>

                {/* Barcode lines */}
                <div className="w-full max-w-[200px] mt-4 p-2.5 bg-white border border-slate-200 rounded-lg flex flex-col items-center">
                  {/* Visual SVG representation of barcodes */}
                  <svg className="w-full h-11" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <rect x="0" y="0" width="3" height="30" fill="black" />
                    <rect x="5" y="0" width="1" height="30" fill="black" />
                    <rect x="8" y="0" width="2" height="30" fill="black" />
                    <rect x="12" y="0" width="4" height="30" fill="black" />
                    <rect x="18" y="0" width="1" height="30" fill="black" />
                    <rect x="21" y="0" width="3" height="30" fill="black" />
                    <rect x="26" y="0" width="2" height="30" fill="black" />
                    <rect x="30" y="0" width="1" height="30" fill="black" />
                    <rect x="33" y="0" width="5" height="30" fill="black" />
                    <rect x="40" y="0" width="2" height="30" fill="black" />
                    <rect x="44" y="0" width="1" height="30" fill="black" />
                    <rect x="47" y="0" width="3" height="30" fill="black" />
                    <rect x="52" y="0" width="2" height="30" fill="black" />
                    <rect x="56" y="0" width="4" height="30" fill="black" />
                    <rect x="62" y="0" width="1" height="30" fill="black" />
                    <rect x="65" y="0" width="3" height="30" fill="black" />
                    <rect x="70" y="0" width="2" height="30" fill="black" />
                    <rect x="74" y="0" width="1" height="30" fill="black" />
                    <rect x="77" y="0" width="5" height="30" fill="black" />
                    <rect x="84" y="0" width="3" height="30" fill="black" />
                    <rect x="89" y="0" width="1" height="30" fill="black" />
                    <rect x="92" y="0" width="2" height="30" fill="black" />
                    <rect x="96" y="0" width="4" height="30" fill="black" />
                  </svg>
                  <span className="font-mono text-[9px] text-slate-800 font-extrabold mt-1 tracking-widest">{decodeDescription(viewItem).barcode || '89010293847'}</span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{viewItem.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {viewItem.sku} | Brand: {decodeDescription(viewItem).brand || 'StockerAI'}</p>
                </div>
              </div>

              {/* Data specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Selling Price</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 block">₹{viewItem.price?.selling?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Profit</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-450 mt-0.5 block">₹{((viewItem.price?.selling || 0) - (viewItem.price?.cost || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => { window.print(); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-755 text-white font-extrabold py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  Print Label card
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-2.5 rounded-xl text-xs transition border dark:border-slate-700"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* QR CODE OVERLAY MODAL */}
      {showQrModal && qrItem && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-center`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-800 text-left">
              <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white">QR Identification Tag</h2>
              <button onClick={() => setShowQrModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate">{qrItem.name}</p>
            <p className="text-[9.5px] text-slate-400 mt-0.5">SKU: {qrItem.sku}</p>

            <div className="my-6 flex flex-col items-center gap-4 justify-center">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                <div dangerouslySetInnerHTML={{ __html: getQrSVG(`${qrItem.sku}-${decodeDescription(qrItem).barcode || 'BAR'}`) }} className="w-36 h-36" />
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-2xl w-full max-w-[260px] shadow-sm">
                <div dangerouslySetInnerHTML={{ __html: getBarcodeSVG(qrItem.sku) }} className="w-full h-auto" />
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-105 dark:bg-slate-850 px-3 py-1 rounded select-none">
              {decodeDescription(qrItem).barcode || 'BARCODE-UPC'}
            </span>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => { showToast('QR Identification Tag queued to label printer.', 'success'); setShowQrModal(false); }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                Print Label
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CATEGORY EDIT MODAL */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white">Bulk Apply Category</h2>
              <button onClick={() => setShowBulkEditModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-450 mb-1.5">Select New Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                  }`}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleBulkCategoryChange(bulkCategory)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Apply Category
                </button>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up text-left`}>
            <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white">Import Products CSV</h2>
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
                    ? 'border-blue-500 bg-blue-55/20 dark:bg-blue-950/20' 
                    : isDark ? 'border-slate-800 hover:border-slate-750 bg-slate-850/20' : 'border-slate-202 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <Upload className="mx-auto text-slate-400 w-8 h-8 mb-2 animate-bounce" />
                <p className="text-[11px] font-bold text-slate-705 dark:text-white">
                  Drag and drop your spreadsheet .csv file here
                </p>
                <p className="text-[9.5px] text-slate-450 mt-1 mb-3">or browse locally from device</p>
                
                <input
                  type="file"
                  accept=".csv"
                  id="csv-file-input"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImportCsvFile(e.target.files[0]);
                      addNotification(`Loaded file: ${e.target.files[0].name}`, 'info');
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
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
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow"
                >
                  Import Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT CATALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border-slate-200 text-gray-800 shadow-slate-200/50'} rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-up text-left max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-105 dark:border-slate-800">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-905 dark:text-white">
                {editingId ? 'Edit Product Catalog' : 'Add Catalog Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {draftLoaded && (
              <div className="bg-blue-50 dark:bg-blue-955/20 border border-blue-105 dark:border-blue-900/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-3.5 animate-fade-in select-none">
                <span>Loaded unsaved draft from auto-save.</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('product_form_draft');
                    setDraftLoaded(false);
                    if (editingId) {
                      const item = products.find(p => p._id === editingId);
                      if (item) handleEditClick(item);
                    } else {
                      setFormData({
                        name: '', sku: '', description: '', category: 'Electronics',
                        costPrice: 0, sellingPrice: 0, supplier: '', brand: 'StockerAI Premium',
                        barcode: '', status: 'Active'
                      });
                    }
                  }}
                  className="text-red-500 hover:text-red-700 underline text-[10px] uppercase font-black animate-pulse"
                >
                  Discard
                </button>
              </div>
            )}

            <div className="space-y-3.5 text-xs font-semibold">
              
              {/* Product Photo Drag and Drop Uploader */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Product Image</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition select-none relative flex flex-col items-center justify-center min-h-[90px] ${
                    isDragOver ? 'border-blue-500 bg-blue-50/15' : isDark ? 'border-slate-800 bg-slate-850 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setFormData(prev => ({ ...prev, image: ev.target.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => document.getElementById('product-image-uploader-file-input').click()}
                >
                  <input 
                    type="file" 
                    id="product-image-uploader-file-input" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setFormData(prev => ({ ...prev, image: ev.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {formData.image ? (
                    <div className="w-full flex items-center gap-3 text-left">
                      <div className="w-14 h-14 rounded-xl border overflow-hidden bg-white shadow-xs">
                        <img src={formData.image} alt="Upload preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Photo Selected</p>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                          className="mt-1.5 text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-[10px] font-bold text-slate-550 dark:text-slate-350 leading-none">Drop image file or click to browse</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Laser Sensor"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SKU Code *</label>
                    <button
                      type="button"
                      onClick={generateSKU}
                      className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Generate SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-LS-109"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Category</label>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Brand Name</label>
                    <button
                      type="button"
                      onClick={handleAddNewBrand}
                      className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add New
                    </button>
                  </div>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {brandsList.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-855'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Barcode UPC</label>
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Generate Barcode
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 89010293847"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Catalog Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Warehouse & Unit & Variant Configuration Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Warehouse</label>
                  <select
                    value={formData.warehouse || 'WH-Alpha'}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className={`w-full px-2 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {warehousesList.map(wh => (
                      <option key={wh} value={wh}>{wh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Base Unit</label>
                  <select
                    value={formData.unit || 'pcs'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={`w-full px-2 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {unitsList.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Variant</label>
                  <input
                    type="text"
                    value={formData.variants || 'Standard'}
                    onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                    placeholder="Standard / V1"
                    className={`w-full px-2 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Primary Supplier</label>
                <select
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">No supplier mapped</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Catalog details, specs, bounds..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-200 text-slate-805'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveProduct}
                  className="w-full bg-blue-600 hover:bg-blue-750 text-white font-extrabold py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  Save Product Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT DRAWER FOR PRODUCT DETAILS */}
      {showDetailDrawer && drawerItem && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setShowDetailDrawer(false)}
          />
          <div 
            className={`fixed top-0 right-0 h-screen w-full max-w-sm z-[120] shadow-2xl border-l flex flex-col transition-all duration-300 animate-slide-left text-left ${
              isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-800 shadow-slate-350/40'
            }`}
          >
            {/* Drawer Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-405 block tracking-widest leading-none">Catalog Info</span>
                <p className="text-sm font-black truncate max-w-[240px] mt-1.5">{drawerItem.name}</p>
              </div>
              <button 
                onClick={() => setShowDetailDrawer(false)}
                className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Product Photo */}
              <div className={`w-full h-40 rounded-xl border flex items-center justify-center overflow-hidden relative shadow-inner group ${
                isDark ? 'bg-slate-850/50 border-slate-800' : 'bg-slate-50 border-slate-150'
              }`}>
                {drawerItem.image || decodeDescription(drawerItem).image ? (
                  <img 
                    src={drawerItem.image || decodeDescription(drawerItem).image} 
                    alt={drawerItem.name} 
                    className="w-full h-full object-cover transition transform group-hover:scale-105" 
                  />
                ) : (
                  <div className="text-center space-y-1 p-4 select-none">
                    <Package size={32} className="mx-auto text-slate-350 dark:text-slate-650" />
                    <p className="text-[10px] font-bold text-slate-400">No Image Preview</p>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-wide">
                  {drawerItem.category}
                </div>
              </div>

              {/* Core Parameters */}
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">SKU Code</span>
                  <code className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-200 bg-slate-105 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {drawerItem.sku}
                  </code>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Brand Label</span>
                  <span className="text-xs font-extrabold">{decodeDescription(drawerItem).brand || 'StockerAI Premium'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Catalog Status</span>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border mt-1 ${
                    decodeDescription(drawerItem).status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20' :
                    decodeDescription(drawerItem).status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20' :
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      decodeDescription(drawerItem).status === 'Active' ? 'bg-emerald-500' :
                      decodeDescription(drawerItem).status === 'Draft' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    {decodeDescription(drawerItem).status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cost Price</span>
                    <span className="text-xs font-black">₹{drawerItem.price?.cost?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Selling Price</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">₹{drawerItem.price?.selling?.toLocaleString() || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Current Stock</span>
                    <span className={`text-xs font-extrabold ${
                      (drawerItem.stock?.current || 0) <= (drawerItem.stock?.minimum || 10) ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'
                    }`}>{drawerItem.stock?.current || 0} left</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Alert Threshold</span>
                    <span className="text-xs font-extrabold">{drawerItem.stock?.minimum || 10} minimum</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Mapped Supplier</span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    {suppliers.find(s => s._id === drawerItem.supplier)?.name || 'Local Supplier'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Warehouse</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{decodeDescription(drawerItem).warehouse || 'WH-Alpha'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Unit</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{decodeDescription(drawerItem).unit || 'pcs'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Variant</span>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{decodeDescription(drawerItem).variants || 'Standard'}</span>
                  </div>
                </div>

                {decodeDescription(drawerItem).barcode && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">UPC Barcode</span>
                    <span className="font-mono text-xs text-slate-500">{decodeDescription(drawerItem).barcode}</span>
                  </div>
                )}

                {decodeDescription(drawerItem).desc && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Description</span>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 mt-1">{decodeDescription(drawerItem).desc}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className={`p-4 border-t flex gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => { setShowDetailDrawer(false); handleEditClick(drawerItem); }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition"
              >
                Edit Template
              </button>
              <button
                onClick={() => { setShowDetailDrawer(false); askConfirm({ title: 'Delete Product', message: `Are you sure you want to delete "${drawerItem.name}"? This action cannot be undone and will permanently erase this record.`, type: 'danger', confirmText: 'Delete', onConfirm: () => handleDeleteProduct(drawerItem._id) }); }}
                className="px-3 py-2 bg-red-600/10 hover:bg-red-605/20 text-red-600 font-extrabold rounded-xl text-xs transition"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Fallback Mock Datasets
function getMockProducts() {
  return [
    { _id: '1', sku: 'SKU-EL-941', name: 'Laser Proximity Sensor', category: 'Electronics', price: { cost: 450, selling: 890 }, stock: { current: 15, minimum: 5 }, description: '{"desc":"Laser trigger sensor.","brand":"StockerAI Premium","barcode":"890941829","status":"Active","warehouse":"WH-Alpha","unit":"pcs","variants":"Standard"}', createdAt: '2026-07-10T10:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z' },
    { _id: '2', sku: 'SKU-HW-102', name: 'Alloy Bracket Mounts', category: 'Hardware', price: { cost: 80, selling: 150 }, stock: { current: 120, minimum: 20 }, description: '{"desc":"Alloy steel bracket structures.","brand":"Acme Corp","barcode":"890102738","status":"Active","warehouse":"WH-Beta","unit":"units","variants":"Reinforced"}', createdAt: '2026-07-11T11:00:00.000Z', updatedAt: '2026-07-15T09:00:00.000Z' },
    { _id: '3', sku: 'SKU-EL-309', name: 'OLED Display Modules', category: 'Electronics', price: { cost: 240, selling: 480 }, stock: { current: 3, minimum: 10 }, description: '{"desc":"OLED modules for panels.","brand":"StockerAI Premium","barcode":"890309182","status":"Active","warehouse":"WH-Alpha","unit":"pcs","variants":"Standard"}', createdAt: '2026-07-12T12:00:00.000Z', updatedAt: '2026-07-16T10:30:00.000Z' },
    { _id: '4', sku: 'SKU-FD-029', name: 'Dehydrated Ration Packs', category: 'Food', price: { cost: 12, selling: 25 }, stock: { current: 50, minimum: 15 }, description: '{"desc":"Ration packs.","brand":"Nexus Goods","barcode":"890029881","status":"Active","warehouse":"Central Depot","unit":"packs","variants":"Standard"}', createdAt: '2026-07-13T10:30:00.000Z', updatedAt: '2026-07-14T02:00:00.000Z' },
    { _id: '5', sku: 'SKU-CL-808', name: 'Cleanroom Cotton Coveralls', category: 'Clothing', price: { cost: 55, selling: 120 }, stock: { current: 25, minimum: 5 }, description: '{"desc":"Cleanroom overalls.","brand":"Acme Corp","barcode":"890808129","status":"Active","warehouse":"WH-Gamma","unit":"boxes","variants":"XL"}', createdAt: '2026-07-14T02:00:00.000Z', updatedAt: '2026-07-15T11:45:00.000Z' }
  ];
}

function getMockSuppliers() {
  return [
    { _id: 's1', name: 'Tech Components Ltd', code: 'SUP-TECH', email: 'sales@techcomponents.com', phone: '+91 98765 09281', address: { city: 'New Delhi' } },
    { _id: 's2', name: 'Acme Metalworks Ltd', code: 'SUP-ACME', email: 'orders@acmesteel.com', phone: '+91 88772 10928', address: { city: 'Bangalore' } }
  ];
}
