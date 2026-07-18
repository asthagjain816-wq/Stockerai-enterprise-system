import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import useConfirmStore from '../store/confirmStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { handleRipple } from '../utils/ripple';
import AnimatedCounter from '../components/AnimatedCounter';
import HighlightText from '../components/HighlightText';
import EmptyState from '../components/EmptyState';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Edit, 
  Trash2,
  Download,
  Filter,
  DollarSign,
  UserCheck
} from 'lucide-react';

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Acme Corp", email: "info@acmecorp.com", phone: "+91 98765 43210", status: "Active", ltv: 75000, joined: "Jan 10, 2026", location: "Mumbai, MH" },
  { id: 2, name: "Globex Corporation", email: "billing@globex.com", phone: "+91 87654 32109", status: "Active", ltv: 120000, joined: "Feb 15, 2026", location: "Delhi, DL" },
  { id: 3, name: "Initech Industries", email: "support@initech.com", phone: "+91 76543 21098", status: "Inactive", ltv: 15000, joined: "Nov 04, 2025", location: "Bangalore, KA" },
  { id: 4, name: "Umbrella Corp", email: "order@umbrellacorp.com", phone: "+91 65432 10987", status: "Active", ltv: 45000, joined: "Mar 22, 2026", location: "Hyderabad, TS" },
  { id: 5, name: "Hooli Inc", email: "accounts@hooli.com", phone: "+91 54321 09876", status: "Active", ltv: 280000, joined: "Aug 14, 2025", location: "Pune, MH" },
  { id: 6, name: "Veer Trading Co", email: "veer@veertrading.in", phone: "+91 91234 56789", status: "Active", ltv: 32000, joined: "May 18, 2026", location: "Ahmedabad, GJ" },
  { id: 7, name: "Rohan Sharma Enterprises", email: "contact@rohansharma.in", phone: "+91 92345 67890", status: "Inactive", ltv: 8000, joined: "Apr 12, 2026", location: "Jaipur, RJ" }
];

