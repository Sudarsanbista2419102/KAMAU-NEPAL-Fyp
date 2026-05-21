import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from 'axios';
import {
  X, Menu, Search, Bell, Zap, Compass, Target, Orbit, Eye,
  Power, SwitchCamera, Cpu, Activity, ChevronRight,
  MessageSquare, DollarSign, User, Mail, Phone, MapPin, UserCircle, ShieldCheck, HelpCircle, ChevronLeft, ShieldAlert,
  Download, TrendingUp
} from 'lucide-react';

import OptimizedImage from '../components/OptimizedImage';
import { useTranslation } from '../utils/LanguageContext';
import { getUnreadCount } from '../services/messageService';
import toast from 'react-hot-toast';

// Components
import Logo from '../Logo';
import NotificationsMenu from '../components/NotificationsMenu';
import StatsCards from './components/StatsCards';
import RequestsList from './components/RequestsList';
import ProfessionalMessages from './components/ProfessionalMessages';
import CustomerMap from './components/CustomerMap';
import EditProfileModal from './components/EditProfileModal';

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [professionalData, setProfessionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [earningsTimeframe, setEarningsTimeframe] = useState('monthly');
  const [earningsSearch, setEarningsSearch] = useState('');
  const [earningsPaymentFilter, setEarningsPaymentFilter] = useState('All');

  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0,
    totalReviews: 0
  });
  const [allRequests, setAllRequests] = useState([]);

  // Memoized fetch function for real-time updates
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const profileResponse = await axios.get('/api/professionals/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const proData = profileResponse.data.data;
        setProfessionalData(proData);
        localStorage.setItem('professionalId', proData._id);

        const [statsRes, bookingsRes] = await Promise.all([
          axios.get(`/api/bookings/professional/${proData._id}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/bookings/professional/${proData._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (bookingsRes.data.success) setAllRequests(bookingsRes.data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refetchTrigger]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        if (response.success) {
          setUnreadCount(response.count);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    
    window.addEventListener('refreshUnreadCount', fetchUnreadCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', fetchUnreadCount);
    };
  }, []);

  const handleBookingAction = async (bookingId, newStatus, notes = "") => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/bookings/${bookingId}`, {
        status: newStatus,
        notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Trigger instant refresh
        setRefetchTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleImageUpdate = async (type, file) => {
    if (!file || !professionalData?._id) return;
    
    setIsUpdatingImage(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/professionals/${professionalData._id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfessionalData(response.data.data);
        toast.success(`${type === 'profileImage' ? 'Profile' : 'Cover'} photo updated successfully!`);
      }
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      toast.error(`Failed to update ${type}`);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleDownloadPDF = (request) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 118, 110); // Kamau Teal
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KAMAU NEPAL', 15, 20);
    doc.setFontSize(10);
    doc.text('CUSTOMER SERVICE RECORD', 15, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 160, 28);

    // Customer Information Section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.text('1. CUSTOMER IDENTITY & CONTACT', 15, 55);
    
    const customerData = [
      ['Full Name', request.fullName || 'N/A'],
      ['Email Address', request.userId?.email || 'N/A'],
      ['Phone Number', request.userId?.phone || 'N/A'],
      ['Service Location', request.location || 'N/A'],
      ['Booking Status', request.status.toUpperCase()]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: customerData,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 15 }
    });

    // Service Description Section
    doc.setFontSize(14);
    doc.text('2. SERVICE DETAILS', 15, doc.lastAutoTable.finalY + 15);
    
    const serviceData = [
      ['Service Category', request.serviceTitle || 'N/A'],
      ['Work Description', request.workDescription || 'N/A'],
      ['Scheduled Date', new Date(request.bookingDate).toLocaleDateString()],
      ['Time Slot', request.timeSchedule || 'N/A'],
      ['Service Fee', request.totalCost || 'N/A']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Information']],
      body: serviceData,
      theme: 'striped',
      headStyles: { fillColor: [45, 212, 191] },
      margin: { left: 15 },
      columnStyles: {
        1: { cellWidth: 120 } // Give more space to description
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Kamau Nepal Service Platform - Confidential Document - Page ${i} of ${pageCount}`,
        15,
        285
      );
    }

    doc.save(`Customer_Record_${request.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: t('overview'), icon: Compass, badge: null },
    { id: 'requests', label: t('service_requests'), icon: Target, badge: stats.pendingRequests || null },
    { id: 'map', label: t('service_map'), icon: Orbit, badge: allRequests.filter(r => ['Pending', 'Confirmed', 'In Progress'].includes(r.status)).length || null },
    { id: 'messages', label: t('messages'), icon: MessageSquare, badge: unreadCount || null },
    { id: 'earnings', label: t('earnings'), icon: Orbit, badge: null },
    { id: 'profile', label: t('public_profile'), icon: Eye, badge: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin shadow-md"></div>
          <Zap className="w-8 h-8 text-teal-600 animate-pulse absolute top-6" />
          <p className="text-slate-500 text-xs font-mono animate-pulse">Synchronizing Data...</p>
        </div>
      </div>
    );
  }

  // --- Render Sections ---

  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <StatsCards stats={stats} />

      <div>
        <RequestsList
          title="Recent Activity"
          requests={allRequests.filter(r => r.status === 'Pending').slice(0, 3)}
          onAction={handleBookingAction}
          onDownloadPDF={handleDownloadPDF}
          loading={false}
          error={null}
        />
        {allRequests.filter(r => r.status === 'Pending').length > 3 && (
          <button
            onClick={() => setActiveTab('requests')}
            className="mt-6 w-full py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-teal-600 hover:border-teal-100 hover:bg-teal-50/30 transition-all group"
          >
            View All Pending Missions <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <RequestsList
        title="Command Center: Service Requests"
        requests={allRequests}
        onAction={handleBookingAction}
        onDownloadPDF={handleDownloadPDF}
        loading={false}
        error={null}
      />
    </div>
  );

  const renderMap = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CustomerMap 
        bookings={allRequests.filter(r => ['Pending', 'Confirmed', 'In Progress'].includes(r.status))} 
        professionalLocation={professionalData?.location}
      />
    </div>
  );

  const renderMessages = () => (
    <ProfessionalMessages />
  );

  const renderEarnings = () => {
    // 1. Helper to parse Nepalese Rupee string to numeric value
    const parseCost = (costStr) => {
      if (!costStr) return 0;
      // Extract numbers, decimal point
      const amount = parseFloat(costStr.replace(/[^\d.]/g, '')) || 0;
      return amount;
    };

    // 2. Filter completed bookings
    const completedBookings = allRequests.filter(r => r.status === 'Completed');

    // 3. Compute stats
    const totalEarningsVal = completedBookings.reduce((sum, b) => sum + parseCost(b.totalCost), 0);
    const paidEarningsVal = completedBookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + parseCost(b.totalCost), 0);
    const pendingEarningsVal = completedBookings
      .filter(b => b.paymentStatus !== 'Paid')
      .reduce((sum, b) => sum + parseCost(b.totalCost), 0);
    const completedMissionsCount = completedBookings.length;

    // 4. Timeframe calculations
    const getChartData = () => {
      let data = [];
      let labels = [];

      if (earningsTimeframe === 'weekly') {
        // Last 7 days including today
        const days = [];
        const lang = localStorage.getItem('language') || 'en';
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d);
        }

        const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const neDays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

        labels = days.map(d => {
          const dayIdx = d.getDay();
          return lang === 'ne' ? neDays[dayIdx] : enDays[dayIdx];
        });

        data = days.map(d => {
          const dateStr = d.toDateString();
          const dayBookings = completedBookings.filter(b => {
            const bDateObj = new Date(b.bookingDate);
            return bDateObj.toDateString() === dateStr;
          });
          return dayBookings.reduce((sum, b) => sum + parseCost(b.totalCost), 0);
        });

      } else if (earningsTimeframe === 'monthly') {
        // 12 months of the current year
        const lang = localStorage.getItem('language') || 'en';
        const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const neMonthsGreg = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्त', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
        
        labels = lang === 'ne' ? neMonthsGreg : enMonths;

        const currentYear = new Date().getFullYear();
        data = Array(12).fill(0).map((_, mIdx) => {
          const monthBookings = completedBookings.filter(b => {
            const bDate = new Date(b.bookingDate);
            return bDate.getFullYear() === currentYear && bDate.getMonth() === mIdx;
          });
          return monthBookings.reduce((sum, b) => sum + parseCost(b.totalCost), 0);
        });

      } else if (earningsTimeframe === 'annual') {
        // Last 5 years
        const currentYear = new Date().getFullYear();
        labels = [];
        for (let i = 4; i >= 0; i--) {
          labels.push((currentYear - i).toString());
        }

        data = labels.map(yearStr => {
          const yearInt = parseInt(yearStr);
          const yearBookings = completedBookings.filter(b => {
            const bDate = new Date(b.bookingDate);
            return bDate.getFullYear() === yearInt;
          });
          return yearBookings.reduce((sum, b) => sum + parseCost(b.totalCost), 0);
        });
      }

      return { labels, data };
    };

    const { labels: chartLabels, data: chartValues } = getChartData();
    const maxChartValue = Math.max(...chartValues, 1);

    // 5. Filter & Search completed bookings for history list
    const filteredCompletedBookings = completedBookings.filter(b => {
      const searchLower = earningsSearch.toLowerCase();
      const matchesSearch = 
        (b.fullName && b.fullName.toLowerCase().includes(searchLower)) ||
        (b.serviceTitle && b.serviceTitle.toLowerCase().includes(searchLower)) ||
        (b.totalCost && b.totalCost.toLowerCase().includes(searchLower));

      let matchesPayment = true;
      if (earningsPaymentFilter === 'Paid') {
        matchesPayment = b.paymentStatus === 'Paid';
      } else if (earningsPaymentFilter === 'Unpaid') {
        matchesPayment = b.paymentStatus !== 'Paid';
      }

      return matchesSearch && matchesPayment;
    });

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Micro Stats Cards for Earnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'LIFETIME REVENUE',
              value: `रू ${totalEarningsVal.toLocaleString()}`,
              sub: 'All time completed earnings',
              icon: DollarSign,
              color: 'from-slate-700 to-slate-900',
              badge: 'Gross Value'
            },
            {
              label: 'PAID EARNINGS',
              value: `रू ${paidEarningsVal.toLocaleString()}`,
              sub: 'Settled & cleared transactions',
              icon: ShieldCheck,
              color: 'from-emerald-500 to-emerald-600',
              badge: 'Settled'
            },
            {
              label: 'PENDING PAYOUTS',
              value: `रू ${pendingEarningsVal.toLocaleString()}`,
              sub: 'Unpaid / Cash in transit',
              icon: Activity,
              color: 'from-amber-500 to-amber-600',
              badge: 'Pending'
            },
            {
              label: 'COMPLETED MISSIONS',
              value: completedMissionsCount,
              sub: 'Total tasks fully delivered',
              icon: Target,
              color: 'from-indigo-500 to-indigo-600',
              badge: 'Deliveries'
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="relative bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md overflow-hidden group transition-all">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{card.badge}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1 relative z-10">{card.value}</p>
                <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase relative z-10">{card.label}</p>
                <p className="text-[10px] text-slate-400 relative z-10 mt-1">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Chart Container */}
        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{t('monthly_revenue')}</p>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter flex items-baseline gap-2">
                रू {totalEarningsVal.toLocaleString()}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">LIFETIME</span>
              </h3>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {[
                { id: 'weekly', label: t('weekly') },
                { id: 'monthly', label: t('monthly') },
                { id: 'annual', label: t('annual') }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setEarningsTimeframe(p.id)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    earningsTimeframe === p.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart */}
          {chartValues.some(val => val > 0) ? (
            <div>
              <div className="h-64 flex items-end gap-3 md:gap-4 px-4 border-b border-slate-50 pb-2">
                {chartValues.map((val, i) => {
                  const h = (val / maxChartValue) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-xl group relative cursor-pointer hover:from-teal-500 hover:to-teal-300 transition-all duration-300 hover:scale-105"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    >
                      {/* Interactive Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20 border border-slate-800 pointer-events-none whitespace-nowrap">
                        रू {val.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                {chartLabels.map((lbl, idx) => (
                  <span key={idx} className="w-12 text-center">{lbl}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 p-8 text-center">
              <TrendingUp className="text-slate-300 w-12 h-12 mb-3 animate-pulse" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">No completed service records found</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Earnings will visualize once your sessions are finalized and paid.</p>
            </div>
          )}
        </div>

        {/* Detailed Ledger Section */}
        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-2xl font-black tracking-tight text-slate-900">Earnings History & Invoices</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time ledger of completed services</p>
            </div>
            
            {/* Search & Payment Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search customer or service..."
                  value={earningsSearch}
                  onChange={(e) => setEarningsSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/30 transition-all w-full sm:w-56"
                />
              </div>

              <select
                value={earningsPaymentFilter}
                onChange={(e) => setEarningsPaymentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/30 transition-all cursor-pointer"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid/Pending</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {filteredCompletedBookings.length > 0 ? (
            <div className="overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-4.5 px-6">Customer</th>
                    <th className="py-4.5 px-6">Service</th>
                    <th className="py-4.5 px-6">Date</th>
                    <th className="py-4.5 px-6">Earning</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6">Method</th>
                    <th className="py-4.5 px-6 text-right">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {filteredCompletedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 px-6 font-bold text-slate-900">{b.fullName}</td>
                      <td className="py-5 px-6 font-bold text-slate-700">{b.serviceTitle}</td>
                      <td className="py-5 px-6 text-slate-400 tracking-tight">{new Date(b.bookingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="py-5 px-6 font-black text-slate-900">{b.totalCost}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {b.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-bold text-slate-500 uppercase tracking-widest text-[10px]">{b.paymentMethod || 'None'}</td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => handleDownloadPDF(b)}
                          className="p-2 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all inline-flex items-center justify-center hover:scale-105 border border-slate-100 hover:border-teal-100"
                          title="Download Invoice PDF"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 text-center">
              <Search className="text-slate-300 w-10 h-10 mb-3 animate-pulse" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">No matching transaction records</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Try relaxing your search terms or filter constraints.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-0 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover Image Section */}
        <div className="h-48 relative bg-slate-100 group">
          {professionalData?.coverImage ? (
            <OptimizedImage 
              src={professionalData.coverImage} 
              className="w-full h-full" 
              alt="Cover" 
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal-600/20 to-orange-600/20 flex items-center justify-center">
              <Compass className="text-teal-600/30 w-12 h-12" />
            </div>
          )}
          <button 
            onClick={() => document.getElementById('cover-upload').click()}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white"
            disabled={isUpdatingImage}
          >
            <SwitchCamera size={14} className="text-teal-600" /> {isUpdatingImage ? t('loading') : t('change_cover')}
          </button>
          <input 
            type="file" 
            id="cover-upload" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleImageUpdate('coverImage', e.target.files[0])}
          />
        </div>

        <div className="p-10 -mt-16 relative">
          <div className="flex items-end gap-8 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-white border-4 border-white shadow-2xl overflow-hidden">
                {professionalData?.profileImage ? (
                  <OptimizedImage 
                    src={professionalData.profileImage} 
                    className="w-full h-full" 
                    alt="Profile" 
                    fallbackIcon={UserCircle}
                  />
                ) : <div className="w-full h-full flex items-center justify-center text-4xl text-teal-600 font-black">{professionalData?.firstName?.charAt(0)}</div>}
              </div>
              <button 
                onClick={() => document.getElementById('profile-upload').click()}
                className="absolute bottom-2 right-2 p-2 bg-teal-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                disabled={isUpdatingImage}
              >
                <Cpu size={16} />
              </button>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpdate('profileImage', e.target.files[0])}
              />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">{professionalData?.firstName} {professionalData?.lastName}</h3>
              <p className="text-teal-600 font-bold uppercase tracking-widest text-xs mt-1">{professionalData?.serviceCategory} Specialist</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><MapPin size={14} className="text-rose-500" /> {professionalData?.serviceArea}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Activity size={14} className="text-emerald-500" /> {professionalData?.verificationStatus}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Full Identity', value: `${professionalData?.firstName} ${professionalData?.lastName}`, icon: User },
              { label: 'Communication Link', value: 'Verified Secure Email', icon: Mail },
              { label: 'Contact Frequency', value: 'High Performance', icon: Phone },
              { label: 'Base Priority', value: (professionalData?.hourlyWage || 0) + ' / hr', icon: DollarSign },
            ].map((field, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <field.icon size={12} className="text-teal-600" /> {field.label}
                </p>
                <p className="text-sm font-black text-slate-900">{field.value}</p>
              </div>
            ))}
          </div>

          {professionalData?.verificationStatus === 'verified' ? (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="mt-12 w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-teal-600 shadow-xl transition-all active:scale-[0.98]"
            >
              {t('modify_records')}
            </button>
          ) : (
            <div className="mt-12 p-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
              <ShieldCheck size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {t('profile_editing_locked')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                {t('status')}: {professionalData?.verificationStatus || t('pending_app')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden relative">
      {/* Visual background details */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"><Menu size={22} /></button>
          <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
              title="Go Back"
          >
              <ChevronLeft size={20} />
          </button>
          <Logo className="opacity-90 hover:opacity-100 transition-opacity" />
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <input type="text" placeholder="Access  records..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 transition-all placeholder:text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <Bell size={24} />
            </button>
            <NotificationsMenu
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-black text-lg overflow-hidden shadow-sm shadow-teal-100">
              {professionalData?.profileImage ? (
                <OptimizedImage
                  src={professionalData.profileImage}
                  className="w-full h-full"
                  alt="Profile"
                  fallbackIcon={UserCircle}
                />
              ) : (
                professionalData?.firstName?.charAt(0) || 'P'
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-2xl border-r border-slate-200 transform transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl pt-16 lg:pt-0`}>
          <div className="h-full flex flex-col p-6 relative">
            <div className="flex items-center justify-between mb-10 relative lg:hidden">
              <Logo className="opacity-90 hover:opacity-100 transition-opacity" />
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <nav className="flex-1 space-y-2 relative">
              {menuItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'text-teal-700 bg-teal-50 shadow-sm border border-teal-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                  <item.icon size={20} className={activeTab === item.id ? 'text-teal-600' : 'group-hover:text-teal-600 transition-colors'} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  {item.badge && <span className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-black bg-teal-100 text-teal-700">{item.badge}</span>}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-6 border-t border-slate-100 relative">
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all border border-orange-100 group">
                <SwitchCamera size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('user_mode')}</span>
              </button>
              <button onClick={() => navigate('/help')} className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-500 hover:bg-slate-50 transition-all group">
                <HelpCircle size={18} className="group-hover:text-teal-600 transition-colors" />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('help')}</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                <Power size={18} />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('disconnect_session')}</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto h-full relative scroll-smooth overflow-x-hidden">
          <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
            <header className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
                {activeTab === 'overview' ? t('pro_overview') : menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Kamau   &bull; Session Active
              </p>
            </header>

            {professionalData?.isBlocked && (
              <div className="bg-rose-50 border border-rose-200 p-8 rounded-[40px] animate-in slide-in-from-top-4 duration-500 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Account Suspended</h3>
                    <p className="text-sm font-bold text-rose-600 mt-1">
                      Your professional services are temporarily blocked until {new Date(professionalData.blockedUntil).toLocaleDateString()}.
                    </p>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2">
                      REASON: Multiple behavior reports identified by administration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'map' && renderMap()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'earnings' && renderEarnings()}
            {activeTab === 'profile' && renderProfile()}
          </div>
          
          <EditProfileModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            professionalData={professionalData}
            onUpdate={(newData) => {
              setProfessionalData(newData);
              setRefetchTrigger(prev => prev + 1);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
