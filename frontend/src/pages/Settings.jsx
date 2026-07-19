import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useToastStore from '../store/toastStore';
import useLanguageStore from '../store/languageStore';
import useConfirmStore from '../store/confirmStore';
import Breadcrumbs from '../components/Breadcrumbs';
import { SkeletonRow, SkeletonStats } from '../components/Skeleton';
import { 
  User, 
  Building, 
  Key, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Save, 
  Shield, 
  Check, 
  Mail, 
  AlertCircle,
  Laptop,
  Upload,
  Trash2,
  Database,
  ArrowDownToLine,
  RefreshCw,
  Sliders,
  Camera,
  Scissors,
  X,
  Phone,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, updateUser } = useAuthStore();
  const { theme, setTheme, isDark } = useThemeStore();
  const { showToast } = useToastStore();
  const { language, setLanguage } = useLanguageStore();
  const { askConfirm } = useConfirmStore();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 555);
    return () => clearTimeout(timer);
  }, []);
  
  // Baseline original user reference for rolling back changes on discard
  const [originalUser, setOriginalUser] = useState(user);

  // Synchronize activeTab state with query parameter ?tab=
  const getTabFromLocation = () => {
    const tabParam = new URLSearchParams(location.search).get('tab') || location.state?.tab;
    if (tabParam && ['profile', 'security', 'preferences', 'backup'].includes(tabParam)) {
      return tabParam;
    }
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromLocation());

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [location]);

  // Unsaved Changes Dirty State Tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  // Form Fields States
  const [fullName, setFullName] = useState(user?.fullName || 'Astha Sethiya');
  const [email, setEmail] = useState(user?.email || 'astha@stockerai.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [designation, setDesignation] = useState(user?.designation || 'Lead System Architect');
  const [company, setCompany] = useState(user?.company || 'StockerAI Enterprise');
  const [bio, setBio] = useState(user?.bio || 'Overseeing automated inventory pipelines, cloud warehouse allocations, and supply chain telemetry grids.');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [backupEmail, setBackupEmail] = useState(user?.backupEmail || localStorage.getItem('erp_backup_email') || '');

  // Crop configuration states
  const [tempImage, setTempImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [appName, setAppName] = useState('StockerAI Enterprise');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop');
  const [defaultWarehouse, setDefaultWarehouse] = useState('WH-Alpha');

  // Security Inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(true);

  // Notification toggles
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifySupplierUpdate, setNotifySupplierUpdate] = useState(false);

  // Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome on Windows (New Delhi)', status: 'Active Now', ip: '103.45.191.12' },
    { id: 2, device: 'Safari on iPhone 15 Pro (Mumbai)', status: 'Active 2h ago', ip: '103.88.201.55' }
  ]);

  // Track field changes to mark form dirty
  useEffect(() => {
    const hasAvatarChanged = avatar !== user?.avatar;
    const hasNameChanged = fullName !== (user?.fullName || 'Astha Sethiya');
    const hasEmailChanged = email !== (user?.email || 'astha@stockerai.com');
    const hasPhoneChanged = phone !== (user?.phone || '+91 98765 43210');
    const hasDesignationChanged = designation !== (user?.designation || 'Lead System Architect');
    const hasCompanyChanged = company !== (user?.company || 'StockerAI Enterprise');
    const hasBioChanged = bio !== (user?.bio || 'Overseeing automated inventory pipelines, cloud warehouse allocations, and supply chain telemetry grids.');
    const hasBackupEmailChanged = backupEmail !== (user?.backupEmail || localStorage.getItem('erp_backup_email') || '');
    
    if (
      hasAvatarChanged || 
      hasNameChanged || 
      hasEmailChanged || 
      hasPhoneChanged || 
      hasDesignationChanged || 
      hasCompanyChanged || 
      hasBioChanged || 
      hasBackupEmailChanged ||
      currentPassword || 
      newPassword
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [fullName, email, phone, designation, company, bio, avatar, backupEmail, currentPassword, newPassword, user]);

  // Image Upload & Drag-and-Drop handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, and WEBP formats are accepted.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result);
      setZoomScale(1.1);
      setRotationAngle(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

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
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, and WEBP formats are accepted.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result);
      setZoomScale(1.1);
      setRotationAngle(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    askConfirm({
      title: 'Remove Profile Photo',
      message: 'Are you sure you want to remove your profile photo? This will delete the current avatar and fall back to initials.',
      confirmText: 'Remove',
      cancelText: 'Keep Photo',
      type: 'danger',
      onConfirm: () => {
        setAvatar(null);
        showToast('Profile photo removed.', 'info');
      }
    });
  };

  // Password strength visual indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { label: 'None', score: 0, color: 'bg-slate-200 dark:bg-slate-800' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { label: 'Weak', score, color: 'bg-red-500 w-1/3' };
    if (score === 2 || score === 3) return { label: 'Medium', score, color: 'bg-amber-500 w-2/3' };
    return { label: 'Strong', score, color: 'bg-emerald-500 w-full' };
  };

  // Save profile & settings handler
  const handleSaveAll = async () => {
    if (!fullName || !fullName.trim()) {
      showToast('Profile name cannot be blank.', 'error');
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      showToast('Please enter a valid business email address.', 'error');
      return;
    }
    if (!phone || !phone.trim()) {
      showToast('Contact phone number cannot be blank.', 'error');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    const payload = {
      fullName,
      email,
      phone,
      designation,
      company,
      bio,
      avatar,
      backupEmail,
      ...(newPassword && { password: newPassword })
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.user);
        localStorage.setItem('erp_backup_email', backupEmail);
        showToast('Settings & Profile updated successfully.', 'success');
      } else {
        updateUser({ fullName, email, phone, designation, company, bio, avatar, backupEmail });
        localStorage.setItem('erp_backup_email', backupEmail);
        showToast('Settings saved locally.', 'success');
      }
    } catch (err) {
      updateUser({ fullName, email, phone, designation, company, bio, avatar, backupEmail });
      localStorage.setItem('erp_backup_email', backupEmail);
      showToast('Settings saved locally.', 'success');
    }

    // Reset passwords
    setCurrentPassword('');
    newPassword && showToast('Password updated successfully.', 'success');
    setNewPassword('');
    setConfirmPassword('');
    setIsDirty(false);
  };

  const handleDiscardAll = () => {
    askConfirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all pending modifications? All unsaved inputs will be lost.',
      confirmText: 'Discard All',
      cancelText: 'Continue Editing',
      type: 'warning',
      onConfirm: () => {
        setFullName(user?.fullName || 'Astha Sethiya');
        setEmail(user?.email || 'astha@stockerai.com');
        setPhone(user?.phone || '+91 98765 43210');
        setDesignation(user?.designation || 'Lead System Architect');
        setCompany(user?.company || 'StockerAI Enterprise');
        setBio(user?.bio || 'Overseeing automated inventory pipelines, cloud warehouse allocations, and supply chain telemetry grids.');
        setAvatar(user?.avatar || null);
        setBackupEmail(user?.backupEmail || localStorage.getItem('erp_backup_email') || '');
        setAppName('StockerAI Enterprise');
        setDefaultWarehouse('WH-Alpha');
        setLanguage(language || 'English');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotifyLowStock(true);
        setNotifyNewOrder(true);
        setNotifySupplierUpdate(false);
        setIsDirty(false);
        showToast('All modified settings discarded.', 'warning');
      }
    });
  };

  // Backup Export trigger
  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        appName,
        defaultWarehouse,
        language,
        notifyLowStock,
        notifyNewOrder,
        notifySupplierUpdate,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stockerai_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON database backup exported successfully.', 'success');
  };

  // Backup Import trigger
  const handleBackupImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.appName) setAppName(parsed.appName);
        if (parsed.defaultWarehouse) setDefaultWarehouse(parsed.defaultWarehouse);
        if (parsed.language) setLanguage(parsed.language);
        showToast('Database restore parsed & merged successfully.', 'success');
      } catch (err) {
        showToast('Invalid JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleRevokeSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Device session revoked successfully.', 'warning');
  };

  // Dynamic profile completion checklist & percentage calculation
  const getProfileChecklistItems = () => [
    { id: 'personal', label: 'Personal Details', met: fullName.trim().length > 0 && designation.trim().length > 0 },
    { id: 'email', label: 'Email Verified', met: email.trim().length > 0 },
    { id: 'phone', label: 'Mobile Number', met: phone.trim().length > 0 },
    { id: 'password', label: 'Password Updated', met: true },
    { id: 'avatar', label: 'Profile Photo', met: avatar !== null },
    { id: 'company', label: 'Company Information', met: company.trim().length > 0 },
    { id: '2fa', label: 'Two Factor Authentication', met: twoFactor },
    { id: 'backup_email', label: 'Backup Email Configured', met: backupEmail.trim().length > 0 }
  ];

  const getProfileCompletion = () => {
    const list = getProfileChecklistItems();
    const completedCount = list.filter(c => c.met).length;
    return Math.round((completedCount / list.length) * 100);
  };

  const handleChecklistClick = (id) => {
    if (id === 'personal' || id === 'email' || id === 'phone' || id === 'avatar' || id === 'company' || id === 'backup_email') {
      setActiveTab('profile');
      setTimeout(() => {
        let elementId = '';
        if (id === 'personal') elementId = 'settings-name';
        else if (id === 'email') elementId = 'settings-email';
        else if (id === 'phone') elementId = 'settings-phone';
        else if (id === 'company') elementId = 'settings-company';
        else if (id === 'backup_email') elementId = 'settings-backup-email';
        
        if (elementId) {
          const inputEl = document.getElementById(elementId);
          inputEl?.focus();
          inputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (id === 'avatar') {
          document.getElementById('settings-avatar-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else if (id === '2fa' || id === 'password') {
      setActiveTab('security');
      setTimeout(() => {
        if (id === '2fa') {
          document.getElementById('settings-2fa-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (id === 'password') {
          document.getElementById('settings-password-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  useEffect(() => {
    const score = getProfileCompletion();
    if (score === 100) {
      showToast('Congratulations! Your StockerAI profile is 100% complete! 🎉', 'success');
    }
  }, [fullName, email, phone, designation, company, avatar, twoFactor, backupEmail]);

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`${sidebarOpen ? 'lg:ml-64 md:ml-64' : 'md:ml-20'} ml-0 flex-1 flex flex-col transition-all duration-300 z-10 overflow-hidden relative`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6">
          
          {/* BREADCRUMB & HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 text-left">
            <div>
              <Breadcrumbs />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                System Settings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Configure profile parameters, corporate configurations, security checklists, and themes.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscardAll}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Save size={13} />
                Save Changes
              </button>
            </div>
          </div>

          {/* MAIN COLUMN BODY SECTION */}
          {loading ? (
            <div className="space-y-6">
              <SkeletonStats />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mb-6"></div>
                  <div className="space-y-3 w-full">
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
                <div className="lg:col-span-2 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3 mb-6"></div>
                  <div className="space-y-3.5 w-full">
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-850 rounded w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {/* PREMIUM HERO BANNER */}
              <div className={`p-6 rounded-3xl border overflow-hidden relative ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-900/80 to-indigo-950/40 border-slate-800/80' 
                  : 'bg-gradient-to-r from-white to-blue-50/30 border-slate-100'
              } shadow-xl backdrop-blur-md`}>
                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left relative">
                  {/* Profile Avatar Frame with drag & drop and camera hover */}
                  <div id="settings-avatar-section" className="relative group">
                    <div 
                      onDragOver={handleDragOverFile}
                      onDragLeave={handleDragLeaveFile}
                      onDrop={handleDropFile}
                      className={`w-36 h-36 rounded-full border-4 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
                        isDragOver 
                          ? 'border-blue-500 bg-blue-50/20 scale-[1.03]' 
                          : 'border-white dark:border-slate-800 hover:border-blue-500/50'
                      }`}
                    >
                      {avatar ? (
                        <img src={avatar} alt="Profile photo" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-650 text-white font-black text-4xl flex items-center justify-center">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300 cursor-pointer select-none">
                        <Camera size={20} className="mb-1" />
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">Drop or Click</span>
                      </div>
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                    </div>
                  </div>

                  {/* Account Profile Metadata Info */}
                  <div className="flex-1 space-y-3.5 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none flex items-center justify-center md:justify-start gap-2">
                          {fullName || 'User Profile'}
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-55 text-blue-600 dark:bg-blue-955/30 dark:text-blue-400 border border-blue-100/30">
                            {designation || 'Staff'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">
                          {company || 'StockerAI Node'} • {email}
                        </p>
                      </div>

                      {/* Actions buttons directly under header */}
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow flex items-center gap-1.5 transition text-xs hover:scale-[1.01] active:scale-[0.99] hover:shadow-md">
                          <Upload size={12} />
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        
                        <button
                          type="button"
                          disabled={!avatar}
                          onClick={() => {
                            if (avatar) {
                              setTempImage(avatar);
                              setZoomScale(1.1);
                              setRotationAngle(0);
                              setShowCropModal(true);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-white font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none text-xs hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Scissors size={12} />
                          Crop Image
                        </button>

                        <button
                          type="button"
                          disabled={!avatar}
                          onClick={handleRemovePhoto}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none text-xs hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Trash2 size={12} />
                          Remove Photo
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-150/40 dark:border-slate-850 pt-3.5 flex flex-wrap items-center gap-y-2 gap-x-6 text-[10.5px] font-extrabold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span>Last Login: <span className="text-slate-705 dark:text-slate-350">15m ago from Delhi (103.45.191.12)</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>Profile Completion: <span className="text-slate-705 dark:text-slate-350">{getProfileCompletion()}% Complete</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TWO-COLUMN LAYOUT BELOW BANNER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Tab list & Progress items */}
                <div className="space-y-6">
                  {/* Tab list card */}
                  <div className={`p-4 rounded-2xl border shadow-sm space-y-1.5 text-left ${
                    isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                  }`}>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 block mb-2">Settings Navigation</span>
                    {[
                      { id: 'profile', label: 'Personal details', icon: User },
                      { id: 'security', label: 'Security & Access', icon: Shield },
                      { id: 'preferences', label: 'Preferences', icon: Sliders },
                      { id: 'backup', label: 'Integration & Sync', icon: Database }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={14} />
                            {tab.label}
                          </span>
                          <ChevronRight size={13} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Profile Completion tracking progress */}
                  <div className={`p-5 rounded-2xl border text-left shadow-xl space-y-5 ${
                    isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                  }`}>
                    {/* Interactive circular gauge block */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="text-slate-100 dark:text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <motion.circle
                            cx="28"
                            cy="28"
                            r="24"
                            className="text-blue-600 dark:text-blue-500"
                            strokeWidth="3.5"
                            strokeDasharray={150.8}
                            initial={{ strokeDashoffset: 150.8 }}
                            animate={{ strokeDashoffset: 150.8 - (getProfileCompletion() / 100) * 150.8 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-slate-800 dark:text-white">
                          {getProfileCompletion()}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Completion Score</span>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {getProfileCompletion() === 100 ? 'Setup complete! 🎉' : 'Click tasks to update sections.'}
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProfileCompletion()}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>

                    <div className="space-y-4 pt-1 text-[11px] font-bold">
                      {/* Completed Group */}
                      {getProfileChecklistItems().filter(item => item.met).length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9.5px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Completed
                          </div>
                          <div className="space-y-1.5 overflow-hidden">
                            <AnimatePresence initial={false}>
                              {getProfileChecklistItems().filter(item => item.met).map((item) => (
                                <motion.button 
                                  key={item.id} 
                                  layout
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  onClick={() => handleChecklistClick(item.id)}
                                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-400 dark:text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                                >
                                  <span className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                                    <span className="line-through">{item.label}</span>
                                  </span>
                                  <span className="text-[8.5px] font-extrabold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full group-hover:bg-emerald-500/20">Done</span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Remaining Group */}
                      {getProfileChecklistItems().filter(item => !item.met).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850/50">
                          <div className="text-[9.5px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Remaining
                          </div>
                          <div className="space-y-1.5 overflow-hidden">
                            <AnimatePresence initial={false}>
                              {getProfileChecklistItems().filter(item => !item.met).map((item) => (
                                <motion.button 
                                  key={item.id} 
                                  layout
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  onClick={() => handleChecklistClick(item.id)}
                                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                                >
                                  <span className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-350 dark:border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500 transition-colors">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                                    </div>
                                    <span>{item.label}</span>
                                  </span>
                                  <span className="text-[8.5px] font-extrabold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full group-hover:text-blue-600 dark:group-hover:text-blue-400">Pending</span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Tab content panel details */}
                <div className="lg:col-span-2 space-y-6 text-left">
                  {activeTab === 'profile' && (
                    <div className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
                      isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                    }`}>
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                        <User size={15} className="text-blue-600" />
                        <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Account Credentials</h3>
                      </div>

                      <div className="space-y-4 text-xs font-semibold">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">User Full Name *</label>
                            <input
                              id="settings-name"
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Astha Sethiya"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Account Email Address *</label>
                            <input
                              id="settings-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. astha@stockerai.com"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Telephone Contact *</label>
                            <input
                              id="settings-phone"
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. +91 98765 43210"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Corporate Designation *</label>
                            <input
                              type="text"
                              value={designation}
                              onChange={(e) => setDesignation(e.target.value)}
                              placeholder="e.g. System Administrator"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Corporate Company Node</label>
                            <input
                              id="settings-company"
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="e.g. StockerAI Enterprise"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Backup Recovery Email</label>
                            <input
                              id="settings-backup-email"
                              type="email"
                              value={backupEmail}
                              onChange={(e) => setBackupEmail(e.target.value)}
                              placeholder="e.g. recovery@stockerai.com"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Operational User Bio</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Write a brief professional summary..."
                            rows={4}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${
                              isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div id="settings-password-section" className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-855 flex items-center gap-2">
                          <Key size={15} className="text-blue-600" />
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Change Password</h3>
                        </div>

                        <div className="space-y-4 text-xs font-semibold">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Current Password</label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password..."
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                                isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                              }`}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">New Password</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Create new password..."
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                                  isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password..."
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                                  isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                                }`}
                              />
                            </div>
                          </div>

                          {newPassword && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-400">
                                <span>Password Strength</span>
                                <span>{getPasswordStrength().label}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${getPasswordStrength().color}`} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div id="settings-2fa-section" className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Shield size={15} className="text-blue-650" />
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Multi-Factor Checklists</h3>
                        </div>

                        <div className="space-y-4 text-xs font-bold">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
                              <span className="text-[10px] text-slate-400 font-medium">Verify outbound transaction orders via authenticator app.</span>
                            </div>
                            <button
                              onClick={() => { setTwoFactor(!twoFactor); showToast(twoFactor ? '2FA Deactivated' : '2FA Enabled', 'info'); }}
                              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors ${twoFactor ? 'bg-blue-650' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-4.5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between border-t pt-3.5 border-slate-100 dark:border-slate-850">
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">Google Corporate Authentication Link</p>
                              <span className="text-[10px] text-slate-400 font-medium">Link Google accounts directly.</span>
                            </div>
                            <button
                              onClick={() => { setGoogleConnected(!googleConnected); showToast(googleConnected ? 'Google SSO Unlinked' : 'Google SSO Connected', 'info'); }}
                              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors ${googleConnected ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${googleConnected ? 'translate-x-4.5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Clock size={15} className="text-blue-655" />
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Session Audit Keys</h3>
                        </div>

                        <div className="space-y-3">
                          {activeSessions.map(session => (
                            <div key={session.id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-850/40 p-3 rounded-xl border dark:border-slate-800 animate-slide-up-item">
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white">{session.device}</p>
                                <span className="text-[9.5px] text-slate-400 font-medium mt-0.5 block">IP Allocation: {session.ip} • {session.status}</span>
                              </div>
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-655 font-bold rounded-lg transition"
                              >
                                Revoke
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Moon size={15} className="text-blue-600" />
                          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Appearance Settings</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                          {[
                            { id: 'light', label: 'Light Theme', icon: Sun },
                            { id: 'dark', label: 'Dark Theme', icon: Moon },
                            { id: 'system', label: 'System Default', icon: Laptop }
                          ].map(t => {
                            const Icon = t.icon;
                            return (
                              <button
                                key={t.id}
                                onClick={() => { setTheme(t.id); showToast(`Theme updated to ${t.id}`, 'info'); }}
                                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2.5 transition duration-155 hover:scale-[1.02] ${
                                  theme === t.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-805 border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <Icon size={16} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-855 flex items-center gap-2">
                          <Globe size={15} className="text-blue-605" />
                          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">System Language</h3>
                        </div>

                        <div>
                          <select
                            value={language}
                            onChange={(e) => { setLanguage(e.target.value); showToast(`Language changed to ${e.target.value}`, 'info'); }}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                              isDark ? 'bg-slate-850 border-slate-750 text-white' : 'bg-slate-50 border-slate-202 text-slate-800'
                            }`}
                          >
                            <option value="English">English (US)</option>
                            <option value="Hindi">Hindi (IND)</option>
                            <option value="Spanish">Spanish (ES)</option>
                            <option value="German">German (DE)</option>
                            <option value="French">French (FR)</option>
                          </select>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Bell size={15} className="text-blue-600" />
                          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Notification Preferences</h3>
                        </div>

                        <div className="space-y-3.5 text-xs font-bold">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={notifyLowStock}
                              onChange={(e) => setNotifyLowStock(e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">Warehouse Low Stock Alerts</p>
                              <span className="text-[9.5px] text-slate-400 font-medium block">Receive alerts when inventory level is low.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer select-none border-t pt-3 border-slate-100 dark:border-slate-850">
                            <input
                              type="checkbox"
                              checked={notifyNewOrder}
                              onChange={(e) => setNotifyNewOrder(e.target.checked)}
                              className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">New Purchase & Sales Order Invoices</p>
                              <span className="text-[9.5px] text-slate-400 font-medium block">Notify when checkout invoices are posted.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer select-none border-t pt-3 border-slate-100 dark:border-slate-850">
                            <input
                              type="checkbox"
                              checked={notifySupplierUpdate}
                              onChange={(e) => setNotifySupplierUpdate(e.target.checked)}
                              className="rounded text-blue-605 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <div>
                              <p className="text-slate-800 dark:text-slate-200">Supplier compliance update checks</p>
                              <span className="text-[9.5px] text-slate-400 font-medium block">Trigger notifications when compliance changes.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'backup' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Database size={15} className="text-blue-600" />
                          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">JSON Database Backup</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="p-4 border rounded-xl border-dashed dark:border-slate-800 space-y-2 flex flex-col justify-between">
                            <div className="flex items-start gap-2">
                              <ArrowDownToLine size={16} className="text-blue-505 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white">Export Snapshot Backup</p>
                                <span className="text-[10px] text-slate-400 leading-normal">Compile current settings, theme preferences, and configuration details.</span>
                              </div>
                            </div>
                            <button
                              onClick={handleBackupExport}
                              className="w-full py-2 bg-blue-605 hover:bg-blue-700 text-white font-extrabold rounded-lg transition mt-2 shadow-xs"
                            >
                              Download Backup
                            </button>
                          </div>

                          <div className="p-4 border rounded-xl border-dashed dark:border-slate-800 space-y-2 flex flex-col justify-between">
                            <div className="flex items-start gap-2">
                              <RefreshCw size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white">Restore Snapshot Backup</p>
                                <span className="text-[10px] text-slate-400 leading-normal">Parse and merge a previously generated JSON backup file.</span>
                              </div>
                            </div>
                            <label className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-lg text-center cursor-pointer transition block mt-2">
                              Upload Restore File
                              <input type="file" accept=".json" className="hidden" onChange={handleBackupImport} />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                        isDark ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'
                      }`}>
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <Sliders size={15} className="text-blue-605" />
                          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Corporate Integrations</h3>
                        </div>

                        <div className="space-y-3 text-xs font-bold">
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border dark:border-slate-800">
                            <div>
                              <p className="text-slate-805 dark:text-slate-205">Stripe Payment Invoicing</p>
                              <span className="text-[9.5px] text-slate-450 block mt-0.5 font-medium">Collect sales order billing invoices via Stripe Checkout.</span>
                            </div>
                            <span className="text-[9.5px] uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-955/20 px-2.5 py-0.5 rounded-full">
                              Connected
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border dark:border-slate-800">
                            <div>
                              <p className="text-slate-805 dark:text-slate-205">Slack Notification Webhooks</p>
                              <span className="text-[9.5px] text-slate-450 block mt-0.5 font-medium">Relay low stock warnings and order alerts into a Slack channel.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => showToast('Slack webhook integration requested.', 'info')}
                              className="px-3 py-1 border hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-600 dark:text-white rounded-lg transition"
                            >
                              Configure
                            </button>
                          </div>

                          <div className="flex justify-between items-center bg-red-500/5 dark:bg-red-950/5 p-3 rounded-xl border border-dashed border-red-500/25">
                            <div>
                              <p className="text-red-600 dark:text-red-400 font-extrabold">Reset Application Configurations</p>
                              <span className="text-[9.5px] text-slate-450 dark:text-slate-400 block mt-0.5 font-medium">Restore app name, warehouse defaults, and localization details to factory parameters.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                askConfirm({
                                  title: 'Reset Settings & Preferences',
                                  message: 'Are you sure you want to restore StockerAI application settings to factory default parameters? This action will reset dashboard presets and notification toggles.',
                                  confirmText: 'Reset to Defaults',
                                  cancelText: 'Keep Current',
                                  type: 'danger',
                                  onConfirm: () => {
                                    setAppName('StockerAI Enterprise');
                                    setDefaultWarehouse('WH-Alpha');
                                    setLanguage('English');
                                    setNotifyLowStock(true);
                                    setNotifyNewOrder(true);
                                    setNotifySupplierUpdate(false);
                                    showToast('Application preferences reset to defaults.', 'success');
                                  }
                                });
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-extrabold"
                            >
                              Reset Settings
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          )}

        </main>
      </div>

      {/* CROP IMAGE MODAL */}
      {showCropModal && tempImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white shadow-black/50' : 'bg-white border-slate-200 text-slate-850 shadow-slate-300/40'
          }`}>
            <button 
              onClick={() => setShowCropModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            >
              <X size={16} />
            </button>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-left">Crop Profile Image</h3>
            
            <div className="flex flex-col items-center gap-6">
              {/* circular mask layout container */}
              <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-blue-500 bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative shadow-inner">
                <img 
                  src={tempImage} 
                  alt="Crop Preview" 
                  className="max-w-none transition-transform duration-105 select-none pointer-events-none"
                  style={{
                    transform: `scale(${zoomScale}) rotate(${rotationAngle}deg)`,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              
              <div className="w-full space-y-4 text-xs font-semibold text-left">
                <div>
                  <div className="flex justify-between mb-1.5 text-slate-500 dark:text-slate-400">
                    <span>Scale / Zoom</span>
                    <span>{Math.round(zoomScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.05" 
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1.5 text-slate-500 dark:text-slate-400">
                    <span>Rotate Angle</span>
                    <span>{rotationAngle}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    step="1" 
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    setAvatar(tempImage);
                    setShowCropModal(false);
                    showToast('Cropped avatar view applied.', 'success');
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-md active:scale-98 scale-on-hover"
                >
                  Crop & Apply
                </button>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl transition font-extrabold active:scale-98"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES VERIFICATION DIALOG */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-55 p-4 backdrop-blur-xs animate-fade-in">
          <div className={`${isDark ? 'bg-slate-900 border border-slate-800 text-white shadow-black/40' : 'bg-white border border-slate-202 text-gray-855 shadow-slate-202/50'} rounded-2xl shadow-2xl p-6 max-w-sm w-full text-left`}>
            <div className="flex items-center gap-2 text-red-505 mb-3">
              <AlertCircle size={18} />
              <h2 className="text-xs font-black uppercase">Unsaved Changes Warning</h2>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mb-6">
              You have made modifications to your settings profile that have not been saved. Leaving this view will discard all unsaved edits.
            </p>

            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={async () => {
                  await handleSaveAll();
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  if (pendingRoute) navigate(pendingRoute);
                }}
                className="flex-1 py-2 bg-blue-605 hover:bg-blue-700 text-white rounded-xl transition shadow"
              >
                Save & Continue
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  if (pendingRoute) navigate(pendingRoute);
                }}
                className="flex-1 py-2 bg-red-60 bg-red-600 hover:bg-red-750 text-white rounded-xl transition"
              >
                Discard & Leave
              </button>
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-705 dark:text-white rounded-xl transition"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}