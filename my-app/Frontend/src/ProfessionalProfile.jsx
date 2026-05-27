import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, ShieldCheck, MessageSquare, Share2, Award,
  Clock, Briefcase, GraduationCap, UserCircle, X, Check, ThumbsUp, Lock, Heart, AlertCircle, Camera, Download, ChevronLeft
} from 'lucide-react';

import axios from 'axios';
import { submitReview, getProfessionalReviews } from './services/reviewService';
import OptimizedImage from './components/OptimizedImage';
import LocationPicker from './components/LocationPicker';
import toast from 'react-hot-toast';

// Enhanced Button Component
const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer border-0';

  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30 active:scale-95',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95',
    outline: 'border-2 border-slate-200 text-slate-900 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 active:scale-95',
    ghost: 'text-slate-600 hover:text-teal-600 hover:bg-slate-50 active:scale-95',
    danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    icon: 'p-3',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [requestDate, setRequestDate] = useState('');
  const [pinLocation, setPinLocation] = useState({ lat: 27.7172, lng: 85.3240 }); // Default Kathmandu
  const [requestTime, setRequestTime] = useState('');
  const [requestLocation, setRequestLocation] = useState('');

  // Reverse Geocode map pin to update Location field automatically
  useEffect(() => {
    const fetchAddress = async () => {
      // Don't auto-fetch for the exact default coordinates unless requested
      if (pinLocation.lat === 27.7172 && pinLocation.lng === 85.3240 && !requestLocation) {
        return;
      }
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pinLocation.lat}&lon=${pinLocation.lng}`);
        if (res.data && res.data.display_name) {
          setRequestLocation(res.data.display_name);
        }
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
      }
    };
    
    if (pinLocation && pinLocation.lat) {
      fetchAddress();
    }
  }, [pinLocation, requestLocation]);

  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const userId = localStorage.getItem('userId');
  const isSelf = profile?.userId === userId || profile?._id === userId;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProfessionalProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/professionals/${id}`);
        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError('Professional not found');
        }
      } catch (err) {
        console.error('Error fetching professional:', err);
        setError(err.response?.data?.message || 'Failed to fetch professional profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getProfessionalReviews(id);
        if (data.success) {
          setReviews(data.data || []);
          const userId = localStorage.getItem('userId');
          if (userId) {
            const already = (data.data || []).some(r => String(r.userId) === String(userId) || String(r.userId?._id) === String(userId));
            setAlreadyReviewed(already);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    const checkEligibility = async () => {
      const userId = localStorage.getItem('userId');
      if (userId && id) {
        try {
          const { checkUserBookingStatus } = await import('./bookingService');
          const res = await checkUserBookingStatus(userId, id);
          setCanReview(res.hasBooking);
          setHasPending(res.hasPending);
        } catch (err) {
          console.error('Error checking review eligibility:', err);
        }
      }
    };

    if (id) {
      fetchProfessionalProfile();
      fetchReviews();
      checkEligibility();
    }
  }, [id]);

  useEffect(() => {
    setRequestTime('');
  }, [requestDate]);

  const formatServiceArea = (area) => {
    if (!area) return 'Not specified';
    return area
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatServiceCategory = (category) => {
    if (!category) return 'Service';
    return category
      .split(/_|-|\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getDayName = (dateString) => {
    if (!dateString) return null;
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(dateString));
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const STANDARD_TIME_SLOTS = [
    { label: '6AM - 7AM', start: '06:00', end: '07:00' },
    { label: '7AM - 8AM', start: '07:00', end: '08:00' },
    { label: '8AM - 9AM', start: '08:00', end: '09:00' },
    { label: '9AM - 10AM', start: '09:00', end: '10:00' },
    { label: '10AM - 11AM', start: '10:00', end: '11:00' },
    { label: '11AM - 12PM', start: '11:00', end: '12:00' },
    { label: '12PM - 1PM', start: '12:00', end: '13:00' },
    { label: '1PM - 2PM', start: '13:00', end: '14:00' },
    { label: '2PM - 3PM', start: '14:00', end: '15:00' },
    { label: '3PM - 4PM', start: '15:00', end: '16:00' },
    { label: '4PM - 5PM', start: '16:00', end: '17:00' },
    { label: '5PM - 6PM', start: '17:00', end: '18:00' },
    { label: '6PM - 7PM', start: '18:00', end: '19:00' },
    { label: '7PM - 8PM', start: '19:00', end: '20:00' },
  ];

  const getAvailableSlots = (dateString, availability, jobType) => {
    if (!dateString) return [];
    const dayName = getDayName(dateString);
    let dayAvailability = availability?.find(a => a.day === dayName);
    if (!dayAvailability && jobType === 'full-time') {
      dayAvailability = { startTime: "06:00", endTime: "18:00" };
    }
    if (!dayAvailability) return [];
    const profStart = timeToMinutes(dayAvailability.startTime);
    const profEnd = timeToMinutes(dayAvailability.endTime);
    const now = new Date();
    
    // Safely check if it's today by comparing local date strings (YYYY-MM-DD)
    const selectedDateStr = dateString; 
    const todayStr = now.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
    
    const isToday = selectedDateStr === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return STANDARD_TIME_SLOTS.filter(slot => {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      const isWithinAvailability = slotStart >= profStart && slotEnd <= profEnd;
      
      if (isToday) {
        // Add a 15-minute buffer: Can't book a slot that starts within 15 minutes or has already passed
        return isWithinAvailability && slotStart > (currentMinutes + 15);
      }
      return isWithinAvailability;
    });
  };

  const formatAvailabilitySummary = (availability) => {
    if (!availability || availability.length === 0) return 'Not set';
    const summary = availability.map(a => {
      const s = a.startTime.split(':');
      const e = a.endTime.split(':');
      const startH = parseInt(s[0]);
      const endH = parseInt(e[0]);
      const startF = startH >= 12 ? (startH === 12 ? 12 : startH - 12) + 'PM' : (startH === 0 ? 12 : startH) + 'AM';
      const endF = endH >= 12 ? (endH === 12 ? 12 : endH - 12) + 'PM' : (endH === 0 ? 12 : endH) + 'AM';
      return `${a.day.substring(0, 3)}: ${startF} - ${endF}`;
    });
    if (summary.length <= 2) return summary.join(', ');
    return `${summary[0]}, ${summary[1]} ...`;
  };

  const handleHire = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`/api/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        const savedLocation = user.formattedAddress || user.address || (typeof user.location === 'string' ? user.location : "");
        setRequestLocation(savedLocation);
      } else {
        setRequestLocation(localStorage.getItem('userLocation') || "");
      }
    } catch (err) {
      console.error("Error fetching user location for booking:", err);
      setRequestLocation(localStorage.getItem('userLocation') || "");
    }

    setIsRequestModalOpen(true);
  };

  const handleCoverUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image should be less than 10MB");
      return;
    }

    setIsUpdatingCover(true);
    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/professionals/${profile._id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfile(prev => ({ ...prev, coverImage: response.data.data.coverImage }));
      }
    } catch (err) {
      console.error("Failed to update cover image:", err);
      alert("Failed to update cover image. Please try again.");
    } finally {
      setIsUpdatingCover(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image should be less than 5MB");
      return;
    }

    setIsUpdatingProfile(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/professionals/${profile._id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfile(prev => ({ ...prev, profileImage: response.data.data.profileImage }));
      }
    } catch (err) {
      console.error("Failed to update profile image:", err);
      alert("Failed to update profile image. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChat = () => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/messages', { 
      state: { 
        composeTo: profile?.userId || profile?._id,
        recipientEmail: profile?.email,
        subject: `Inquiry about ${formatServiceCategory(profile?.serviceCategory)}`
      } 
    });
  };

  const handleRequestService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    if (!requestDate || !requestTime || !requestText || !requestLocation) {
      alert('Please fill in all required fields');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(requestDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('You cannot book on a past date');
      return;
    }

    setIsSubmitting(true);
    try {
      const { createBooking } = await import('./bookingService');
      const bookingData = {
        userId,
        professionalId: id,
        serviceTitle: profile?.serviceCategory || 'Service',
        serviceProvider: `${profile?.firstName} ${profile?.lastName}`,
        fullName: localStorage.getItem('userName') || 'User',
        workDescription: requestText,
        timeSchedule: requestTime,
        bookingDate: requestDate,
        location: requestLocation,
        hourlyRate: profile?.hourlyWage ? `रू ${profile.hourlyWage}` : "रू 0.00",
        totalCost: profile?.hourlyWage ? `रू ${profile.hourlyWage}` : "रू 0.00",
        status: 'Pending',
        customerLocation: {
          type: "Point",
          coordinates: [pinLocation.lng, pinLocation.lat]
        }
      };

      const result = await createBooking(bookingData);

      if (result) {
        setIsSubmitted(true);
        setHasPending(true);
        setTimeout(() => {
          setIsRequestModalOpen(false);
          setIsSubmitted(false);
          setRequestText('');
          setRequestDate('');
          setRequestTime('');
          setRequestLocation('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.firstName} ${profile?.lastName} - ${formatServiceCategory(profile?.serviceCategory)}`,
        text: `Check out this professional on Kamau Nepal!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login'); return; }
    if (reviewRating === 0) { alert('Please select a star rating'); return; }

    setReviewSubmitting(true);
    try {
      const userName = localStorage.getItem('userName') || 'Anonymous';
      await submitReview({ professionalId: id, userId, userName, rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
      setAlreadyReviewed(true);
      const data = await getProfessionalReviews(id);
      if (data.success) setReviews(data.data || []);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSubmitted(false);
        setReviewRating(0);
        setReviewComment('');
      }, 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit review';
      alert(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, size = 20) => {
    return [1,2,3,4,5].map((star, index) => (
      <button
        key={`rating-star-${index}`}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && setReviewRating(star)}
        onMouseEnter={() => interactive && setReviewHover(star)}
        onMouseLeave={() => interactive && setReviewHover(0)}
        className={interactive ? 'transition-transform hover:scale-110 focus:outline-none' : 'cursor-default'}
      >
        <Star
          size={size}
          className={`transition-colors ${
            star <= (interactive ? (reviewHover || reviewRating) : rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-200 fill-slate-100'
          }`}
        />
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
        `}</style>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-500/30 animate-float">
            <Briefcase className="text-white" size={32} />
          </div>
          <p className="text-slate-600 font-semibold text-lg">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-slate-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Profile Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">{error || 'Sorry, we couldn\'t find the professional you\'re looking for.'}</p>
          <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 pb-24 relative">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-slide-down { animation: slideDown 0.6s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .section-delay-1 { animation-delay: 0.1s; }
        .section-delay-2 { animation-delay: 0.2s; }
        .section-delay-3 { animation-delay: 0.3s; }
        .glow-teal { box-shadow: 0 0 30px rgba(13, 148, 136, 0.2); }
      `}</style>

      {/* Hero Header */}
      <div className="relative h-60 md:h-80 bg-slate-900">
        {profile?.coverImage ? (
          <OptimizedImage
            key={profile.coverImage}
            src={profile.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setPreviewImage(profile.coverImage)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#10b981]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-slate-50" />
        {/* Top Action Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 md:p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-lg"
            >
              <ChevronLeft className="text-slate-900" size={20} />
            </button>
          </div>
          <div className="flex gap-3">

            {isSelf && (
              <>
                <button 
                  onClick={() => coverInputRef.current?.click()}
                  className="p-2 md:p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-lg group"
                  disabled={isUpdatingCover}
                  title="Change Cover Photo"
                >
                  <Camera 
                    size={20} 
                    className={isUpdatingCover ? "animate-spin text-teal-600" : "text-teal-600 group-hover:scale-110 transition-all"} 
                  />
                </button>
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleCoverUpdate} 
                />
              </>
            )}
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 md:p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-lg"
            >
              <Heart 
                size={20} 
                className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"}
              />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 md:p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 shadow-lg"
            >
              <Share2 className="text-slate-600" size={20} />
            </button>
          </div>
        </div>

        {/* Profile Image */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 animate-slide-down">
          <div className="relative group">
            <div 
              className="w-36 h-36 md:w-48 md:h-48 rounded-2xl border-[6px] border-white overflow-hidden bg-slate-100 flex items-center justify-center shadow-2xl relative cursor-pointer"
              onClick={() => setPreviewImage(profile?.profileImage)}
            >
              <OptimizedImage
                key={profile?.profileImage || 'loading'}
                src={profile?.profileImage}
                alt={profile?.firstName || 'Professional'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackIcon={UserCircle}
              />
              
              {isSelf && (
                <div 
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                >
                  <div className="flex flex-col items-center text-white">
                    <Camera size={24} className={isUpdatingProfile ? "animate-spin" : ""} />
                    <span className="text-[10px] font-bold uppercase mt-1">Edit Photo</span>
                  </div>
                </div>
              )}
            </div>

            {isSelf && (
              <input 
                type="file" 
                ref={profileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleProfileUpdate} 
              />
            )}

            {profile?.isVerified && (
              <div className="absolute bottom-2 right-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-2 rounded-full shadow-lg border-4 border-white">
                <Check size={20} strokeWidth={4} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36">
        {/* Profile Header Info */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
              {formatServiceCategory(profile?.serviceCategory)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-semibold text-sm">
              <Star className="fill-current" size={16} />
              {profile?.rating || 0} ({profile?.totalReviews || 0})
            </span>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Verified professional with {profile?.completedJobs || 0}+ successful projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up section-delay-1">
              {[
                { label: 'Hourly Rate', value: `रू ${profile?.hourlyWage || 'TBD'}`, icon: '💰' },
                { label: 'Experience', value: '5+ Years', icon: '⭐' },
                { label: 'Response Time', value: '< 1 hour', icon: '⚡' },
                { label: 'Completed', value: `${profile?.completedJobs || 0} Services`, icon: '✓' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in-up section-delay-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <UserCircle className="text-teal-600" size={20} />
                </div>
                About
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {profile?.bio || "This professional is verified by the Kamau Nepal team for excellence in service delivery."}
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in-up section-delay-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Award className="text-teal-600" size={20} />
                </div>
                Skills & Expertise
              </h2>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills && profile.skills.length > 0 ? [...new Set(profile.skills)] : ["Professional Service", "Quality Work", "Reliable", "Verified"]).map((skill, index) => (
                    <span 
                      key={`skill-${skill}-${index}`}
                      className="px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-50 border border-teal-200 rounded-xl font-semibold text-teal-700 hover:border-teal-400 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {profile?.tools && profile.tools.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tools & Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(profile.tools)].map((tool, index) => (
                        <span 
                          key={`tool-${tool}-${index}`}
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in-up section-delay-3">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Star className="text-orange-600 fill-current" size={20} />
                  </div>
                  Reviews ({reviews.length})
                </h2>
                {localStorage.getItem('token') && !isSelf && (
                  !alreadyReviewed && canReview ? (
                    <button
                      onClick={() => setShowReviewForm(v => !v)}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-300 text-sm"
                    >
                      Write a Review
                    </button>
                  ) : alreadyReviewed ? (
                    <button
                      onClick={() => handleHire()}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm"
                    >
                      Book Again
                    </button>
                  ) : (
                    <div className="group relative">
                      <button
                        disabled
                        className="px-5 py-2 bg-slate-100 text-slate-400 font-semibold rounded-xl text-sm cursor-not-allowed"
                      >
                        <Lock size={14} className="inline mr-1" /> Review
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-xl z-10">
                        Complete a booking first to review this professional.
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && !alreadyReviewed && (
                <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  {reviewSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3 animate-bounce">
                        <Check size={32} />
                      </div>
                      <p className="font-bold text-slate-900 text-lg">Thank you for your review!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Rating</label>
                        <div className="flex items-center gap-2">
                          {renderStars(reviewRating, true, 32)}
                          <span className="ml-3 text-sm font-bold text-slate-600">
                            {reviewRating === 1 ? '😞 Poor' : reviewRating === 2 ? '😐 Fair' : reviewRating === 3 ? '👍 Good' : reviewRating === 4 ? '😊 Very Good' : reviewRating === 5 ? '🤩 Excellent!' : ''}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder={`Share your experience with ${profile?.firstName}...`}
                          className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={reviewSubmitting || reviewRating === 0}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                        >
                          {reviewSubmitting ? <>Submitting...</> : <>Submit Review</>}
                        </button>
                        <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-8 text-slate-400 font-semibold">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <ThumbsUp size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-500">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={review._id || `review-${index}`} className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                            {(review.userName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{review.userName || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">{renderStars(review.rating, false, 14)}</div>
                      </div>
                      <p className="text-slate-600 font-medium text-sm">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up section-delay-3">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <GraduationCap className="text-emerald-600" size={20} />
                  </div>
                  Education
                </h3>
                <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-emerald-200">
                  <p className="font-bold text-slate-900">{profile?.education || "Professional Training"}</p>
                  <p className="text-sm text-slate-500 mt-1">Certified Professional</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="text-emerald-600" size={20} />
                  </div>
                  Certifications
                </h3>
                <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-amber-200">
                  <p className="font-bold text-slate-900">Verified Professional</p>
                  <p className="text-sm text-slate-500 mt-1">Kamau Nepal Certified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="animate-fade-in-up section-delay-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 sticky top-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Booking</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Available</p>
                      <p className="font-bold text-slate-900 text-sm mt-1">{formatAvailabilitySummary(profile?.availability)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Service Area</p>
                      <p className="font-bold text-slate-900 text-sm mt-1">{formatServiceArea(profile?.serviceArea)}, Nepal</p>
                    </div>
                  </div>
                </div>

                {!isSelf ? (
                  <div className="space-y-3">
                    <Button
                      className={`w-full py-3 rounded-xl ${hasPending ? 'opacity-75' : ''}`}
                      variant={hasPending ? "secondary" : "primary"}
                      onClick={() => !hasPending && handleHire()}
                      disabled={hasPending}
                    >
                      {hasPending ? 'Approval Pending' : (alreadyReviewed ? 'Book Again' : 'Request Service')}
                    </Button>
                    <Button className="w-full py-3 rounded-xl" variant="secondary" onClick={handleChat}>
                      <MessageSquare size={18} className="mr-2" /> Chat
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl border border-teal-100 text-center">
                    <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center text-teal-700 mx-auto mb-3">
                      <ShieldCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Your Expert Profile</p>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 text-xs tracking-wider" 
                      onClick={() => navigate('/professional-dashboard')}
                    >
                      Manage Profile
                    </Button>
                  </div>
                )}

                <p className="mt-6 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  💳 Secure Payment via Khalti & eSewa
                </p>
              </div>

              {/* Top Review Preview */}
              {reviews && reviews.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Recent Review</h4>
                  <div className="flex gap-1 mb-3">
                    {renderStars(reviews[0].rating, false, 16)}
                  </div>
                  <p className="text-slate-700 italic font-medium text-sm mb-4 leading-relaxed">"{reviews[0].comment?.substring(0, 100)}..."</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                      {(reviews[0].userName || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{reviews[0].userName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsRequestModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            {isSubmitted ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                  <Check size={48} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Request Sent! ✓</h2>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  {profile?.firstName} will review your request and contact you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start p-6 md:p-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Request Service</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Booking {profile?.firstName} {profile?.lastName}</p>
                  </div>
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleRequestService} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Describe Your Issue</label>
                    <textarea
                      required
                      placeholder="What do you need help with?"
                      className="w-full min-h-[120px] p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium resize-none"
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Date</label>
                      <input
                        required
                        type="date"
                        min={(() => {
                          const now = new Date();
                          const offset = now.getTimezoneOffset();
                          const localDate = new Date(now.getTime() - (offset * 60 * 1000));
                          return localDate.toISOString().split('T')[0];
                        })()}
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                        value={requestDate}
                        onChange={(e) => setRequestDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Location</label>
                      <input
                        required
                        type="text"
                        placeholder="Where will the work happen?"
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                        value={requestLocation}
                        onChange={(e) => setRequestLocation(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <LocationPicker 
                        onLocationSelect={setPinLocation} 
                        initialLocation={[pinLocation.lat, pinLocation.lng]} 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Time Slot</label>
                      {!requestDate ? (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <p className="text-slate-500 text-sm font-medium">Select a date first</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {getAvailableSlots(requestDate, profile?.availability, profile?.jobType).length > 0 ? (
                            getAvailableSlots(requestDate, profile?.availability, profile?.jobType).map((slot) => (
                              <button
                                key={slot.label}
                                type="button"
                                onClick={() => setRequestTime(slot.label)}
                                className={`px-3 py-3 rounded-lg border-2 transition-all text-xs font-bold uppercase tracking-wider ${
                                  requestTime === slot.label
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                                }`}
                              >
                                {slot.label}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-full p-4 text-center bg-red-50 rounded-lg border border-red-200">
                              <p className="text-red-600 text-sm font-bold">Closed on {getDayName(requestDate)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Estimated Cost</p>
                    <p className="text-2xl font-bold text-emerald-700">रू {profile?.hourlyWage || 'TBD'}/hr</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl text-base gap-2"
                      variant="primary"
                      type="submit"
                    >
                      {isSubmitting ? 'Processing...' : <>Send Request</>}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Photo View Modal (Lightbox) */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
              <img 
                src={previewImage} 
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
                alt="Full Preview" 
              />
              <a 
                href={previewImage} 
                download 
                className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={18} /> Download Original
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalProfile;