import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  X,
  Menu,
  Zap,
  Activity,
  Shield,
  Compass,
  Eye,
  Power,
  UserCheck,
  DollarSign,
  Bell,
  MessageSquare,
  Orbit,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  // Moon, // Unused - can be added when dark mode toggle is implemented
  // Sun, // Unused - can be added when dark mode toggle is implemented
  Lightbulb
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../Logo';
import { getStoredAdminUser, adminLogout } from './adminAuthService';
import * as adminService from './adminService';
import StatusBadge from './StatusBadge';
import MessageCenter from './Messagecentre';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser] = useState(getStoredAdminUser());
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalUsers: 0
  });
  const [professionals, setProfessionals] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [systemCategories, setSystemCategories] = useState([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  // Edit category state
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editCategoryLabel, setEditCategoryLabel] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [liveStatusData, setLiveStatusData] = useState([]);
  const [reports, setReports] = useState([]);
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, categoryRevenue: [], timeline: [] });

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterServiceStatus, setFilterServiceStatus] = useState(''); // 'ongoing', 'free', or ''
  const [reportStatusFilter, setReportStatusFilter] = useState('All');

  // Modal States
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [adminReportNote, setAdminReportNote] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    type: 'danger' 
  });

  const openConfirm = (config) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  // Calendar States & Offline Synchronization
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_calendar_tasks');
      return stored ? JSON.parse(stored) : [
        { id: '1', date: new Date().toISOString().split('T')[0], title: 'Platform Security Audit', category: 'maintenance', completed: false },
        { id: '2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], title: 'Review Pending Handymen Applications', category: 'verification', completed: true },
        { id: '3', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], title: 'Broadcasting Welcome Message', category: 'broadcast', completed: false },
        { id: '4', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], title: 'Database Backup Schedule', category: 'maintenance', completed: false }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('verification');

  useEffect(() => {
    localStorage.setItem('admin_calendar_tasks', JSON.stringify(calendarTasks));
  }, [calendarTasks]);

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getLocalDateString = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchNotifications = async () => {
    try {
      const res = await adminService.getAdminNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleNotificationClick = (notificationId) => {
    adminService.markNotificationAsRead(notificationId).catch(err => console.error(err));
  };

  const handleAddCalendarTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      return;
    }
    
    const dateStr = getLocalDateString(selectedCalendarDate);
    const newTask = {
      id: Date.now().toString(),
      date: dateStr,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      completed: false
    };
    
    setCalendarTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleCalendarTask = (taskId) => {
    setCalendarTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteCalendarTask = (taskId) => {
    setCalendarTasks(prev => prev.filter(t => t.id !== taskId));
  };

  useEffect(() => {
    fetchDashboardData();
    // Load notifications when dashboard loads
    fetchNotifications();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'professionals' || activeTab === 'requests') {
      const delaySearch = setTimeout(() => {
        fetchDashboardData();
      }, 500);
      return () => clearTimeout(delaySearch);
    }
  }, [searchTerm, filterCategory, filterStatus, filterServiceStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview') {
        const [statsRes, recentRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentApplications({ limit: 5 })
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (recentRes.success) setProfessionals(recentRes.data);
      } else if (activeTab === 'professionals' || activeTab === 'requests') {
        // Use search endpoint for professionals/requests if search or filters are active
        if (searchTerm || filterCategory || filterStatus) {
          const searchRes = await adminService.searchProfessionals({
            search: searchTerm,
            category: filterCategory,
            status: activeTab === 'requests' ? 'pending' : (filterStatus || 'verified'),
            limit: 50
          });
          if (searchRes.success) {
            let filtered = searchRes.data;
            // Apply service status filter
            if (filterServiceStatus) {
              filtered = filtered.filter(p => {
                const serviceStatus = p.liveStatus || p.serviceStatus || 'Free';
                return serviceStatus.toLowerCase() === filterServiceStatus.toLowerCase();
              });
            }
            setProfessionals(filtered);
          }
        } else {
          const proRes = await adminService.getAllProfessionalsForAdmin({ 
            status: activeTab === 'requests' ? 'pending' : 'verified',
            limit: 50
          });
          if (proRes.success) {
            let filtered = proRes.data;
            // Apply service status filter
            if (filterServiceStatus) {
              filtered = filtered.filter(p => {
                const serviceStatus = p.liveStatus || p.serviceStatus || 'Free';
                return serviceStatus.toLowerCase() === filterServiceStatus.toLowerCase();
              });
            }
            setProfessionals(filtered);
          }
        }
      } else if (activeTab === 'users') {
        const response = await adminService.getAllUsers();
        if (response.success) setUsers(response.data);
      } else if (activeTab === 'categories') {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) setSystemCategories(data.data);
      } else if (activeTab === 'analytics') {
        const [analyticsRes, categoryRes, statusRes, revenueRes] = await Promise.all([
          adminService.getAnalyticsData(),
          adminService.getCategoryDistribution(),
          adminService.getStatusDistribution(),
          adminService.getRevenueAnalytics()
        ]);
        
        if (analyticsRes.success) {
          if (analyticsRes.data.liveStatusDistribution) {
            setLiveStatusData(analyticsRes.data.liveStatusDistribution);
          }
        }
        if (revenueRes.success) setRevenueData(revenueRes.data);
        if (categoryRes.success) {
          const rawData = categoryRes.data;
          let formatted = [];
          if (Array.isArray(rawData)) {
            formatted = rawData.map(item => ({
              name: (item.category || item._id || 'General').charAt(0).toUpperCase() + (item.category || item._id || 'General').slice(1),
              value: item.count || 0
            }));
          } else {
            formatted = Object.entries(rawData).map(([name, value]) => ({ 
              name: name.charAt(0).toUpperCase() + name.slice(1), 
              value 
            }));
          }
          setCategoryData(formatted);
        }
        if (statusRes.success) {
          const rawData = statusRes.data;
          let formatted = [];
          if (Array.isArray(rawData)) {
            formatted = rawData.map(item => ({
              name: (item.status || item._id || 'Unknown').charAt(0).toUpperCase() + (item.status || item._id || 'Unknown').slice(1),
              value: item.count || 0
            }));
          } else {
            formatted = Object.entries(rawData).map(([name, value]) => ({ 
              name: name.charAt(0).toUpperCase() + name.slice(1), 
              value 
            }));
          }
          setStatusData(formatted);
        }
      } else if (activeTab === 'reports') {
        const response = await adminService.getReports();
        if (response.success) setReports(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (professional) => {
    try {
      const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 118, 110); // Kamau Teal
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KAMAU NEPAL', 15, 20);
    doc.setFontSize(10);
    doc.text('PROFESSIONAL REGISTRATION RECORD', 15, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 130, 20);

    // Add Profile Image if exists
    if (professional.profileImage) {
      try {
        const imgUrl = professional.profileImage.startsWith('http') 
          ? professional.profileImage 
          : `${window.location.origin}/${professional.profileImage.replace(/\\/g, '/')}`;
        
        // Asynchronously load the image to be added to PDF
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = 'Anonymous';
          i.onload = () => resolve(i);
          i.onerror = (e) => reject(e);
          i.src = imgUrl;
        });
        
        // Draw image frame
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(168, 5, 32, 32, 3, 3, 'F');
        // Add image
        doc.addImage(img, 'JPEG', 169, 6, 30, 30);
      } catch (err) {
        console.error('Failed to include image in PDF:', err);
      }
    }

    // Profile Section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.text('1. IDENTITY & CONTACT', 15, 55);
    
    const identityData = [
      ['Full Name', `${professional.firstName} ${professional.lastName}`],
      ['Username', `@${professional.username}`],
      ['Email Address', professional.email],
      ['Phone Number', professional.phone],
      ['Gender', professional.gender || 'Not specified'],
      ['Status', professional.verificationStatus.toUpperCase()]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: identityData,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 15 }
    });

    // Service Section
    doc.setFontSize(14);
    doc.text('2. SERVICE PROPOSITION', 15, doc.lastAutoTable.finalY + 15);
    
    const serviceData = [
      ['Category', professional.serviceCategory],
      ['Hourly Wage', `रू ${professional.hourlyWage}`],
      ['Service Area', professional.serviceArea || professional.formattedAddress],
      ['Availability', professional.availability?.map(a => `${a.day}: ${a.startTime}-${a.endTime}`).join(', ') || 'Not specified']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Information']],
      body: serviceData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Orange
      margin: { left: 15 }
    });

    // Geography Section
    doc.setFontSize(14);
    doc.text('3. GEOGRAPHIC PRECISION', 15, doc.lastAutoTable.finalY + 15);
    
    const geoData = [
      ['Full Address', professional.formattedAddress || 'N/A']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Coordinate Data']],
      body: geoData,
      theme: 'plain',
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 15 }
    });

    // Bio Section
    doc.setFontSize(14);
    doc.text('4. PROFESSIONAL BIOGRAPHY', 15, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitBio = doc.splitTextToSize(professional.bio || 'No biography provided.', 180);
    doc.text(splitBio, 15, doc.lastAutoTable.finalY + 22);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - Service Partner Verification Document`, 105, 285, { align: 'center' });
    }

    doc.save(`${professional.firstName}_${professional.lastName}_Application.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  const handleApprove = async (id) => {
    openConfirm({
      title: "Approve Professional",
      message: "This will grant the professional full platform access. Are you sure you want to proceed?",
      confirmText: "Approve Partner",
      onConfirm: async () => {
        try {
          const res = await adminService.approveProfessional(id);
          if (res.success) {
            fetchDashboardData();
          }
        } catch (err) {
        }
      },
      type: 'success'
    });
  };

  const handleReject = (id) => {
    const pro = professionals.find(p => p._id === id);
    setSelectedProfessional(pro);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await adminService.rejectProfessional(selectedProfessional._id, rejectionReason);
      if (res.success) {
        setShowRejectionModal(false);
        fetchDashboardData();
      }
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (pro) => {
    setSelectedProfessional(pro);
    setShowDetailsModal(true);
  };

  const handleLogout = () => {
    openConfirm({
      title: "Security Logout",
      message: "Are you sure you want to sign out of the administrative session?",
      confirmText: "Sign Out Now",
      onConfirm: async () => {
        try {
          await adminLogout();
        } catch (err) {
          console.error("Logout failed:", err);
        }
        localStorage.clear();
        navigate('/login');
      },
      type: 'danger'
    });
  };

  const handleDeleteUser = async (id) => {
    openConfirm({
      title: "Confirm User Deletion",
      message: "WARNING: This will permanently delete this user account and their professional profile (if any). Access will be immediately revoked. Continue?",
      confirmText: "Delete Account",
      onConfirm: async () => {
        try {
          const res = await adminService.deleteUser(id);
          if (res.success) {
            fetchDashboardData();
          }
        } catch (err) {
        }
      },
      type: 'danger'
    });
  };

  const handleDeleteProfessional = async (id) => {
    openConfirm({
      title: "Revoke Professional Status",
      message: "This will permanently delete the professional profile. The user will still be able to login as a regular client. Continue?",
      confirmText: "Delete Profile",
      onConfirm: async () => {
        try {
          const res = await adminService.deleteProfessional(id);
          if (res.success) {
            fetchDashboardData();
          }
        } catch (err) {
        }
      },
      type: 'danger'
    });
  };

  const handleBlockProfessional = async (id, days = 3) => {
    const professional = professionals.find(p => p._id === id);
    openConfirm({
      title: "Block Professional",
      message: `This will suspend ${professional?.firstName} ${professional?.lastName} for ${days} days. They will not appear in search results and cannot accept new bookings. Continue?`,
      confirmText: `Block for ${days} Days`,
      onConfirm: async () => {
        try {
          const res = await adminService.blockProfessional(id, days);
          if (res.success) {
            fetchDashboardData();
          }
        } catch (err) {
        }
      },
      type: 'warning'
    });
  };

  const handleUnblockProfessional = async (id) => {
    const professional = professionals.find(p => p._id === id);
    openConfirm({
      title: "Unblock Professional",
      message: `This will restore ${professional?.firstName} ${professional?.lastName}'s access and make them visible in search results again. Continue?`,
      confirmText: "Unblock Professional",
      onConfirm: async () => {
        try {
          const res = await adminService.unblockProfessional(id);
          if (res.success) {
            fetchDashboardData();
          }
        } catch (err) {
        }
      },
      type: 'success'
    });
  };

  const handleUpdateServiceStatus = async (id, newStatus) => {
    try {
      const res = await adminService.updateProfessionalServiceStatus(id, newStatus);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update service status:', err);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: null },
    { id: 'requests', label: 'Verification', icon: UserCheck, badge: stats.totalPending || null },
    { id: 'professionals', label: 'Professionals', icon: Shield, badge: null },
    { id: 'users', label: 'Total Users', icon: Users, badge: null },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: null },
    { id: 'categories', label: 'Categories', icon: Plus, badge: null },
    { id: 'reports', label: 'Reports', icon: ShieldAlert, badge: null },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: null },
    { id: 'broadcast', label: 'Broadcast', icon: MessageSquare, badge: null },
  ];

  if (loading && activeTab === 'overview' && professionals.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            <Zap className="w-8 h-8 text-teal-600 animate-pulse absolute top-6 left-6" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-slate-900 font-black text-sm tracking-[0.2em] uppercase">Kamau Admin</p>
            <p className="text-slate-500 text-xs font-mono animate-pulse">Synchronizing Data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex overflow-hidden relative transition-colors ${
      darkMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-2xl border-r transform transition-all duration-500 lg:static lg:translate-x-0 ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800 translate-x-0'
          : 'bg-white/80 border-slate-100'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 relative">
          <div className="flex items-center justify-between mb-8 relative">
            <Logo className="h-8 w-auto" isStatic={true} />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><X size={18} /></button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 -mr-8 -mt-8 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-lg">
                {adminUser?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className={`font-bold truncate leading-tight text-sm ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                }`}>{adminUser?.fullName || 'Super Admin'}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-teal-600 mt-0.5">Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 relative">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group relative ${
                    activeTab === item.id 
                      ? darkMode 
                        ? 'bg-slate-800 border border-slate-700 text-teal-400' 
                        : 'bg-white border border-slate-100 text-teal-600'
                      : darkMode
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  <Icon size={16} className={activeTab === item.id ? 'text-teal-500 border-teal-500' : 'group-hover:text-teal-500 transition-colors'} />
                  <span className="font-black text-[11px] uppercase tracking-wider">{item.label}</span>
                  {item.badge && <span className="ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black bg-orange-100 text-orange-600 border border-orange-200">{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className={`mt-auto pt-6 border-t ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-300 group ${
              darkMode
                ? 'text-rose-400 hover:bg-rose-900/20'
                : 'text-rose-500 hover:bg-rose-50'
            }`}>
              <Power size={15} className="group-hover:scale-110 transition-transform" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b px-6 py-3.5 flex items-center justify-between transition-all ${
          darkMode 
            ? 'bg-slate-900/60 border-slate-800' 
            : 'bg-white/60 border-slate-100'
        }`}>
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl"><Menu size={20} /></button>
            <button 
                onClick={() => navigate(-1)}
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all"
                title="Go Back"
            >
                <ChevronLeft size={20} />
            </button>
            <Logo className="h-7 w-auto" isStatic={true} />
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search professionals, requests, specific data..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowNotificationModal(true)}
              className={`relative p-2.5 transition-colors rounded-xl flex items-center justify-center ${
              darkMode 
                ? 'text-slate-300 hover:text-blue-400 bg-slate-800' 
                : 'text-slate-400 hover:text-teal-500 bg-slate-50'
            }`}
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 transition-all rounded-xl flex items-center justify-center ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-slate-50 text-orange-500 hover:bg-orange-50'
              }`}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Lightbulb size={18} fill="currentColor" /> : <Lightbulb size={18} />}
            </button>
            <div className={`flex items-center gap-3 pl-6 border-l ${
              darkMode ? 'border-slate-700' : 'border-slate-100'
            }`}>
              <div className="text-right hidden sm:block">
                <p className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>Access Level</p>
                <p className={`text-[11px] font-bold uppercase tracking-tighter ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                }`}>System Admin</p>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                darkMode 
                  ? 'bg-blue-900/30 border-blue-500/30 text-blue-400' 
                  : 'bg-teal-500/10 border-teal-500/20 text-teal-600'
              }`}>
                <Shield size={18} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 relative">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Platform Dashboard</h1>
                    <p className="text-slate-500 font-semibold uppercase tracking-widest text-[9px]">Real-time system health & analytics</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 flex items-center gap-2">
                    <Clock size={14} className="text-orange-500" />
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-100', tab: 'users' },
                    { label: 'Applications', value: stats.totalApplications, icon: FileText, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-100', tab: 'professionals' },
                    { label: 'Awaiting', value: stats.totalPending, icon: Clock, color: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-100', tab: 'requests' },
                    { label: 'Verified', value: stats.totalApproved, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-100', tab: 'professionals' },
                    { label: 'Declined', value: stats.totalRejected, icon: X, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-100', tab: 'requests' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div 
                        key={i} 
                        onClick={() => setActiveTab(stat.tab)}
                        className="relative bg-white p-5 rounded-2xl border border-slate-100 group hover:scale-[1.02] active:scale-95 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-12 -mt-12 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white group-hover:rotate-6 transition-transform`}>
                            <Icon size={18} />
                          </div>
                          <div className="w-9 h-9 rounded-full border border-slate-50 bg-slate-50/50 flex items-center justify-center">
                            <Activity size={12} className="text-slate-300" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mb-1 relative z-10">{stat.value}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <section className="bg-white p-6 rounded-3xl border border-slate-100 h-full">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <Activity size={18} className="text-teal-600" /> Recent Registrations
                        </h3>
                      </div>
                      <button onClick={() => setActiveTab('requests')} className="px-4 py-2 bg-slate-50 text-teal-600 text-[9px] font-semibold uppercase tracking-widest rounded-xl hover:bg-teal-50 transition-all">Explore All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                            <th className="pb-3 pl-4">Professional</th>
                            <th className="pb-3">Specialization</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-4">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {professionals.length === 0 ? (
                            <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-semibold uppercase tracking-widest text-[9px]">No new entries detected</td></tr>
                          ) : (
                            professionals.map((p) => (
                              <tr 
                                key={p._id} 
                                onClick={() => handleViewDetails(p)}
                                className="hover:bg-teal-50/50 transition-all group cursor-pointer"
                              >
                                <td className="py-3.5 pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                                      {p.profileImage ? (
                                        <img 
                                          src={p.profileImage.startsWith('http') ? p.profileImage : `/${p.profileImage.replace(/\\/g, '/')}`} 
                                          className="w-full h-full object-cover" 
                                          alt={p.firstName}
                                        />
                                      ) : (
                                        <Users size={16} className="text-teal-500" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        {p.firstName} {p.lastName}
                                      </p>
                                      <p className="text-[9px] text-teal-600 font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                        Partner ID: #{p._id.slice(-6).toUpperCase()}
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        {p.completedJobs || 0} {p.completedJobs === 1 ? 'Service' : 'Services'} Done
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-semibold uppercase tracking-wider">{p.serviceCategory}</span>
                                </td>
                                <td className="py-3.5"><StatusBadge status={p.verificationStatus} /></td>
                                <td className="py-3.5 pr-4 text-right">
                                  <button onClick={() => handleViewDetails(p)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-xl transition-all"><Eye size={16} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                
              </div>
            </div>
          )}
          
          {(activeTab === 'requests' || activeTab === 'professionals') && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">{activeTab === 'requests' ? 'Awaiting Verification' : 'Verified Professionals'}</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Filter and manage service partner records</p>
                  </div>
                  
                  {/* Search and Filter UI */}
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                          type="text" 
                          placeholder="Search name, email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all border border-transparent"
                        />
                      </div>
                      
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-slate-50 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-slate-600 focus:outline-none transition-all border border-transparent cursor-pointer hover:bg-slate-100"
                      >
                        <option value="">All Categories</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="carpentry">Carpentry</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="painting">Painting</option>
                        <option value="gardening">Gardening</option>
                        <option value="mechanic">Mechanic</option>
                        <option value="tutoring">Tutoring</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="graphic_designer">Designer</option>
                        <option value="developer">Developer</option>
                      </select>

                      {activeTab === 'professionals' && (
                        <select 
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 bg-slate-50 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-slate-600 focus:outline-none transition-all border border-transparent cursor-pointer hover:bg-slate-100"
                        >
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                          <option value="pending">Pending</option>
                        </select>
                      )}
                    </div>

                    {/* Service Status Filter Buttons */}
                    {activeTab === 'professionals' && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setFilterServiceStatus('')}
                          className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${
                            filterServiceStatus === ''
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => setFilterServiceStatus('ongoing')}
                          className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            filterServiceStatus === 'ongoing'
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                          }`}
                        >
                          <Lightbulb size={12} />
                          Ongoing
                        </button>
                        <button
                          onClick={() => setFilterServiceStatus('free')}
                          className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            filterServiceStatus === 'free'
                              ? 'bg-teal-500 text-white'
                              : 'bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100'
                          }`}
                        >
                          ✓ Free
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 ">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                          <th className="pb-3 pl-4">Full Identity</th>
                          <th className="pb-3">Sector</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right pr-4">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {professionals.length === 0 ? (
                           <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-semibold uppercase tracking-wider text-[9px]">No records found for this sector</td></tr>
                        ) : (
                          professionals.map((p) => (
                            <tr 
                              key={p._id} 
                              onClick={() => handleViewDetails(p)}
                              className="hover:bg-teal-50/50 transition-all group cursor-pointer"
                            >
                              <td className="py-3.5 pl-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                                    {p.profileImage ? (
                                      <img 
                                        src={p.profileImage.startsWith('http') ? p.profileImage : `/${p.profileImage.replace(/\\/g, '/')}`} 
                                        className="w-full h-full object-cover" 
                                        alt={p.firstName} 
                                      />
                                    ) : (
                                      <Users size={16} className="text-teal-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm flex items-center gap-2">
                                      {p.firstName} {p.lastName}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                      {p.email}
                                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                      {p.completedJobs || 0} {p.completedJobs === 1 ? 'Service' : 'Services'} Done
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-semibold uppercase tracking-wider">{p.serviceCategory}</span>
                              </td>
                              <td className="py-3.5"><StatusBadge status={p.verificationStatus} /></td>
                              <td className="py-3.5 pr-4 text-right">
                                  {p.verificationStatus === 'pending' ? (
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleApprove(p._id); }} 
                                        className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all  active:scale-95"
                                        title="Verify Professional"
                                      >
                                        <CheckCircle size={15} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleReject(p._id); }} 
                                        className="p-2 bg-rose-500 text-white hover:bg-rose-600 rounded-xl transition-all  active:scale-95"
                                        title="Decline Profile"
                                      >
                                        <X size={15} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          const nextStatus = p.liveStatus === 'Ongoing' ? 'Free' : 'Ongoing';
                                          handleUpdateServiceStatus(p._id, nextStatus);
                                        }} 
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider ${
                                          p.liveStatus === 'Ongoing'
                                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30'
                                            : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                                        }`}
                                        title={p.liveStatus === 'Ongoing' ? 'Mark as Free' : 'Mark as Ongoing'}
                                      >
                                        {p.liveStatus === 'Ongoing' && <Lightbulb size={12} className="animate-pulse" fill="currentColor" />}
                                        {p.liveStatus === 'Ongoing' ? 'Ongoing' : 'Free'}
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDownloadPDF(p); }} 
                                        className="p-2 bg-white text-slate-400 hover:text-orange-500 border border-slate-100 rounded-xl transition-all"
                                        title="Download Application"
                                      >
                                        <Download size={15} />
                                      </button>
                                      <button onClick={() => handleViewDetails(p)} className="p-2 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-white rounded-xl transition-all">
                                        <Eye size={15} />
                                      </button>
                                      {p.isBlocked ? (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleUnblockProfessional(p._id); }} 
                                          className="p-2 bg-green-50 text-green-500 hover:text-green-600 hover:bg-white rounded-xl transition-all"
                                          title="Unblock Professional"
                                        >
                                          <CheckCircle2 size={15} />
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleBlockProfessional(p._id, 3); }} 
                                          className="p-2 bg-orange-50 text-orange-500 hover:text-orange-600 hover:bg-white rounded-xl transition-all"
                                          title="Block Professional (3 days)"
                                        >
                                          <ShieldAlert size={15} />
                                        </button>
                                      )}
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteProfessional(p._id); }} 
                                        className="p-2 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                        title="Delete Professional Profile"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Platform Users</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Total registered users across the platform</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 ">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                          <th className="pb-3 pl-4">User Identity</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-center">Registered Date</th>
                          <th className="pb-3 text-right pr-4">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.length === 0 ? (
                           <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-semibold uppercase tracking-wider text-[9px]">No user records found</td></tr>
                        ) : (
                          users.map((u) => (
                            <tr 
                              key={u._id} 
                              className="hover:bg-teal-50/50 transition-all group"
                            >
                              <td className="py-3.5 pl-4">
                                <div className="flex items-center gap-3 text-slate-900">
                                  <div className="w-10 min-w-[2.5rem] h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                                    <Shield size={16} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm">{u.name}</div>
                                    <p className="text-[9px] text-teal-600 font-semibold uppercase tracking-wider mt-0.5">@{u.username || 'user'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <span className="text-xs font-semibold text-slate-600">{u.email}</span>
                              </td>
                              <td className="py-3.5">
                                {u.isVerified ? (
                                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-semibold uppercase tracking-wider border border-emerald-100">Verified</span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-md text-[9px] font-semibold uppercase tracking-wider border border-orange-100">Pending OTP</span>
                                )}
                              </td>
                              <td className="py-3.5 text-center">
                                <span className="text-[11px] font-semibold text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="py-3.5 pr-4 text-right">
                                <button 
                                  onClick={() => handleDeleteUser(u._id)} 
                                  className="p-2 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                  title="Delete User Account"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'broadcast' && (
            <div className="max-w-4xl mx-auto h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MessageCenter />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Platform Analytics</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Real-time growth and distribution metrics</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => fetchDashboardData()} className="px-4 py-2 bg-white border border-slate-100 text-teal-600 text-[9px] font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5">
                       <Activity size={12} /> Refresh Data
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Growth Chart */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100  min-h-[350px]">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <TrendingUp size={16} className="text-teal-500" /> Platform Growth
                    </h3>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={categoryData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} dy={10} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100  min-h-[350px]">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Orbit size={16} className="text-orange-500" /> Service Categories
                    </h3>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#0d9488', '#f97316', '#6366f1', '#ec4899', '#8b5cf6', '#f59e0b'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                          />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Status Metrics */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 ">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-blue-500" /> Verification Status Breakdown
                    </h3>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} dy={10} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip 
                             cursor={{fill: '#f8fafc'}}
                             contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                          />
                          <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Live Professional Tracking */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 ">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                         <Activity size={16} className="text-emerald-500" /> Live Professional Tracking
                      </h3>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Free
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Ongoing
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Offline
                        </span>
                      </div>
                    </div>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={liveStatusData}
                          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="status" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} 
                            dy={10} 
                          />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                          <Tooltip 
                             cursor={{fill: '#f8fafc'}}
                             contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                            {liveStatusData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.status === 'Free' ? '#10b981' : 
                                  entry.status === 'Ongoing' ? '#f97316' : 
                                  '#cbd5e1'
                                } 
                                />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Analytics Section */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-100"></div>
                      <h2 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue Analytics</h2>
                      <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Revenue Timeline */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 ">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" /> Revenue (Last 7 Days)
                          </h3>
                          <div className="text-right">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                            <p className="text-lg font-bold text-emerald-600">रू {revenueData.totalRevenue?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="h-[180px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData.timeline}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} dy={10} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                formatter={(value) => [`रू ${value.toLocaleString()}`, 'Revenue']}
                              />
                              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Revenue by Service */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 ">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                          <DollarSign size={16} className="text-blue-500" /> Revenue by Service
                        </h3>
                        <div className="h-[180px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData.categoryRevenue} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" allowDecimals={false} hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} width={80} />
                              <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                formatter={(value) => [`रू ${value.toLocaleString()}`, 'Revenue']}
                              />
                              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Safety Reports</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Manage platform integrity and user disputes</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
                    {['All', 'Pending', 'Resolved', 'Dismissed'].map((status) => (
                       <button
                         key={status}
                         onClick={() => setReportStatusFilter(status)}
                         className={`px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${
                           reportStatusFilter === status 
                             ? 'bg-white text-slate-900' 
                             : 'text-slate-400 hover:text-slate-600'
                         }`}
                       >
                         {status}
                       </button>
                    ))}
                  </div>
                </div>

                {/* Report Tracking Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Reports Received</p>
                    <h3 className="text-2xl font-bold text-slate-900">{reports.length}</h3>
                  </div>
                  <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <p className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider mb-1">Pending Investigation</p>
                    <h3 className="text-2xl font-bold text-orange-600">{reports.filter(r => r.status === 'Pending').length}</h3>
                  </div>
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                    <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Successfully Resolved</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{reports.filter(r => r.status === 'Resolved').length}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100  overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                          <th className="py-3.5 pl-6">Reporter</th>
                          <th className="py-3.5">Target</th>
                          <th className="py-3.5">Reason</th>
                          <th className="py-3.5">Status</th>
                          <th className="py-3.5 text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reports.length === 0 ? (
                           <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-semibold uppercase tracking-wider text-[9px]">No active reports found</td></tr>
                        ) : (
                          reports
                            .filter(r => reportStatusFilter === 'All' || r.status === reportStatusFilter)
                            .map((report) => (
                            <tr key={report._id} className="hover:bg-slate-50 transition-all">
                              <td className="py-3.5 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs font-bold">
                                    {report.reporterModel.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{report.reporter?.firstName || 'Unknown'} {report.reporter?.lastName || ''}</p>
                                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{report.reporterModel}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 text-xs font-bold">
                                    {report.targetModel.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{report.target?.firstName || 'Deleted'} {report.target?.lastName || ''}</p>
                                    <p className="text-[9px] text-rose-400 font-semibold uppercase tracking-wider">{report.targetModel}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <p className="text-sm font-semibold text-slate-700">{report.reason}</p>
                                <p className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">{report.description}</p>
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${
                                  report.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  report.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                  {report.status}
                                </span>
                              </td>
                              <td className="py-3.5 pr-6 text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setAdminReportNote(report.adminNotes || '');
                                    setShowReportModal(true);
                                  }}
                                  className={`px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider rounded-lg transition-all ${
                                    report.status === 'Pending' ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                  }`}
                                >
                                  {report.status === 'Pending' ? 'Review' : 'View Details'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
               </section>
            </div>
          )}

          {activeTab === 'categories' && (() => {
            const handleAddCategory = async (e) => {
              e.preventDefault();
              if (!newCategoryLabel.trim() || !newCategoryValue.trim()) {
                return;
              }
              try {
                const formData = new FormData();
                formData.append('label', newCategoryLabel.trim());
                formData.append('value', newCategoryValue.trim().toLowerCase().replace(/\s+/g, '_'));
                if (newCategoryImage) formData.append('image', newCategoryImage);

                const res = await fetch('/api/categories', {
                  method: 'POST',
                  body: formData,
                });
                const data = await res.json();
                if (data.success) {
                  setNewCategoryLabel('');
                  setNewCategoryValue('');
                  setNewCategoryImage(null);
                  // Reset file input
                  const fileInput = document.getElementById('cat-image-input');
                  if (fileInput) fileInput.value = '';
                  fetchDashboardData();
                } else {
                }
              } catch (err) {
                console.error(err);
              }
            };

            const handleDeleteCategory = async (id) => {
              openConfirm({
                title: 'Delete Category',
                message: 'This will permanently delete this category. Professionals using this category will not be affected. Continue?',
                confirmText: 'Delete Category',
                onConfirm: async () => {
                  try {
                    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                      fetchDashboardData();
                    }
                  } catch (err) {
                    console.error('Delete category error:', err);
                  }
                },
                type: 'danger'
              });
            };

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Service Categories</h1>
                      <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Manage categories available for professional registration</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Category Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100  sticky top-24">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                          <Plus size={16} className="text-teal-500" /> Add New Category
                        </h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                          <div>
                            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Display Label</label>
                            <input
                              type="text"
                              value={newCategoryLabel}
                              onChange={(e) => {
                                setNewCategoryLabel(e.target.value);
                                setNewCategoryValue(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                              }}
                              placeholder="e.g. House Cleaning"
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Value / Slug</label>
                            <input
                              type="text"
                              value={newCategoryValue}
                              onChange={(e) => setNewCategoryValue(e.target.value)}
                              placeholder="e.g. house_cleaning"
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 font-mono"
                              required
                            />
                            <p className="text-[9px] text-slate-400 mt-1">Auto-generated from label. Used internally.</p>
                          </div>

                          {/* Cover Image Upload */}
                          <div>
                            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Cover Image (Optional)</label>
                            <label
                              htmlFor="cat-image-input"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group relative overflow-hidden"
                            >
                              {newCategoryImage ? (
                                <img
                                  src={URL.createObjectURL(newCategoryImage)}
                                  alt="preview"
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-teal-500 transition-colors">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                                    <Plus size={20} />
                                  </div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider">Upload Image</p>
                                  <p className="text-[9px]">JPG, PNG up to 50MB</p>
                                </div>
                              )}
                              <input
                                id="cat-image-input"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="hidden"
                                onChange={(e) => setNewCategoryImage(e.target.files[0] || null)}
                              />
                            </label>
                            {newCategoryImage && (
                              <button
                                type="button"
                                onClick={() => { setNewCategoryImage(null); const f = document.getElementById('cat-image-input'); if(f) f.value=''; }}
                                className="mt-1.5 text-[9px] text-rose-500 hover:text-rose-700 font-semibold uppercase tracking-wider flex items-center gap-1"
                              >
                                <X size={11} /> Remove Image
                              </button>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Plus size={16} /> Add Category
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 ">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Compass size={16} className="text-orange-500" /> Active Categories
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md text-[9px] font-black border border-teal-100">{systemCategories.length}</span>
                          </h3>
                        </div>

                        {systemCategories.length === 0 ? (
                          <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Plus size={28} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Categories Added Yet</p>
                            <p className="text-[10px] text-slate-400 mt-1">Use the form to add your first service category.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {systemCategories.map((cat) => {
                              const imgSrc = cat.image
                                ? (cat.image.startsWith('http') ? cat.image : `/${cat.image.replace(/\\/g, '/')}`)
                                : null;
                              return (
                                <div
                                  key={cat._id}
                                  className="group relative rounded-2xl overflow-hidden border border-slate-100 hover:border-teal-200 transition-all"
                                >
                                  {imgSrc ? (
                                    <div className="h-28 overflow-hidden">
                                      <img src={imgSrc} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                                    </div>
                                  ) : (
                                    <div className="h-28 bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                                      <Compass size={36} className="text-teal-300" />
                                    </div>
                                  )}
                                  <div className={`p-4 ${imgSrc ? 'absolute bottom-0 left-0 right-0 text-white' : 'bg-white'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className={`font-bold text-sm ${imgSrc ? 'text-white' : 'text-slate-900'}`}>{cat.label}</p>
                                        <p className={`text-[9px] font-mono font-semibold mt-0.5 ${imgSrc ? 'text-white/70' : 'text-slate-400'}`}>{cat.value}</p>
                                      </div>
                                      <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditCategoryId(cat._id);
                                          setEditCategoryValue(cat.value);
                                          setEditCategoryLabel(cat.label);
                                          setEditCategoryImage(null);
                                        }}
                                        className="p-1.5 bg-teal-500/90 hover:bg-teal-600 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Edit Category"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(cat._id)}
                                        className="p-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Category"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Edit Category Form (modal) */}
                {editCategoryId && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full">
                      <h3 className="text-lg font-bold mb-4">Edit Category</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Category Value"
                          value={editCategoryValue}
                          onChange={e => setEditCategoryValue(e.target.value)}
                          className="w-full border rounded p-2"
                        />
                        <input
                          type="text"
                          placeholder="Category Label"
                          value={editCategoryLabel}
                          onChange={e => setEditCategoryLabel(e.target.value)}
                          className="w-full border rounded p-2"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setEditCategoryImage(e.target.files[0])}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={async () => {
                            const formData = new FormData();
                            if (editCategoryValue) formData.append('value', editCategoryValue);
                            if (editCategoryLabel) formData.append('label', editCategoryLabel);
                            if (editCategoryImage) formData.append('image', editCategoryImage);
                            try {
                              await adminService.editCategory(editCategoryId, editCategoryValue, editCategoryLabel, editCategoryImage);
                              setEditCategoryId(null);
                              fetchDashboardData();
                            } catch (e) {
                              console.error("Edit category error:", e);
                            }
                          }}
                          className="px-4 py-2 bg-teal-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditCategoryId(null)}
                          className="px-4 py-2 bg-gray-200 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'calendar' && (() => {
            const calendarYear = calendarDate.getFullYear();
            const calendarMonth = calendarDate.getMonth();
            const calendarDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
            const calendarFirstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
            const calendarPrevDaysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
            
            const cells = [];
            
            // Previous month padding days
            for (let i = calendarFirstDayIndex - 1; i >= 0; i--) {
              const day = calendarPrevDaysInMonth - i;
              const prevMonthDate = new Date(calendarYear, calendarMonth - 1, day);
              cells.push({
                date: prevMonthDate,
                isCurrentMonth: false,
                dayNumber: day
              });
            }
            
            // Current month days
            for (let i = 1; i <= calendarDaysInMonth; i++) {
              const currentMonthDate = new Date(calendarYear, calendarMonth, i);
              cells.push({
                date: currentMonthDate,
                isCurrentMonth: true,
                dayNumber: i
              });
            }
            
            // Next month padding days
            const remainingCells = 42 - cells.length;
            for (let i = 1; i <= remainingCells; i++) {
              const nextMonthDate = new Date(calendarYear, calendarMonth + 1, i);
              cells.push({
                date: nextMonthDate,
                isCurrentMonth: false,
                dayNumber: i
              });
            }

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Administrative Scheduler</h1>
                      <p className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Coordinate verifications, audits, and custom reminders</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Month Calendar Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight select-none">
                          {calendarDate.toLocaleString('default', { month: 'long' })} {calendarYear}
                        </h2>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all text-slate-600 hover:text-teal-600 active:scale-95 flex items-center justify-center"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              setCalendarDate(new Date());
                              setSelectedCalendarDate(new Date());
                            }}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-[9px] uppercase tracking-wider rounded-lg transition-all active:scale-95"
                          >
                            Today
                          </button>
                          <button 
                            onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all text-slate-600 hover:text-teal-600 active:scale-95 flex items-center justify-center"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 ">
                        {/* Day Names Header */}
                        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-1">{d}</div>
                          ))}
                        </div>
                        
                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {cells.map((cell, idx) => {
                            const dateStr = getLocalDateString(cell.date);
                            const dayTasks = calendarTasks.filter(t => t.date === dateStr);
                            const isSelected = getLocalDateString(selectedCalendarDate) === dateStr;
                            const isToday = getLocalDateString(new Date()) === dateStr;
                            
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedCalendarDate(cell.date)}
                                className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between border cursor-pointer transition-all active:scale-95 relative group ${
                                  !cell.isCurrentMonth ? 'bg-slate-50/10 border-transparent text-slate-300' :
                                  isSelected ? 'bg-teal-50 border-teal-500/30 ring-2 ring-teal-500/30 text-teal-600' :
                                  isToday ? 'bg-orange-50/50 border-orange-500/30 text-orange-600' :
                                  'bg-slate-50/40 border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                                }`}
                              >
                                <span className={`text-[10px] font-bold select-none ${isToday && !isSelected ? 'text-orange-600' : ''}`}>
                                  {cell.dayNumber}
                                </span>
                                
                                {dayTasks.length > 0 && (
                                  <div className="flex gap-0.5 flex-wrap items-center mt-0.5">
                                    {dayTasks.length <= 2 ? (
                                      dayTasks.map(t => (
                                        <span 
                                          key={t.id} 
                                          className={`w-1 h-1 rounded-full ${
                                            t.completed ? 'bg-slate-300' :
                                            t.category === 'verification' ? 'bg-orange-500' :
                                            t.category === 'maintenance' ? 'bg-blue-500' :
                                            'bg-teal-500'
                                          }`}
                                        />
                                      ))
                                    ) : (
                                      <span className="text-[7px] font-bold uppercase tracking-tight bg-teal-100 text-teal-700 px-0.5 rounded select-none">
                                        +{dayTasks.length}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Task Panel & Reminders */}
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100  space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Administrative Schedule</p>
                            <h3 className="text-base font-bold text-slate-900 select-none">
                              {selectedCalendarDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                            <Calendar size={14} />
                          </div>
                        </div>
                        
                        {/* Active Date Tasks List */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {calendarTasks.filter(t => t.date === getLocalDateString(selectedCalendarDate)).length === 0 ? (
                            <div className="text-center py-8">
                              <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider select-none">No activities scheduled</p>
                            </div>
                          ) : (
                            calendarTasks
                              .filter(t => t.date === getLocalDateString(selectedCalendarDate))
                              .map(task => (
                                <div 
                                  key={task.id} 
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 group transition-all ${
                                    task.completed ? 'bg-slate-50/50 border-slate-50 text-slate-400' : 'bg-slate-50 border-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      checked={task.completed}
                                      onChange={() => handleToggleCalendarTask(task.id)}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 cursor-pointer"
                                    />
                                    <div>
                                      <p className={`text-[11px] font-bold ${task.completed ? 'line-through' : 'text-slate-800'}`}>{task.title}</p>
                                      <span className={`text-[7px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded mt-0.5 inline-block ${
                                        task.category === 'verification' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                        task.category === 'maintenance' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
                                        'bg-teal-100 text-teal-600 border border-teal-200'
                                      }`}>
                                        {task.category}
                                      </span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteCalendarTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg shadow-sm transition-all"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                          )}
                        </div>

                        {/* Task Creation Form */}
                        <form onSubmit={handleAddCalendarTask} className="pt-3 border-t border-slate-100 space-y-3">
                          <div>
                            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">New Event / Reminder</label>
                            <input 
                              type="text" 
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="E.g. Database backup..." 
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                              <select 
                                value={newTaskCategory}
                                onChange={(e) => setNewTaskCategory(e.target.value)}
                                className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-slate-600 focus:outline-none transition-all cursor-pointer hover:bg-slate-100"
                              >
                                <option value="verification">Verification</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="custom">Custom Task</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button 
                                type="submit"
                                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[9px] uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                              >
                                <Plus size={12} /> Add Event
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            );
          })()}
        </div>
      </main>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Professional Details Modal */}
      {showDetailsModal && selectedProfessional && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                  {selectedProfessional.profileImage ? (
                    <img 
                      src={selectedProfessional.profileImage.startsWith('http') ? selectedProfessional.profileImage : `/${selectedProfessional.profileImage.replace(/\\/g, '/')}`} 
                      className="w-full h-full object-cover" 
                      alt={`${selectedProfessional.firstName} ${selectedProfessional.lastName}`}
                    />
                  ) : <Users size={28} className="text-teal-500" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedProfessional.firstName} {selectedProfessional.lastName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedProfessional.verificationStatus} />
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                      selectedProfessional.liveStatus === 'Ongoing' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      selectedProfessional.liveStatus === 'Offline' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {selectedProfessional.liveStatus === 'Ongoing' && <Lightbulb size={11} className="animate-pulse" fill="currentColor" />}
                      {(selectedProfessional.liveStatus === 'Free' || !selectedProfessional.liveStatus) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {selectedProfessional.liveStatus || 'Free'}
                    </span>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">@{selectedProfessional.username}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadPDF(selectedProfessional)}
                  className="p-3 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100"
                  title="Export to PDF"
                >
                  <Download size={24} />
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-10 max-h-[70vh] overflow-y-auto space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Email</p>
                  <p className="font-bold text-slate-900">{selectedProfessional.email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</p>
                  <p className="font-bold text-slate-900">{selectedProfessional.phone}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Category</p>
                  <p className="font-bold text-slate-900 capitalize">{selectedProfessional.serviceCategory}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hourly Wage</p>
                  <p className="font-bold text-slate-900">रू {selectedProfessional.hourlyWage}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gender</p>
                  <p className="font-bold text-slate-900">{selectedProfessional.gender || 'Not specified'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Service Done</p>
                  <p className="font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {selectedProfessional.completedJobs || 0} {selectedProfessional.completedJobs === 1 ? 'Service' : 'Services'} Completed
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Behavior Reports</p>
                  <p className="font-bold text-rose-600 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {selectedProfessional.totalReports || 0} Reported {selectedProfessional.totalReports === 1 ? 'Incident' : 'Incidents'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Auditing</p>
                <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Formatted Address</p>
                    <p className="text-sm font-medium text-slate-700">{selectedProfessional.formattedAddress || selectedProfessional.serviceArea}</p>
                  </div>
                  <div className="grid grid-cols-1">
                    <div className="p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Address</p>
                      <p className="text-sm font-mono font-bold text-teal-600">{selectedProfessional.formattedAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional Bio</p>
                <p className="text-slate-600 leading-relaxed text-sm italic bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  "{selectedProfessional.bio || 'No biography provided.'}"
                </p>
              </div>

              {selectedProfessional.availability && selectedProfessional.availability.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Availability</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProfessional.availability.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-3xl group hover:border-orange-200 transition-all">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-100 group-hover:scale-110 transition-transform">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{slot.day}</p>
                          <p className="text-sm font-bold text-orange-600 tracking-tight">{slot.startTime} - {slot.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Credentials</p>
                <div className="space-y-3">
                  {selectedProfessional.verificationDocuments && selectedProfessional.verificationDocuments.length > 0 ? (
                    selectedProfessional.verificationDocuments.map((doc, idx) => {
                      const isPreviewing = previewDocId === doc._id;
                      const isImage = doc.mimetype?.startsWith('image/');
                      const docUrl = doc.path.startsWith('http') ? doc.path : `/${doc.path.replace(/\\/g, '/')}`;

                      return (
                        <div key={idx} className="space-y-2">
                          <div 
                            className={`flex items-center justify-between p-4 bg-white border ${isPreviewing ? 'border-teal-500 shadow-md' : 'border-slate-100'} rounded-2xl transition-all group`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${isPreviewing ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'} rounded-xl flex items-center justify-center transition-colors`}>
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{doc.originalName || 'Credential Document'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.mimetype?.split('/')[1]?.toUpperCase()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isImage && (
                                <button 
                                  onClick={() => setPreviewDocId(isPreviewing ? null : doc._id)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isPreviewing 
                                      ? 'bg-slate-900 text-white' 
                                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                                  }`}
                                >
                                  {isPreviewing ? 'Hide Preview' : 'View Image'}
                                </button>
                              )}
                              <a 
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                title="Open in new tab"
                              >
                                <Orbit size={16} />
                              </a>
                            </div>
                          </div>

                          {isPreviewing && isImage && (
                            <div className="relative rounded-3xl overflow-hidden border-2 border-teal-500/20 bg-slate-900 group animate-in slide-in-from-top-2 duration-300">
                              <img 
                                src={docUrl} 
                                className="w-full h-auto max-h-[500px] object-contain mx-auto" 
                                alt="Document Preview" 
                              />
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setPreviewDocId(null)}
                                  className="p-2 bg-white/90 backdrop-blur rounded-xl text-rose-500 hover:bg-white transition-all"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedProfessional.verificationStatus === 'pending' && (
                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleApprove(selectedProfessional._id); }}
                    className="flex-1 py-4 bg-teal-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all"
                  >
                    Approve Application
                  </button>
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleReject(selectedProfessional._id); }}
                    className="flex-1 py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isSubmitting && setShowRejectionModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Decline Registration</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Professional: {selectedProfessional?.firstName}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason for Rejection</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete documentation, service area not supported..."
                  className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmRejection}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="w-full py-4 bg-rose-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em]  hover:bg-rose-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                </button>
              <button 
                  onClick={() => setShowRejectionModal(false)}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-50 text-slate-600 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium">This reason will be sent to the user's notifications.</p>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowNotificationModal(false)}></div>
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${
            darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-teal-500" />
                <h2 className={`font-bold text-lg ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Notifications
                </h2>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-orange-500 text-white rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-slate-400 hover:bg-slate-800' 
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications List */}
            <div className={`max-h-[500px] overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
              {notifications && notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleNotificationClick(notification._id);
                        setShowNotificationModal(false);
                      }}
                      className={`p-4 cursor-pointer transition-colors ${
                        !notification.read
                          ? darkMode
                            ? 'bg-slate-800/50 hover:bg-slate-800'
                            : 'bg-teal-50 hover:bg-teal-100'
                          : darkMode
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-green-100 text-green-600'
                            : notification.type === 'error'
                            ? 'bg-red-100 text-red-600'
                            : notification.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.type === 'success' && '✓'}
                          {notification.type === 'error' && '✕'}
                          {notification.type === 'warning' && '!'}
                          {notification.type === 'info' && 'i'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${
                            darkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className={`text-[10px] mt-2 ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Report Review Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowReportModal(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
                <div className="flex items-center gap-4 text-rose-600">
                  <ShieldAlert size={32} />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Report Review</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-0.5">Reference ID: #{selectedReport._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"><X size={20} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reporter ({selectedReport.reporterModel})</p>
                    <p className="font-black text-slate-900">{selectedReport.reporter?.firstName} {selectedReport.reporter?.lastName}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedReport.reporter?.email}</p>
                  </div>
                  <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Reported ({selectedReport.targetModel})</p>
                    <p className="font-black text-slate-900">{selectedReport.target?.firstName} {selectedReport.target?.lastName}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedReport.target?.email}</p>
                    {selectedReport.targetModel === 'Professional' && (
                      <div className="mt-3 pt-3 border-t border-rose-100">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                          <AlertTriangle size={10} /> Behavior History: {selectedReport.target?.totalReports || 0} Reports
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Details</p>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle size={16} />
                      <p className="text-sm font-black uppercase tracking-widest">{selectedReport.reason}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedReport.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Notes</p>
                  <textarea 
                    value={adminReportNote}
                    onChange={(e) => setAdminReportNote(e.target.value)}
                    placeholder="Document your investigation or decision here..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
                    rows="4"
                  />
                </div>
              </div>

              {selectedReport.status === 'Pending' ? (
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-4">
                  <button 
                    onClick={async () => {
                      try {
                        await adminService.updateReportStatus(selectedReport._id, { status: 'Resolved', adminNotes: adminReportNote });
                        setShowReportModal(false);
                        fetchDashboardData();
                      } catch (err) { 
                        console.error('Action failed:', err);
                      }
                    }}
                    className="flex-1 min-w-[140px] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all "
                  >
                    Mark as Resolved
                  </button>

                  {selectedReport.targetModel === 'Professional' && (
                    <button 
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to block ${selectedReport.target?.firstName} for 3 days?`)) {
                          try {
                            await adminService.blockProfessional(selectedReport.target._id, 3);
                            await adminService.updateReportStatus(selectedReport._id, { 
                              status: 'Resolved', 
                              adminNotes: `ACTION: BLOCKED FOR 3 DAYS. ${adminReportNote}` 
                            });
                            setShowReportModal(false);
                            fetchDashboardData();
                          } catch (err) { 
                            console.error('Blocking failed:', err);
                          }
                        }
                      }}
                      className="flex-1 min-w-[140px] py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all "
                    >
                      Block (3 Days)
                    </button>
                  )}

                  <button 
                    onClick={async () => {
                      try {
                        await adminService.updateReportStatus(selectedReport._id, { status: 'Dismissed', adminNotes: adminReportNote });
                        setShowReportModal(false);
                        fetchDashboardData();
                      } catch (err) { 
                        console.error('Action failed:', err);
                      }
                    }}
                    className="flex-1 min-w-[140px] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                  >
                    Dismiss Report
                  </button>
                </div>
              ) : (
                <div className="p-8 border-t border-slate-100 bg-emerald-50/30 flex items-center justify-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                     <CheckCircle size={16} /> Resolution Finalized on {selectedReport.resolvedAt ? new Date(selectedReport.resolvedAt).toLocaleDateString() : 'recently'}
                   </p>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;
