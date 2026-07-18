import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap,
  Cloud,
  Sparkles,
  ArrowUpRight,
  Star,
  Play,
  Users,
  Building2,
  Lock,
  RefreshCw,
  Globe,
  Database,
  Sun,
  Moon
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // FAQ Data
  const faqs = [
    {
      q: "How does StockerAI Enterprise optimize stock levels?",
      a: "StockerAI analyzes historic transaction data and uses machine learning models to forecast future product demand, automatically recommending optimal safety stock levels and reorder thresholds."
    },
    {
      q: "Can I connect my existing sales platforms?",
      a: "Yes. StockerAI supports seamless integrations with major e-commerce backends, ERPs, and custom databases via our secure REST API and built-in webhook connectors."
    },
    {
      q: "What security frameworks do you deploy?",
      a: "We implement AES-256 bank-grade data encryption, granular role-based access control (RBAC), secure HTTPS channels, and complete tenant database isolation for enterprise clients."
    },
    {
      q: "How do low-stock alerts notify my team?",
      a: "When inventory levels drop below configured safety limits, StockerAI triggers real-time alerts on your main control panel and dispatches immediate automated notifications to your custom email or Slack integrations."
    }
  ];

  // Features Data
  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      desc: "Organize thousands of products with custom variations, batch processing, and nested categories in a sleek central repository."
    },
    {
      icon: RefreshCw,
      title: "Real-Time Stock Tracking",
      desc: "Sync stock adjustments automatically across multiple geographic warehouses and prevent double-selling instantly."
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      desc: "Examine beautiful revenue streams, cost ratios, and product profitability dashboards with custom date range filters."
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      desc: "Harness predictive demand modeling and smart replenishment cues that help eliminate overstocking.",
      comingSoon: true
    },
    {
      icon: AlertCircle,
      title: "Low Stock Alerts",
      desc: "Configure automated notification rules and guard your supply chain against sudden vendor stockouts."
    },
    {
      icon: Shield,
      title: "Secure Cloud Access",
      desc: "Experience fully protected workspaces, reliable Google OAuth configurations, and ironclad security standards."
    }
  ];

  // Advantage stats data
  const advantages = [
    { value: "45%", label: "Average Stockout Reduction" },
    { value: "18.4hr", label: "Saved Weekly per Manager" },
    { value: "99.99%", label: "Uptime SLA Guarantee" },
    { value: "3.5x", label: "Faster Purchase Order Processing" }
  ];

  // Testimonials Data
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "VP of Supply Chain",
      company: "Apex Global",
      quote: "Implementing StockerAI Enterprise reduced our warehouse discrepancy rates to practically zero. The automatic safety stock calculator saved us hundreds of thousands in capital.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "David Miller",
      role: "Operations Director",
      company: "LogiSwift Logistics",
      quote: "Before StockerAI, our team was buried in manual spreadsheets. Now, we coordinate low stock actions across four facilities in a single responsive pane. Simply brilliant.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Aisha Rahman",
      role: "Procurement Manager",
      company: "RetailFlow Commerce",
      quote: "The interface is exceptionally clean, but the true value lies under the hood. AI insights helped us prepare for holiday peaks three weeks earlier than previous years.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ];

  // Helper function to smooth scroll to a section ID
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen selection:bg-blue-600 selection:text-white font-sans antialiased transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-10 w-[40vw] h-[40vh] rounded-full bg-cyan-400/5 blur-[120px] pointer-events-none z-0"></div>

      {/* 1. Premium Sticky Navigation Bar */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Package size={20} className="animate-pulse" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 ${isDark ? 'via-slate-200 to-white' : 'via-slate-800 to-slate-900'} bg-clip-text text-transparent tracking-tight`}>
              StockerAI<span className="text-blue-600 font-medium">.</span>
            </span>
            <span className={`hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${isDark ? 'bg-slate-900 border-blue-900/40 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
              Enterprise
            </span>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className={`text-sm font-medium hover:text-blue-600 transition ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Home</button>
            <button onClick={() => scrollToSection('features')} className={`text-sm font-medium hover:text-blue-600 transition ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Features</button>
            <div className="relative group flex items-center gap-1.5 cursor-pointer">
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Pricing</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${isDark ? 'bg-slate-850 border-slate-750 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>Soon</span>
            </div>
            <button onClick={() => scrollToSection('why-us')} className={`text-sm font-medium hover:text-blue-600 transition ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>About</button>
            <button onClick={() => scrollToSection('faq')} className={`text-sm font-medium hover:text-blue-600 transition ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>FAQ</button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition hover:scale-105 active:scale-95 ${
                isDark ? 'bg-slate-850 border-slate-750 text-yellow-400 hover:bg-slate-800' : 'bg-slate-105 border-slate-200 text-slate-500 hover:bg-slate-150'
              }`}
              title="Toggle Color Theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 shadow-md shadow-blue-600/10 transition"
              >
                Go to Dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold hover:text-blue-600 transition ${isDark ? 'text-slate-305' : 'text-slate-600'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 shadow-md shadow-blue-600/10 transition"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger menu toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="px-4 py-6 space-y-4 flex flex-col">
                <button onClick={() => scrollToSection('home')} className={`text-left font-medium hover:text-blue-600 py-1 transition ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Home</button>
                <button onClick={() => scrollToSection('features')} className={`text-left font-medium hover:text-blue-600 py-1 transition ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Features</button>
                <div className="flex items-center gap-2 text-left font-medium text-slate-400 py-1">
                  <span>Pricing</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${isDark ? 'bg-slate-850 border-slate-750 text-slate-450' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>Coming Soon</span>
                </div>
                <button onClick={() => scrollToSection('why-us')} className={`text-left font-medium hover:text-blue-600 py-1 transition ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>About</button>
                <button onClick={() => scrollToSection('faq')} className={`text-left font-medium hover:text-blue-600 py-1 transition ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>FAQ</button>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              The Intelligent Operating System for{' '}
              <span className={`bg-gradient-to-r ${isDark ? 'from-blue-400 via-blue-300 to-cyan-300' : 'from-blue-600 to-cyan-500'} bg-clip-text text-transparent`}>
                Enterprise Inventory
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-base sm:text-lg max-w-[650px] mx-auto font-normal leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Automate global catalog alignment, forecast product demand, resolve supplier reconciliation, and sync orders seamlessly in one high-performance dashboard.
            </motion.p>

            {/* Hero CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 group"
                >
                  Enter Control Panel
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <button
                onClick={() => {
                  scrollToSection('dashboard-preview');
                  setIsDemoPlaying(true);
                }}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold border shadow-sm transition flex items-center justify-center gap-2 ${
                  isDark ? 'bg-slate-900 border-slate-805 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Play size={16} className="text-blue-600 fill-blue-600" />
                Watch Dashboard Live
              </button>
            </motion.div>
          </div>

          {/* Interactive Floating elements & Product Preview wrapper */}
          <div className="relative mt-16 md:mt-20 max-w-5xl mx-auto">
            {/* Ambient gradients underneath preview */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4/5 h-1/2 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none z-0"></div>

            {/* Floating Card 1 - AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute left-[-20px] top-[15%] z-20 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200/80 p-4.5 rounded-2xl shadow-xl max-w-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-500 flex-shrink-0">
                <AlertCircle size={20} className="animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Stock Alert</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Low inventory on 14 main products. Restock required.</p>
              </div>
            </motion.div>

            {/* Floating Card 2 - Sales Value */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: -30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute right-[-40px] bottom-[25%] z-20 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200/80 p-4.5 rounded-2xl shadow-xl max-w-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Monthly Operations</p>
                <p className="text-[11px] text-slate-500 mt-0.5">₹4,89,500 total valuation. Up 15% this quarter.</p>
              </div>
            </motion.div>

            {/* Main Interactive Browser Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              id="dashboard-preview"
              className="relative z-10 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              {/* Browser Window Chrome header */}
              <div className="h-11 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div className="w-2/3 sm:w-1/2 h-6.5 rounded-md bg-white border border-slate-200/70 text-[10.5px] text-slate-400 flex items-center justify-center gap-1.5 select-none font-medium font-sans">
                  <Lock size={10} className="text-slate-400" />
                  stockerai-enterprise.com/dashboard
                </div>
                <div className="w-10"></div>
              </div>

              {/* Mock Dashboard Layout */}
              <div className="p-4 sm:p-6 bg-slate-50 flex gap-6 min-h-[420px] select-none text-left">
                {/* Mock Sidebar (Desktop view) */}
                <div className="hidden md:flex flex-col gap-5 w-44 bg-white border border-slate-200/60 rounded-xl p-4.5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                      <Package size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">StockerAI</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="text-[11.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg flex items-center gap-2">
                      <LayoutMockIcon active />
                      Overview
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-500 px-2 py-1 flex items-center gap-2">
                      <LayoutMockIcon />
                      Inventory
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-500 px-2 py-1 flex items-center gap-2">
                      <LayoutMockIcon />
                      Suppliers
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-500 px-2 py-1 flex items-center gap-2">
                      <LayoutMockIcon />
                      Orders
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-500 px-2 py-1 flex items-center gap-2">
                      <LayoutMockIcon />
                      Analytics
                    </div>
                  </div>
                </div>

                {/* Dashboard Main Content area */}
                <div className="flex-1 space-y-6">
                  {/* Dashboard Header Mock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Control Panel Overview</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Real-time valuation metrics and stock statistics</p>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                      Live Sync Active
                    </span>
                  </div>

                  {/* 4 Stats Cards Grid Mock */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-xs">
                      <div className="text-[10px] font-semibold text-slate-400">Total Products</div>
                      <div className="text-base font-bold text-slate-800 mt-1">12,450</div>
                      <div className="text-[9px] text-emerald-500 font-bold mt-1">+12% vs last mo</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-xs">
                      <div className="text-[10px] font-semibold text-slate-400">Active Suppliers</div>
                      <div className="text-base font-bold text-slate-800 mt-1">148</div>
                      <div className="text-[9px] text-emerald-500 font-bold mt-1">+5% vs last mo</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-xs">
                      <div className="text-[10px] font-semibold text-slate-400">Pending Orders</div>
                      <div className="text-base font-bold text-slate-800 mt-1">34</div>
                      <div className="text-[9px] text-blue-500 font-bold mt-1">8 processing</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-3.5 rounded-xl shadow-xs">
                      <div className="text-[10px] font-semibold text-slate-400">Monthly Revenue</div>
                      <div className="text-base font-bold text-slate-800 mt-1">₹4.89M</div>
                      <div className="text-[9px] text-emerald-500 font-bold mt-1">+15.4% increase</div>
                    </div>
                  </div>

                  {/* Chart and Ring Gauge Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* SVG Line/Area Chart Mock */}
                    <div className="lg:col-span-2 bg-white border border-slate-200/60 p-4.5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Revenue Operations</h4>
                          <p className="text-[9px] text-slate-400">Monthly Sales vs Purchase valuation</p>
                        </div>
                        <div className="flex gap-3 text-[9px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Sales</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>Purchases</span>
                        </div>
                      </div>
                      <div className="h-32 w-full relative">
                        {/* Custom SVG line chart */}
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                          
                          {/* Area path for Purchases */}
                          <path d="M 0,90 Q 50,75 100,82 T 200,60 T 300,45 L 300,100 L 0,100 Z" fill="url(#purchGrad)" />
                          <path d="M 0,90 Q 50,75 100,82 T 200,60 T 300,45" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Area path for Sales */}
                          <path d="M 0,80 Q 50,55 100,65 T 200,40 T 300,20 L 300,100 L 0,100 Z" fill="url(#salesGrad)" />
                          <path d="M 0,80 Q 50,55 100,65 T 200,40 T 300,20" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                          
                          {/* Tooltip Dot */}
                          <circle cx="200" cy="40" r="4" fill="#2563EB" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: '200px 40px', animationDuration: '2s' }} />
                          <circle cx="200" cy="40" r="3.5" fill="#2563EB" stroke="#ffffff" strokeWidth="1.5" />
                        </svg>
                        {/* Month labels */}
                        <div className="flex justify-between text-[8px] text-slate-400 mt-2 font-semibold">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Health Ring Mock */}
                    <div className="bg-white border border-slate-200/60 p-4.5 rounded-xl shadow-xs flex flex-col justify-between items-center text-center">
                      <div className="w-full text-left">
                        <h4 className="text-xs font-bold text-slate-900">Health Index</h4>
                        <p className="text-[8.5px] text-slate-400 mt-0.5">Overall stock metrics status</p>
                      </div>

                      {/* SVG Gauge */}
                      <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14.5" stroke="#f1f5f9" strokeWidth="2.8" fill="transparent" />
                          <circle
                            cx="18" cy="18" r="14.5"
                            stroke="url(#gaugeAccent)"
                            strokeWidth="2.8"
                            fill="transparent"
                            strokeDasharray="91"
                            strokeDashoffset="7.5"
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="gaugeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2563EB" />
                              <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-[17px] font-extrabold tracking-tight text-slate-800">92%</span>
                          <span className="text-[7.5px] font-bold text-emerald-500 uppercase tracking-wide">Excellent</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 font-medium">1,145 products safely above safety limits</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Trusted by Companies Section */}
      <section className="py-8 bg-white border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-6">
            Trusted by fast-scaling enterprise teams globally
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center opacity-45 hover:opacity-60 transition duration-300">
            <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900 text-sm tracking-tight cursor-default select-none">
              <Building2 size={16} className="text-slate-500" />
              STRIPE
            </div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900 text-sm tracking-tight cursor-default select-none">
              <Zap size={16} className="text-slate-500" />
              LINEAR
            </div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900 text-sm tracking-tight cursor-default select-none">
              <Sparkles size={16} className="text-slate-500" />
              NOTION
            </div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900 text-sm tracking-tight cursor-default select-none">
              <Cloud size={16} className="text-slate-500" />
              VERCEL
            </div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-slate-900 text-sm tracking-tight cursor-default select-none">
              <Globe size={16} className="text-slate-500" />
              AWS
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid Section */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for the needs of modern retail networks
            </p>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              A comprehensive toolkit tailored to handle high-volume warehouse flows, inventory alerts, and transaction records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm hover:shadow-md transition relative overflow-hidden group cursor-default"
              >
                {/* Glow accent effect */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 blur-xl transition duration-300"></div>

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <feature.icon size={22} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition duration-200">
                    {feature.title}
                  </h3>
                  {feature.comingSoon && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 animate-pulse">
                      Soon
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose StockerAI Section (Product stats/advantages) */}
      <section id="why-us" className="py-16 md:py-24 bg-white border-t border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col - Context */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">
                Operational Uptime
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Engineered for maximum reliability and visibility
              </h3>
              <p className="text-slate-500 text-base leading-relaxed">
                StockerAI Enterprise supports heavy catalog loads with automated cloud updates, ensuring management stays synchronized at all times.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5.5 h-5.5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Granular Role RBAC</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Control view, edit, and manager capabilities with strict permission gates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5.5 h-5.5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Double-Entry Ledger</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Track audit trails on every stock subtraction or catalog adjustment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5.5 h-5.5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Universal Search Filter</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Query across warehouse, supplier, or tracking SKU parameters in milliseconds.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Stats Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
              {advantages.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl space-y-2 select-none hover:bg-slate-100/50 transition">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide leading-tight">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials Section */}
      <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">
              Success Stories
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Endorsed by operations leaders
            </p>
            <p className="text-slate-500 text-sm sm:text-base">
              See how supply chain managers and business founders elevate their daily visibility using StockerAI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 p-7.5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-sm transition"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(test.rating)].map((_, idx) => (
                      <Star key={idx} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic font-normal">
                    "{test.quote}"
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3.5 pt-6 mt-6 border-t border-slate-100">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{test.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {test.role}, <span className="text-blue-600 font-bold">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section id="faq" className="py-16 md:py-24 bg-white border-t border-slate-200/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase font-extrabold text-blue-600 tracking-widest">
              Got Questions?
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
            <p className="text-slate-500 text-sm sm:text-base">
              Everything you need to know about setting up, securing, and integrating StockerAI Enterprise.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition bg-white"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-slate-950 focus:outline-none transition select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 text-white relative overflow-hidden">
        {/* Glow rings in CTA */}
        <div className="absolute top-[-30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-[90px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[90px] pointer-events-none z-0"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6 md:space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Elevate Your Operations Integrity Today
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-base sm:text-lg opacity-90 leading-relaxed">
            Configure safety levels, organize catalogs, resolve orders, and experience smart replenishment. Join modern retail leaders on StockerAI Enterprise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-slate-50 shadow-lg transition flex items-center justify-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight size={17} />
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-slate-50 shadow-lg transition flex items-center justify-center gap-1.5"
              >
                Get Started Free
                <ArrowRight size={17} />
              </Link>
            )}
            <a
              href="mailto:support@stockerai.com"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold border border-white/40 bg-white/5 hover:bg-white/10 hover:border-white transition flex items-center justify-center"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* 10. Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Branding */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Package size={16} />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  StockerAI
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                StockerAI Enterprise coordinates smart catalog tracking, supplier records, and inventory analytics in one high-performance system.
              </p>
              <div className="flex gap-4.5 pt-2">
                <a href="#" className="hover:text-white transition text-xs font-semibold">Twitter</a>
                <a href="#" className="hover:text-white transition text-xs font-semibold">GitHub</a>
                <a href="#" className="hover:text-white transition text-xs font-semibold">LinkedIn</a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button></li>
                <li><span className="text-slate-600 cursor-default">Pricing (Soon)</span></li>
                <li><button onClick={() => scrollToSection('why-us')} className="hover:text-white transition">Benefits</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition">FAQ</button></li>
              </ul>
            </div>

            {/* Column 3: Security & Support */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="mailto:support@stockerai.com" className="hover:text-white transition">Support Helpdesk</a></li>
                <li><span className="text-slate-500">Uptime Status: 100%</span></li>
                <li><span className="text-slate-500">API Documentation</span></li>
                <li><span className="text-slate-500">Integrations Library</span></li>
              </ul>
            </div>

            {/* Column 4: Compliance */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-500 hover:text-white cursor-pointer transition">Privacy Policy</span></li>
                <li><span className="text-slate-500 hover:text-white cursor-pointer transition">Terms of Service</span></li>
                <li><span className="text-slate-500 hover:text-white cursor-pointer transition">GDPR Compliance</span></li>
                <li><span className="text-slate-500 hover:text-white cursor-pointer transition">SLA Agreement</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-600 font-medium">
              © {new Date().getFullYear()} StockerAI Enterprise. All rights reserved.
            </p>
            <div className="flex gap-6 text-[11px] text-slate-600 font-medium">
              <span className="hover:text-slate-400 cursor-pointer">Security Audited</span>
              <span className="hover:text-slate-400 cursor-pointer">ISO 27001</span>
              <span className="hover:text-slate-400 cursor-pointer">SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponent to mock menu item icons in the layout preview
function LayoutMockIcon({ active }) {
  return (
    <svg className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}
