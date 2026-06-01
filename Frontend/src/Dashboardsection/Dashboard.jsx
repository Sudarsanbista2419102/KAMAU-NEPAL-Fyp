import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Menu,
  X,
  Bell,
  Briefcase,
  Users,
  Calendar,
  Star,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  UserCircle,
  ChevronLeft,
} from "lucide-react";

import Logo from "../Logo";
import { addTakenService } from "../services/storage";
import { createBooking, getUserBookings } from "../bookingService";
import NotificationsMenu from "../components/NotificationsMenu";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../utils/LanguageContext";
import OptimizedImage from "../components/OptimizedImage";
import { getUnreadCount } from "../services/messageService";

const Dashboard = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showHireForm, setShowHireForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    type: 'danger' 
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const openConfirm = (config) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  const [messageFormData, setMessageFormData] = useState({
    subject: "",
    message: "",
  });
  const [messageFormErrors, setMessageFormErrors] = useState({});

  const [hireFormData, setHireFormData] = useState({
    fullName: "",
    workDescription: "",
    timeSchedule: "",
    bookingDate: new Date().toISOString().split('T')[0],
    location: "",
  });
  const [hireFormErrors, setHireFormErrors] = useState({});

  const [userData, setUserData] = useState({
    name: localStorage.getItem("userName") || "Professional User",
    email: localStorage.getItem("userEmail") || "user@kamaunepal.com",
    location: localStorage.getItem("userLocation") || "Not set",
  });

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        let endpoint = `/api/users/${userId}/profile`;
        // Check if professional route or user route should be used
        if (userRole === "professional") {
          endpoint = `/api/professionals/${userId}`;
        }

        const response = await axios.get(endpoint);
        const data = userRole === "professional" ? response.data.data : response.data.user;

        if (data) {
          const fetchedLocation = data.formattedAddress || (typeof data.location === 'string' ? data.location : "Not set");
          const fetchedName = data.name || data.username || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : userData.name);
          const fetchedEmail = data.email || userData.email;

          setUserData({
            name: fetchedName,
            email: fetchedEmail,
            location: fetchedLocation
          });

          // Sync localStorage
          localStorage.setItem("userName", fetchedName);
          localStorage.setItem("userEmail", fetchedEmail);
          if (fetchedLocation && fetchedLocation !== "Not set") {
            localStorage.setItem("userLocation", fetchedLocation);
          }
        }
      } catch (error) {
        console.error("Error syncing dashboard profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId, userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const [bookingStats, setBookingStats] = useState({
    servicesTaken: 0,
    providersMet: 0,
    scheduled: 0,
    totalSpent: 0,
    changeTaken: "+0",
    changeMet: "+0",
    changeScheduled: "Active",
    changeSpent: "+0"
  });

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!userId) return;
      try {
        const bookingsData = await getUserBookings(userId);
        const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || []);
        
        if (bookings.length > 0) {
          const completed = bookings.filter(b => b.status === "Completed");
          const scheduled = bookings.filter(b => ["Pending", "Confirmed", "In Progress"].includes(b.status));
          const providers = new Set(completed.map(b => b.serviceProvider));
          
          // Calculate total spent
          const total = completed.reduce((acc, curr) => {
            // Remove 'रू' and any other non-numeric chars except decimal point
            const priceStr = curr.totalCost || "0";
            const priceNum = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
            return acc + priceNum;
          }, 0);

          // Calculate changes (mocked or based on recent bookings)
          // For now we'll show meaningful placeholders or use logic if timestamps available
          const recentThreshold = new Date();
          recentThreshold.setDate(recentThreshold.getDate() - 7);
          
          const recentCompleted = completed.filter(b => new Date(b.updatedAt) > recentThreshold).length;
          const recentProviders = new Set(completed.filter(b => new Date(b.updatedAt) > recentThreshold).map(b => b.serviceProvider)).size;

          setBookingStats({
            servicesTaken: completed.length,
            providersMet: providers.size,
            scheduled: scheduled.length,
            totalSpent: total,
            changeTaken: `+${recentCompleted}`,
            changeMet: `+${recentProviders}`,
            changeScheduled: scheduled.length > 0 ? "Active" : "None",
            changeSpent: total > 0 ? `+${(total * 0.05).toFixed(0)}` : "+0" // Mocking 5% growth for visual flair
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchBookingData();
  }, [userId]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await getUnreadCount();
        if (response.success) {
          setUnreadCount(response.count);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Check every 30 seconds
    
    // Listen for custom refresh events
    window.addEventListener('refreshUnreadCount', fetchUnread);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', fetchUnread);
    };
  }, []);

  const user = {
    name: userData.name,
    email: userData.email,
    location: userData.location,
    role: userRole || "",
    joinDate: "Jan 2024",
  };

  const userProfileImage = localStorage.getItem("userProfileImage");

  const getInitials = (name) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "UN"
    );
  };

  const stats = [
    {
      label: t('history'),
      value: bookingStats.servicesTaken.toString(),
      change: bookingStats.changeTaken,
      changeLabel: 'This week',
      icon: Briefcase,
      color: "bg-blue-500",
    },
    { 
      label: t('providers_met'), 
      value: bookingStats.providersMet.toString(), 
      change: bookingStats.changeMet, 
      changeLabel: 'New',
      icon: Users, 
      color: "bg-green-500" 
    },
    {
      label: t('scheduled'),
      value: bookingStats.scheduled.toString(),
      change: bookingStats.changeScheduled,
      changeLabel: bookingStats.changeScheduled === 'Active' ? '' : '',
      icon: Calendar,
      color: "bg-purple-500",
    },
    { 
      label: t('total_spent'), 
      value: `रू ${bookingStats.totalSpent.toLocaleString()}`, 
      change: bookingStats.totalSpent > 0 ? 'Paid' : 'No spend',
      changeLabel: '',
      icon: DollarSign, 
      color: "bg-orange-500" 
    },
  ];


  const [recentJobs, setRecentJobs] = useState([
    {
      title: "Senior React Developer",
      company: "Tech Corp",
      date: "2 days ago",
      status: "In Progress",
      color: "bg-blue-100 text-blue-800",
      avatar: "💻",
      rating: 4.9,
      hourlyRate: "रू 45/hr",
      location: "Kathmandu, Nepal",
      type: "Remote",
      schedule: "Full-time",
      experience: "5+ Years",
      salary: "रू 60k - रू 90k",
      professionalId: "679f4270d4c82b09c256087b" // Linked to a test pro if exists
    },
    {
      title: "Frontend Engineer",
      company: "Design Studio",
      date: "1 week ago",
      status: "Scheduled",
      color: "bg-green-100 text-green-800",
      avatar: "🎨",
      rating: 4.7,
      hourlyRate: "$35/hr",
      location: "Pokhara, Nepal",
      type: "Hybrid",
      schedule: "Contract",
      experience: "3+ Years",
      salary: "रू 40k - रू 55k",
      professionalId: "679f4270d4c82b09c256087c"
    },
    {
      title: "Full Stack Developer",
      company: "Startup XYZ",
      date: "2 weeks ago",
      status: "Completed",
      color: "bg-gray-100 text-gray-800",
      avatar: "🚀",
      rating: 4.5,
      hourlyRate: "रू 40/hr",
      location: "Lalitpur, Nepal",
      type: "On-site",
      schedule: "Full-time",
      experience: "4+ Years",
      salary: "रू 50k - रू 70k",
      professionalId: "679f4270d4c82b09c256087d"
    },
  ]);

  const handleLogout = () => {
    openConfirm({
      title: t('logout'),
      message: t('logout_confirm') || "Are you sure you want to log out?",
      onConfirm: () => {
        localStorage.clear(); // Clear everything for a clean logout
        navigate("/");
      },
      type: 'danger'
    });
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  const handleHireNowClick = () => {
    setShowHireForm(true);
    setHireFormErrors({});
    if (user.location && user.location !== "Not set") {
      setHireFormData(prev => ({ ...prev, location: user.location }));
    }
  };

  const handleHireFormChange = (e) => {
    const { name, value } = e.target;
    setHireFormData((prev) => ({ ...prev, [name]: value }));
    if (hireFormErrors[name]) {
      setHireFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleHireFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!hireFormData.fullName.trim()) errors.fullName = "Full name is required";
    if (!hireFormData.workDescription.trim()) errors.workDescription = "Work description is required";
    if (!hireFormData.timeSchedule.trim()) errors.timeSchedule = "Time schedule is required";
    if (!hireFormData.bookingDate.trim()) errors.bookingDate = "Booking date is required";
    if (!hireFormData.location.trim()) errors.location = "Location is required";

    if (Object.keys(errors).length > 0) {
      setHireFormErrors(errors);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Error: User ID not found. Please log in again.");
        return;
      }

      const bookingData = {
        userId,
        professionalId: selectedJob.professionalId || null,
        serviceTitle: selectedJob.title,
        serviceProvider: selectedJob.company,
        fullName: hireFormData.fullName,
        workDescription: hireFormData.workDescription,
        timeSchedule: hireFormData.timeSchedule,
        bookingDate: hireFormData.bookingDate,
        location: hireFormData.location,
        hourlyRate: selectedJob.hourlyRate || "रू 0.00",
        totalCost: selectedJob.hourlyRate || "रू 0.00",
        rating: selectedJob.rating || 0
      };

      const response = await createBooking(bookingData);
      if (response.success) {
        alert(`✅ Booking confirmed!\n\nService: ${selectedJob.title}\nProvider: ${selectedJob.company}\n\nYour booking has been sent to the provider.`);
        setShowHireForm(false);
        setHireFormData({ fullName: "", workDescription: "", timeSchedule: "", location: "" });
      } else {
        alert("Error: " + (response.message || "Failed to create booking"));
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error: " + (error.message || "Failed to create booking. Please try again."));
    }
  };

  const handleMessageClick = () => {
    navigate('/messages');
  };

  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setMessageFormData((prev) => ({ ...prev, [name]: value }));
    if (messageFormErrors[name]) {
      setMessageFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMessageFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!messageFormData.subject.trim()) errors.subject = "Subject is required";
    if (!messageFormData.message.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      setMessageFormErrors(errors);
      return;
    }

    alert(`Message sent to ${selectedJob.title} at ${selectedJob.company}!`);
    setShowMessageForm(false);
    setMessageFormData({ subject: "", message: "" });
  };

  const handleServiceTaken = () => {
    try {
      openConfirm({
        title: "Service Confirmation",
        message: `Mark service "${selectedJob.title}" as taken? This will update your services history and profile metrics.`,
        onConfirm: () => {
          const updatedJob = { ...selectedJob, status: "Service Taken" };
          setSelectedJob(updatedJob);

          // Update the recentJobs array using state
          setRecentJobs(prevJobs => prevJobs.map(j => 
            (j.title === selectedJob.title && j.company === selectedJob.company) 
            ? { ...j, status: "Service Taken", color: "bg-orange-100 text-orange-800" } 
            : j
          ));

          // Increment the services taken count in bookingStats state
          setBookingStats(prev => ({
            ...prev,
            servicesTaken: prev.servicesTaken + 1,
            changeTaken: `+${(parseInt(prev.changeTaken.replace("+", "")) || 0) + 1}`
          }));

          const serviceRecord = {
            title: selectedJob.title,
            provider: selectedJob.company,
            company: selectedJob.company,
            rating: selectedJob.rating || 4.5,
            cost: selectedJob.hourlyRate || "रू 0.00",
            category: selectedJob.title.includes("Developer") ? "Tech" :
              selectedJob.title.includes("Engineer") ? "Creative" : "Home",
            dateAdded: new Date().toISOString(),
            date: new Date().toLocaleDateString()
          };

          addTakenService(serviceRecord);
          alert(`✅ Service marked as taken!\nService: ${selectedJob.title}\nProvider: ${selectedJob.company}\n\nThe service has been added to your services taken count.`);
        },
        type: 'info'
      });
    } catch (error) {
      console.error("Error in handleServiceTaken:", error);
      alert("Error marking service as taken. Please try again.");
    }
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition p-2 hover:bg-orange-50 rounded-lg"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
                <div className="h-6 w-[1px] bg-gray-300"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedJob.title}</h1>
                  <p className="text-xs text-gray-500">{selectedJob.company}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <button onClick={handleLogoClick} className="hover:opacity-80 transition cursor-pointer">
                  <Logo />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl shadow-md">
                        {selectedJob.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('service_provider_profile')}</h2>
                      <p className="text-gray-600 mb-4 font-medium">
                        Professional {selectedJob.title}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${i < Math.floor(selectedJob.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{selectedJob.rating}</span>
                        <span className="text-gray-500 text-sm">(120+ {t('reviews')})</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-gray-900">{t('per_hour_rate')}</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedJob.hourlyRate}</p>
                      <p className="text-xs text-gray-500 mt-1 italic">Flexible negotiation available</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-gray-900">{t('coverage_area')}</h3>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{selectedJob.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedJob.type} service</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Clock size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{t('availability')}</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedJob.schedule}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Available immediately</p>
                          <p>• {selectedJob.type} arrangement</p>
                          <p>• Flexible hours available</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Briefcase size={24} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{t('experience')}</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedJob.experience}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Proven track record</p>
                          <p>• Industry expertise</p>
                          <p>• Specialized skills</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('about_service')}</h3>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                      Professional and reliable service provider in the {selectedJob.location} area.
                      Specializing in high-quality {selectedJob.title} work for residential and commercial clients.
                    </p>
                    <p>
                      Committed to excellence and customer satisfaction. All work comes with a satisfaction guarantee
                      and transparent pricing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('quick_booking')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('est_cost')}</span>
                      <span className="font-semibold text-gray-900">{selectedJob.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('travel_fee')}</span>
                      <span className="font-semibold text-gray-900">रू 0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{selectedJob.rating}</span>
                      </div>
                    </div>
                    <hr className="my-4" />
                    <button
                      onClick={handleHireNowClick}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition transform active:scale-95 shadow-lg shadow-orange-200"
                    >
                      {t('book_now')}
                    </button>
                    <button
                      onClick={handleMessageClick}
                      className="w-full py-3 border border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      {t('send_message')}
                    </button>
                    <button
                      onClick={handleServiceTaken}
                      className={`w-full py-3 font-bold rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${selectedJob.status === "Service Taken"
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                        : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200"
                        }`}
                    >
                      <CheckCircle size={18} />
                      {selectedJob.status === "Service Taken" ? `${t('service_taken')} ✓` : t('mark_service_taken')}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('reliability_stats')}</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t('response_time')}</p>
                      <p className="text-lg font-bold text-gray-900">&lt; 2 hours</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t('success_rate')}</p>
                      <p className="text-lg font-bold text-gray-900">98%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t('services_completed')}</p>
                      <p className="text-lg font-bold text-gray-900">45+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Modals */}
          {showHireForm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-6 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold leading-tight">{t('sign_in')} {selectedJob.title}</h2>
                    <p className="text-orange-100 text-xs mt-1">{t('location')}: {selectedJob.location}</p>
                  </div>
                  <button onClick={() => setShowHireForm(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleHireFormSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={hireFormData.fullName}
                      onChange={handleHireFormChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition ${hireFormErrors.fullName ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {hireFormErrors.fullName && <p className="text-red-500 text-xs mt-1">{hireFormErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Details</label>
                    <textarea
                      name="workDescription"
                      value={hireFormData.workDescription}
                      onChange={handleHireFormChange}
                      placeholder="Tell us what needs to be done..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition resize-none ${hireFormErrors.workDescription ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {hireFormErrors.workDescription && (
                      <p className="text-red-500 text-xs mt-1">{hireFormErrors.workDescription}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-[10px]">Preferred Date</label>
                      <input
                        type="date"
                        name="bookingDate"
                        value={hireFormData.bookingDate}
                        onChange={handleHireFormChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm ${hireFormErrors.bookingDate ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      {hireFormErrors.bookingDate && <p className="text-red-500 text-[10px] mt-1">{hireFormErrors.bookingDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-[10px]">Preferred Time</label>
                      <select
                        name="timeSchedule"
                        value={hireFormData.timeSchedule}
                        onChange={handleHireFormChange}
                        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm ${hireFormErrors.timeSchedule ? "border-red-500" : "border-gray-200"
                          }`}
                      >
                        <option value="">Choose...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                      {hireFormErrors.timeSchedule && <p className="text-red-500 text-[10px] mt-1">{hireFormErrors.timeSchedule}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-[10px]">Service Area / Location</label>
                    <input
                      type="text"
                      name="location"
                      value={hireFormData.location}
                      onChange={handleHireFormChange}
                      placeholder="e.g. Kathmandu"
                      className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm ${hireFormErrors.location ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {hireFormErrors.location && <p className="text-red-500 text-[10px] mt-1">{hireFormErrors.location}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowHireForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition active:scale-95"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMessageForm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">{selectedJob?.avatar}</div>
                    <div>
                      <h2 className="font-bold text-gray-900">Message {selectedJob?.title}</h2>
                      <p className="text-xs text-gray-500">Usually replies in &lt; 2h</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMessageForm(false)} className="text-gray-400 hover:text-gray-600 p-2 transition">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleMessageFormSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={messageFormData.subject}
                      onChange={handleMessageFormChange}
                      placeholder="Service Inquiry"
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition ${messageFormErrors.subject ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                    <textarea
                      name="message"
                      value={messageFormData.message}
                      onChange={handleMessageFormChange}
                      placeholder="Hi, I need help with..."
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none ${messageFormErrors.message ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition"
                  >
                    Send Direct Message
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center">
        <div className="w-full px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-gray-50 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                title="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleLogoClick}
                className="hover:opacity-80 transition cursor-pointer"
              >
                <Logo />
              </button>
            </div>

            

            <div className="flex items-center gap-2 sm:gap-4">
              

              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <Bell size={20} className="text-gray-600" />
                  {/* The red dot will be handled inside the menu or could fetch unread count here if preferred */}
                </button>
                <NotificationsMenu 
                  isOpen={notificationsOpen} 
                  onClose={() => setNotificationsOpen(false)} 
                />
              </div>

              <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

              <div
                className="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-gray-50 rounded-full transition group"
                onClick={() => navigate('/user-profile')}
              >
                <div className="h-9 w-9 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition">
                  {userProfileImage ? (
                    <OptimizedImage 
                      src={userProfileImage} 
                      alt={user.name} 
                      className="h-full w-full" 
                      fallbackIcon={UserCircle}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">{user.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('namaste')}, {user.name}</h1>
              <p className="text-gray-500">{t('dashboard_subtitle')}</p>
            </div>
            {user.location !== "Not set" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 shadow-sm self-start md:self-auto">
                <MapPin size={18} className="text-orange-600" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">{t('your_location')}</p>
                  <p className="text-sm font-bold truncate max-w-[200px]">{user.location}</p>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isScheduled = stat.label === t('scheduled');
              const isSpent = stat.label === t('total_spent');
              const changeColor = isScheduled
                ? stat.change === 'Active' ? 'text-purple-600 bg-purple-50' : 'text-gray-500 bg-gray-100'
                : isSpent
                ? stat.change === 'Paid' ? 'text-orange-600 bg-orange-50' : 'text-gray-400 bg-gray-100'
                : 'text-green-600 bg-green-50';
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-2xl shadow-inner`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${changeColor}`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              );
            })}

          </div>

        
        </main>
      </div>
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default Dashboard;