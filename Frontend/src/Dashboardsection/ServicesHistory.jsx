import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Filter,
  Search,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Loader,
  Trash2,
  Menu,
  X,
  Bell,
  ChevronLeft
} from 'lucide-react';

import Logo from '../Logo';
import ConfirmDialog from '../components/ConfirmDialog';
import { getUserBookings, deleteBooking } from '../bookingService';
import { submitReview } from '../services/reviewService';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ServicesHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    type: 'danger' 
  });

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewedProfessionals, setReviewedProfessionals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('reviewedProfessionals') || '[]'); }
    catch { return []; }
  });

  const openConfirm = (config) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  const handleLogout = () => {
    openConfirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      onConfirm: () => {
        localStorage.clear();
        navigate('/login');
      },
      type: 'danger'
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await getUserBookings(userId);

      if (response.success) {
        setBookings(response.data || []);
      } else {
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(item => {
    try {
      const matchesSearch =
        (item.serviceTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.serviceProvider?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    } catch (e) {
      console.error('Error filtering bookings:', e);
      return false;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-teal-100 text-teal-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle size={16} />;
      case 'In Progress':
        return <Clock size={16} />;
      case 'Completed':
        return <CheckCircle size={16} />;
      case 'Cancelled':
        return <AlertCircle size={16} />;
      case 'Pending':
      default:
        return <Clock size={16} />;
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    openConfirm({
      title: "Delete History",
      message: "Are you sure you want to permanently delete this service record from your history?",
      confirmText: "Delete Record",
      onConfirm: async () => {
        try {
          const response = await deleteBooking(bookingId);
          if (response.success) {
            setBookings(bookings.filter(b => b._id !== bookingId));
            toast.success('Booking deleted successfully');
          } else {
            toast.error('Error: ' + (response.message || 'Failed to delete booking'));
          }
        } catch (err) {
          toast.error('Error: ' + err.message);
        }
      },
      type: 'danger'
    });
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(0);
    setReviewHover(0);
    setReviewComment('');
    setReviewSubmitted(false);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Anonymous';
    const professionalId = reviewBooking?.professionalId?._id || reviewBooking?.professionalId;

    if (!professionalId) {
      toast.error('Cannot identify the professional for this booking.');
      return;
    }

    setReviewSubmitting(true);
    try {
      await submitReview({ professionalId, userId, userName, rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
      const updated = [...reviewedProfessionals, professionalId];
      setReviewedProfessionals(updated);
      localStorage.setItem('reviewedProfessionals', JSON.stringify(updated));
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewBooking(null);
      }, 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => navigate(-1)}
                  className="p-2 bg-gray-50 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                  title="Go Back"
              >
                  <ChevronLeft size={20} />
              </button>
              <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">
                <Logo />
              </button>
              <h1 className="text-xl font-bold text-gray-900 ml-2">Services History</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your Bookings</h2>
              <p className="text-gray-500 font-medium">View and manage your professional service bookings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchBookings}
                className="px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition flex items-center gap-2"
              >
                <Loader size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="font-bold text-red-700">{error}</p>
                <p className="text-sm text-red-600">Please try refreshing the page or logging in again.</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin">
                <Loader size={48} className="text-orange-600" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={18} />
                  <select
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-50">
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Service & Provider</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Customer Name</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Booking Date</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Rate</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((item) => (
                        <tr key={item._id} className="hover:bg-orange-50/20 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <Briefcase size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition">{item.serviceTitle || 'Unknown Service'}</p>
                                <p className="text-xs text-gray-500 font-medium">{item.serviceProvider || 'Unknown Provider'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-medium text-gray-900 text-sm">{item.fullName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{item.location || ''}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <Calendar size={16} className="text-gray-400" />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-medium">
                            {item.timeSchedule || 'N/A'}
                          </td>
                          <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                            {item.hourlyRate || '$0.00'}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${getStatusBadgeColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.status === 'Completed' && !reviewedProfessionals.includes(item.professionalId?._id || item.professionalId) && (
                                <button
                                  onClick={() => openReviewModal(item)}
                                  className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition border border-orange-100"
                                  title="Leave a review"
                                >
                                  <Star size={18} className="fill-orange-500" />
                                </button>
                              )}
                              {item.status === 'Completed' && reviewedProfessionals.includes(item.professionalId?._id || item.professionalId) && (
                                <span className="p-2 text-teal-600 bg-teal-50 rounded-lg border border-teal-100" title="Reviewed">
                                  <CheckCircle size={18} />
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(item._id)}
                                className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-red-600 border border-transparent hover:border-red-100"
                                title="Delete booking"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                              <Briefcase size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                              {searchQuery || filterStatus !== 'All'
                                ? "No bookings match your search or filter criteria."
                                : "You haven't made any bookings yet. Start by booking a professional service!"}
                            </p>
                            <button
                              onClick={() => navigate('/dashboard')}
                              className="mt-4 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-100"
                            >
                              Browse Services
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats cards can be added here */}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.55)', backdropFilter:'blur(6px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            {reviewSubmitted ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Review Submitted!</h3>
                <p className="text-gray-500 font-medium">Thank you for your feedback. It helps others find great professionals.</p>
              </div>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4 flex justify-between items-start border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Rate Your Experience</h3>
                    <p className="text-sm text-gray-500 mt-0.5">with <span className="font-semibold text-gray-700">{reviewBooking.serviceProvider}</span></p>
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            size={36}
                            className={`transition-colors ${
                              star <= (reviewHover || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-200 fill-gray-100'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold text-gray-500">
                        {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : reviewRating === 5 ? 'Excellent' : 'Select rating'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Your Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this professional..."
                      className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all text-gray-800 font-medium resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-3">
                    <Calendar size={16} className="text-orange-500 shrink-0" />
                    <span className="text-sm text-orange-700 font-semibold">{reviewBooking.serviceTitle} — {reviewBooking.bookingDate}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || reviewRating === 0}
                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {reviewSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><Send size={18} /> Submit Review</>
                    )}
                  </button>
                </form>
              </>
            )}
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
    </div>
  );
};

export default ServicesHistory;