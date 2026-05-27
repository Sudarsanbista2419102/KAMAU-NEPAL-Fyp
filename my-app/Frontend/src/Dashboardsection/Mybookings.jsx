import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Menu,
    X,
    Bell,
    MapPin,
    Clock,
    DollarSign,
    Star,
    Trash2,
    CheckCircle,
    AlertCircle,
    Calendar,
    ChevronDown,
    Send,
    CreditCard,
    Flag,
    Check,
    ChevronLeft,
} from 'lucide-react';

import Logo from '../Logo';
import NotificationsMenu from '../components/NotificationsMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { submitReview } from '../services/reviewService';
import OptimizedImage from '../components/OptimizedImage';
import { UserCircle as User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function MyBookings() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        type: 'danger' 
    });
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    
    const userName = localStorage.getItem('userName') || 'Professional User';
    const userRole = localStorage.getItem('userRole') || '';
    const userProfileImage = localStorage.getItem('userProfileImage');

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

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportedCustomers, setReportedCustomers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('reportedCustomers') || '[]'); }
        catch { return []; }
    });


    const openConfirm = (config) => {
        setConfirmDialog({ ...config, isOpen: true });
    };


    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchBookings = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }

            const { getUserBookings } = await import('../bookingService');
            const data = await getUserBookings(userId);

            if (data) {
                // Ensure data is an array or handle appropriately
                setBookings(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };

    const handleLogout = () => {
        openConfirm({
            title: "Sign Out",
            message: "Are you sure you want to log out of your account?",
            onConfirm: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                navigate('/');
            },
            type: 'danger'
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'UN';
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-blue-100 text-blue-800';
            case 'Confirmed':
                return 'bg-teal-100 text-teal-800';
            case 'In Progress':
                return 'bg-orange-100 text-orange-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle size={16} />;
            case 'Cancelled':
                return <AlertCircle size={16} />;
            case 'Pending':
                return <Clock size={16} />;
            default:
                return <Calendar size={16} />;
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === 'all') return true;
        return booking.status === (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    });

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            const { updateBookingStatus } = await import('../bookingService');
            await updateBookingStatus(selectedBooking._id, 'Cancelled', cancelReason);

            toast.success('Booking cancelled successfully.');
            setShowCancelForm(false);
            setCancelReason('');
            setSelectedBooking(null);
            fetchBookings(); // Refresh list
        } catch (err) {
            console.error('Error cancelling booking:', err);
            toast.error(err.message || 'Failed to cancel booking');
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        openConfirm({
            title: "Mark Completed",
            message: "Are you sure you want to mark this service as completed? This action cannot be undone.",
            confirmText: "Yes, Completed",
            onConfirm: async () => {
                try {
                    const { updateBookingStatus } = await import('../bookingService');
                    await updateBookingStatus(bookingId, 'Completed', '');
                    toast.success('Booking marked as completed successfully.');
                    fetchBookings(); // Refresh list
                    setSelectedBooking(null);
                } catch (err) {
                    console.error('Error completing booking:', err);
                    toast.error(err.message || 'Failed to complete booking');
                }
            },
            type: 'success'
        });
    };

    const handleDeleteBooking = async (bookingId) => {
        openConfirm({
            title: "Delete Booking",
            message: "This will permanently remove the booking from your records. Are you sure?",
            confirmText: "Delete Record",
            onConfirm: async () => {
                try {
                    const { deleteBooking } = await import('../bookingService');
                    await deleteBooking(bookingId);
                    toast.success('Booking deleted successfully');
                    fetchBookings(); // Refresh list
                } catch (err) {
                    console.error('Error deleting booking:', err);
                    toast.error(err.message || 'Failed to delete booking');
                }
            },
            type: 'danger'
        });
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const openReviewModal = async (booking) => {
        setReviewBooking(booking);
        setReviewRating(0);
        setReviewHover(0);
        setReviewComment('');
        setReviewSubmitted(false);
        setShowReviewModal(true);

        // Check if this customer has already been reported
        const reporterId = localStorage.getItem('userId');
        if (reporterId && booking.userId) {
            try {
                const response = await axios.get(
                    `/api/reports/check/${reporterId}/${booking.professionalId?._id || booking.professionalId}?reporterModel=User&targetModel=Professional`
                );
                if (response.data.success && response.data.hasReported) {
                    // Add to local state if not already there
                    if (!reportedCustomers.includes(booking.userId)) {
                        const updatedReported = [...reportedCustomers, booking.userId];
                        setReportedCustomers(updatedReported);
                        localStorage.setItem('reportedCustomers', JSON.stringify(updatedReported));
                    }
                }
            } catch (error) {
                console.error('Error checking report status:', error);
                // Continue anyway - don't block the modal
            }
        }
    };

    const handleReportCustomer = async (e) => {
        e.preventDefault();
        if (!reportReason || !reportDescription) {
            toast.error('Please provide a reason and description for the report.');
            return;
        }

        setIsReporting(true);
        try {
            const reporterId = localStorage.getItem('userId');
            if (!reporterId) {
                toast.error('Please login to report a professional.');
                setIsReporting(false);
                return;
            }

            const response = await axios.post('/api/reports', {
                reporter: reporterId,
                reporterModel: 'User',
                target: reviewBooking.professionalId?._id || reviewBooking.professionalId,
                targetModel: 'Professional',
                reason: reportReason,
                description: reportDescription
            });

            if (response.data.success) {
                // Add to reported customers list
                const updatedReported = [...reportedCustomers, reviewBooking.userId];
                setReportedCustomers(updatedReported);
                localStorage.setItem('reportedCustomers', JSON.stringify(updatedReported));

                setReportSuccess(true);
                toast.success('Report submitted successfully');
                setTimeout(() => {
                    setIsReportModalOpen(false);
                    setReportSuccess(false);
                    setReportReason('');
                    setReportDescription('');
                }, 2000);
            }
        } catch (error) {
            console.error('Report submission error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to submit report. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsReporting(false);
        }
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
            // Mark this professional as reviewed
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

    const isProfessionalReviewed = (professionalId) => {
        if (!professionalId) return false;
        const id = typeof professionalId === 'object' ? professionalId._id : professionalId;
        return reviewedProfessionals.includes(id);
    };

    const handlePayment = (booking) => {
        navigate(`/payment/${booking._id}`);
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center shrink-0">
                <div className="w-full px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 bg-gray-50 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            title="Go Back"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <Logo />
                        <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
                            {selectedBooking && (
                                <>
                                    <div className="h-6 w-[1px] bg-gray-200"></div>
                                    <p className="text-sm font-medium text-gray-500">{selectedBooking.serviceTitle}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button 
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
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
                                        alt={userName} 
                                        className="h-full w-full" 
                                        fallbackIcon={User}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-orange-500 flex items-center justify-center text-white font-bold">
                                        {userName?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">{userName}</p>
                                <p className="text-[10px] text-gray-500 font-medium capitalize">{userRole || 'User'}</p>
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

                {/* Main Content */}
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 overflow-y-auto">
                    {selectedBooking ? (
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-600 transition p-2 hover:bg-orange-50 rounded-lg"
                            >
                                ← <span className="text-sm font-medium">Back to All Bookings</span>
                            </button>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="flex items-start gap-6 mb-8">
                                    <div className="flex-shrink-0">
                                        <div className="h-24 w-24 rounded-full bg-white border-4 border-orange-100 overflow-hidden flex items-center justify-center text-4xl shadow-md shrink-0">
                                            {selectedBooking.professionalId?.profileImage ? (
                                                <OptimizedImage
                                                    src={selectedBooking.professionalId.profileImage}
                                                    alt={selectedBooking.serviceProvider}
                                                    className="w-full h-full"
                                                    fallbackIcon={User}
                                                />
                                            ) : (
                                                <span className="text-orange-600">{getInitials(selectedBooking.serviceProvider)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedBooking.serviceTitle}</h2>
                                        <p className="text-gray-600 mb-4 font-medium">{selectedBooking.serviceProvider}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedBooking.status)}`}>
                                                {getStatusIcon(selectedBooking.status)}
                                                {selectedBooking.status === 'Confirmed' ? 'Ongoing' : selectedBooking.status}
                                            </span>
                                            {selectedBooking.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={`${i < Math.floor(selectedBooking.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                    <span className="font-semibold text-gray-900 ml-1">{selectedBooking.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Service Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.bookingDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Time</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.timeSchedule}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <DollarSign size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Rate</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.hourlyRate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Provider Info</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Provider Name</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedBooking.professionalId 
                                                        ? `${selectedBooking.professionalId.firstName} ${selectedBooking.professionalId.lastName}` 
                                                        : selectedBooking.serviceProvider}
                                                </p>
                                            </div>
                                            {selectedBooking.professionalId?.serviceArea && (
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={18} className="text-teal-600" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Coming from</p>
                                                        <p className="font-semibold text-gray-900">{selectedBooking.professionalId.serviceArea}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* (Keep any other provider contact info if available) */}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Booking Summary</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">Service</span>
                                            <span className="font-semibold text-gray-900">{selectedBooking.serviceTitle}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-semibold text-gray-900">{selectedBooking.location}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">Payment Status</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                                                {selectedBooking.paymentStatus || 'Unpaid'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-gray-900 font-semibold">Total Cost</span>
                                            <span className="text-2xl font-bold text-orange-600">{selectedBooking.totalCost}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.notes && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedBooking.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {(selectedBooking.status === 'Pending' || selectedBooking.status === 'Upcoming') && (
                                        <>
                                            <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition">
                                                Reschedule Booking
                                            </button>
                                            <button
                                                onClick={() => setShowCancelForm(true)}
                                                className="flex-1 py-3 border border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition"
                                            >
                                                Cancel Booking
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'Confirmed' && (
                                        <button 
                                            onClick={() => handleCompleteBooking(selectedBooking._id)}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-200"
                                        >
                                            <CheckCircle size={18} className="inline mr-2" />
                                            Mark as Completed
                                        </button>
                                    )}
                                    {(selectedBooking.status === 'Completed' || selectedBooking.status === 'Confirmed') && (
                                        <div className="flex flex-col w-full gap-3">
                                            {selectedBooking.status === 'Completed' && selectedBooking.paymentStatus !== 'Paid' && (
                                                <button
                                                    onClick={() => handlePayment(selectedBooking)}
                                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard size={20} />
                                                    Pay Now ({selectedBooking.totalCost})
                                                </button>
                                            )}
                                            {isProfessionalReviewed(selectedBooking.professionalId) ? (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200">
                                                        <CheckCircle size={18} />
                                                        Review Submitted
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/professional/${selectedBooking.professionalId?._id || selectedBooking.professionalId}`)}
                                                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-teal-100"
                                                    >
                                                        <Calendar size={18} />
                                                        Book Again
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openReviewModal(selectedBooking)}
                                                    className="w-full py-3 bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold rounded-xl transition flex items-center justify-center gap-2"
                                                >
                                                    <Star size={18} />
                                                    Leave a Review
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                                    <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Upcoming</p>
                                    <p className="text-3xl font-bold text-blue-600">{bookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed').length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{bookings.filter((b) => b.status === 'Completed').length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Active Requests</p>
                                    <p className="text-3xl font-bold text-orange-600">{bookings.filter((b) => b.status === 'In Progress').length}</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
                                {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${activeTab === tab
                                            ? 'bg-orange-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab === 'all' ? 'All Bookings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Bookings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBookings.map((booking) => (
                                        <div key={booking._id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer transform hover:-translate-y-1">
                                            <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 text-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="h-16 w-16 rounded-full bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                                                        {booking.professionalId?.profileImage ? (
                                                            <OptimizedImage
                                                                src={booking.professionalId.profileImage}
                                                                alt={booking.serviceProvider}
                                                                className="w-full h-full"
                                                                fallbackIcon={User}
                                                            />
                                                        ) : (
                                                            <span className="text-orange-600">{getInitials(booking.serviceProvider)}</span>
                                                        )}
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                        {getStatusIcon(booking.status)}
                                                        {booking.status === 'Confirmed' ? 'Ongoing' : booking.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-1">{booking.serviceTitle}</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {booking.professionalId 
                                                        ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` 
                                                        : booking.serviceProvider}
                                                </p>

                                                <div className="space-y-2 mb-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar size={16} className="text-orange-600" />
                                                        <span className="font-semibold">{booking.bookingDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock size={16} className="text-orange-600" />
                                                        <span className="font-semibold">{booking.timeSchedule}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin size={16} className="text-orange-600" />
                                                        <span><span className="text-gray-400">At:</span> {booking.location}</span>
                                                    </div>
                                                    {booking.professionalId?.serviceArea && (
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin size={16} className="text-teal-600" />
                                                            <span><span className="text-gray-400">Coming from:</span> {booking.professionalId.serviceArea}</span>
                                                        </div>
                                                    )}
                                                </div>

                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-gray-600">Total Cost</span>
                                                    <span className="text-xl font-bold text-orange-600">{booking.totalCost}</span>
                                                </div>
                                                {booking.rating && (
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={`${i < Math.floor(booking.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-600 ml-1">{booking.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBooking(booking._id);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBooking(booking);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-semibold"
                                            >
                                                <ChevronDown size={16} />
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredBookings.length === 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab === 'all' ? 'bookings' : activeTab} found</h3>
                                    <p className="text-gray-600">You don't have any {activeTab === 'all' ? 'bookings' : activeTab} at the moment.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Cancel Form Modal */}
            {showCancelForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-orange-600"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelForm(false)}
                                className="flex-1 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                                <p className="text-gray-500 font-medium mb-6">Thank you for your feedback. It helps others find great professionals.</p>
                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={() => navigate(`/professional/${reviewBooking.professionalId?._id || reviewBooking.professionalId}`)}
                                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={20} />
                                        Book Again
                                    </button>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                                    >
                                        Back to Bookings
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Modal Header */}
                                <div className="px-6 pt-6 pb-4 flex justify-between items-start border-b border-gray-100">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Rate Your Experience</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">with <span className="font-semibold text-gray-700">{reviewBooking.serviceProvider}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reportedCustomers.includes(reviewBooking.userId) ? (
                                            <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-400 flex items-center gap-1.5 cursor-not-allowed" title="Already reported">
                                                <Flag size={16} />
                                                <span className="text-xs font-bold">Reported</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setShowReviewModal(false);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition flex items-center gap-1.5"
                                                title="Report Customer"
                                            >
                                                <Flag size={16} />
                                                <span className="text-xs font-bold">Report</span>
                                            </button>
                                        )}
                                        <button onClick={() => setShowReviewModal(false)} className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                                    {/* Star Rating */}
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

                                    {/* Comment */}
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

                                    {/* Service info */}
                                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-3">
                                        <Calendar size={16} className="text-orange-500 shrink-0" />
                                        <span className="text-sm text-orange-700 font-semibold">{reviewBooking.serviceTitle} — {reviewBooking.bookingDate}</span>
                                    </div>

                                    {/* Submit */}
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


            {/* Report Customer Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div 
                        onClick={() => setIsReportModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
                        {reportSuccess ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                    <Check size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Report Submitted</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Thank you for keeping our community safe. Our administrators will review your report shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleReportCustomer} className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Report Customer</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Help us maintain quality</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setIsReportModalOpen(false)}
                                        className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Report</label>
                                        <select 
                                            required
                                            value={reportReason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                                            <option value="Late arrival">Late Arrival</option>
                                            <option value="Poor service">Poor Service</option>
                                            <option value="Overcharging">Overcharging</option>
                                            <option value="Fraud/scam">Fraud/Scam</option>
                                            <option value="Payment Issues">Payment Issues</option>
                                            <option value="Harassment">Harassment</option>
                                            <option value="Fake Booking">Fake Booking</option>
                                            <option value="No Show">No Show</option>
                                            <option value="Unreasonable Demands">Unreasonable Demands</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detailed Description</label>
                                        <textarea 
                                            required
                                            rows="4"
                                            value={reportDescription}
                                            onChange={(e) => setReportDescription(e.target.value)}
                                            placeholder="Please provide more details about the issue..."
                                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-medium focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            type="submit"
                                            disabled={isReporting}
                                            className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isReporting ? 'Submitting...' : 'Submit Report'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setIsReportModalOpen(false)}
                                            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
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
}