export default function Customers() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const { isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const { askConfirm } = useConfirmStore();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add / edit
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [ltv, setLtv] = useState("");
  const [location, setLocation] = useState("");

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter & search customers list
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.location && customer.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === "All") return matchesSearch;
    if (filterStatus === "Active") return matchesSearch && customer.status === "Active";
    if (filterStatus === "Inactive") return matchesSearch && customer.status === "Inactive";
    if (filterStatus === "Preferred") return matchesSearch && customer.ltv >= 50000;
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === "Active").length;
  const inactiveCount = customers.filter(c => c.status === "Inactive").length;
  const preferredCount = customers.filter(c => c.ltv >= 50000).length;

  const handleOpenAddModal = () => {
    setModalType("add");
    setSelectedCustomer(null);
    setName("");
    setEmail("");
    setPhone("");
    setStatus("Active");
    setLtv("");
    setLocation("");
    setShowModal(true);
  };

  const handleOpenEditModal = (customer) => {
    setModalType("edit");
    setSelectedCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setStatus(customer.status);
    setLtv(customer.ltv.toString());
    setLocation(customer.location || "");
    setShowModal(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      showToast("Please fill in name, email, and phone contact.", "error");
      return;
    }

    if (modalType === "add") {
      const newCustomer = {
        id: Date.now(),
        name,
        email,
        phone,
        status,
        ltv: Number(ltv) || 0,
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        location
      };
      setCustomers([newCustomer, ...customers]);
      showToast("New customer profile added successfully.", "success");
    } else {
      setCustomers(customers.map(c => c.id === selectedCustomer.id 
        ? { ...c, name, email, phone, status, ltv: Number(ltv) || 0, location } 
        : c
      ));
      showToast("Customer profile updated successfully.", "success");
    }
    setShowModal(false);
  };

  const handleDeleteClick = (customer) => {
    askConfirm({
      title: 'De-register Customer',
      message: `Are you sure you want to deactivate and remove customer profile "${customer.name}"? This action will archive historical transaction logs.`,
      confirmText: 'De-register',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        setCustomers(customers.filter(c => c.id !== customer.id));
        showToast(`Customer "${customer.name}" de-registered successfully.`, "warning");
      }
    });
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      showToast("No customer database found to export.", "error");
      return;
    }
    const headers = ["Customer ID", "Name", "Email", "Phone", "Status", "LTV (₹)", "Joined", "Location"];
    const rows = customers.map(c => [c.id, c.name, c.email, c.phone, c.status, c.ltv, c.joined, c.location]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StockerAI_Customer_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Customer contact sheet exported to CSV.", "success");
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-6">
          {/* Header Region */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <Breadcrumbs />
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-blue-50 text-blue-600 dark:bg-slate-900 dark:text-blue-400 px-2.5 py-0.8 rounded-full border border-blue-100 dark:border-blue-900/30">
                  Relationship Hub
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
                Customers Directory
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Audit corporate buyers, track lifetime trade value (LTV), edit contact files, and export active customer metrics.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button
                onClick={handleExportCSV}
                className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isDark ? 'bg-slate-900 border-slate-805 hover:bg-slate-800 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Download size={13} />
                Export Sheet
              </button>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus size={14} />
                Add Customer
              </button>
            </div>
          </div>

          {/* KPI Summary Cards Grid */}
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
                {/* Total Customers */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus("All"); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'All' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      <AnimatedCounter value={totalCustomers} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>

                {/* Active Accounts */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus("Active"); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Active' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
                    <span className="text-xl font-black text-emerald-600">
                      <AnimatedCounter value={activeCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserCheck size={16} />
                  </div>
                </div>

                {/* Inactive Accounts */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus("Inactive"); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Inactive' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inactive Accounts</span>
                    <span className="text-xl font-black text-slate-400">
                      <AnimatedCounter value={inactiveCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-555 flex items-center justify-center">
                    <XCircle size={16} />
                  </div>
                </div>

                {/* Preferred Customers */}
                <div 
                  onClick={(e) => { handleRipple(e); setFilterStatus("Preferred"); }}
                  className={`kpi-card kpi-card-interactive p-4 rounded-xl border flex items-center justify-between ${
                    filterStatus === 'Preferred' 
                      ? 'kpi-card-selected ' + (isDark ? 'bg-slate-900' : 'bg-blue-50/10')
                      : (isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800')
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Buyers</span>
                    <span className="text-xl font-black text-amber-500">
                      <AnimatedCounter value={preferredCount} />
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-550 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Table Filters */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800/80 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              
              {/* Search bar input container */}
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-805 text-white placeholder-slate-550 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Status indicator info tag */}
              <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Filter size={12} />
                Status: <span className="px-2.5 py-0.8 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">{filterStatus}</span>
              </div>
            </div>

            {/* Customers Data Table */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/40 dark:border-slate-800/85">
              <table className="w-full text-left">
                <thead>
                  <tr className={isDark ? 'bg-slate-950/70' : 'bg-slate-50'}>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Client Name</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Contact Info</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">LTV Revenue</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, idx) => <SkeletonRow key={idx} cols={5} />)
                  ) : paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState 
                          title="No Customers Match Search Criteria"
                          description="Refine your contact queries or select another dashboard filter metric."
                          onClear={() => { setSearchQuery(""); setFilterStatus("All"); }}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-200/50 dark:border-slate-800/80">
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                          <HighlightText text={customer.name} query={searchQuery} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <HighlightText text={customer.email} query={searchQuery} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            <HighlightText text={customer.location} query={searchQuery} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white">
                          ₹{customer.ltv.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {customer.joined}
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <span className={`px-2.5 py-0.8 rounded-full text-[10px] font-bold border ${
                            customer.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900/30'
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(customer)}
                              className={`p-1.5 rounded-lg border transition ${
                                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer)}
                              className={`p-1.5 rounded-lg border transition ${
                                isDark ? 'bg-slate-900 border-slate-800 hover:bg-red-950/20 text-red-500 hover:text-red-400' : 'bg-white border-slate-200 hover:bg-red-50 text-red-500'
                              }`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/60 pt-4 mt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Showing <span className="font-bold text-slate-800 dark:text-white">{startIndex + 1}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredCustomers.length}</span> clients
                </div>
                
                <div className="flex items-center gap-1 text-xs">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 transition font-bold"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl font-extrabold transition ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
                          : 'border hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 transition font-bold"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE & EDIT CUSTOMER DIALOG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-805 text-white shadow-black/40' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-base font-extrabold uppercase tracking-wide mb-4">
              {modalType === 'add' ? 'Register Customer Profile' : 'Modify Customer File'}
            </h2>
            
            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Client Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    isDark ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-5 transition'
                  }`}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                      isDark ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-5 transition'
                    }`}
                    placeholder="name@company.com"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                      isDark ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-5 transition'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                      isDark ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-5 transition'
                    }`}
                    placeholder="e.g. Delhi, DL"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 tracking-wider">LTV Sales Value (₹)</label>
                  <input
                    type="number"
                    value={ltv}
                    onChange={(e) => setLtv(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                      isDark ? 'bg-slate-950 border-slate-805 text-white' : 'bg-slate-5 transition'
                    }`}
                    placeholder="e.g. 75000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-400 tracking-wider">Account status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    isDark ? 'bg-slate-950 border-slate-850 text-white font-bold' : 'bg-slate-5 transition font-bold'
                  }`}
                >
                  <option value="Active">Active Profile</option>
                  <option value="Inactive">Inactive Profile</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow"
                >
                  {modalType === 'add' ? 'Create Profile' : 'Save Details'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-2.5 border rounded-xl font-bold transition ${
                    isDark ? 'bg-slate-905 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
