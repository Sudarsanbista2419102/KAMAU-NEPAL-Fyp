'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Link removed - unused
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Search, MapPin, DollarSign,
    Filter, BookmarkPlus, Share2, ChevronLeft,
    ChevronRight, Star, CheckCircle2, MessageSquare,
    ArrowRightLeft, Menu, Bell,
    Award, ShieldCheck, Clock, Map, UserCircle
} from 'lucide-react';
import Logo from '../Logo';
import NotificationsMenu from '../components/NotificationsMenu';
import OptimizedImage from '../components/OptimizedImage';


// --- Internal Helper: Button ---
const Button = ({
    children, variant = 'primary', size = 'md', className = '', ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
    const variants = {
        primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95',
        secondary: 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 active:scale-95',
        orange: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95',
        ghost: 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
        outline: 'border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
    };
    const sizes = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'p-2.5'
    };
    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const CATEGORY_IMAGE_MAP = {
    'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
    'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    'Plumbing': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400',
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=400',
    'Security': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400',
    'Graphic Designer': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400',
    'Developer': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
    'Logo Designer': 'https://images.unsplash.com/photo-1572044162444-ad60f128bde7?auto=format&fit=crop&q=80&w=400',
    'Tutoring': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400',
    'Mechanic': '/assets/categories/mechanic.png',
    'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=400',
    'Gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400',
    'Freelancer': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    'Waiter': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400',
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=400';

const LOCATIONS = ['All Locations', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Remote'];
const LEVELS = ['All Levels', 'Entry-level', 'Mid-level', 'Senior'];
const JOBS_PER_PAGE = 6;

export default function ExploreJobs() {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollContainerRef = useRef(null);

    const [professionals, setProfessionals] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const savedLoc = localStorage.getItem("userLocation")?.toLowerCase() || "";
        if (savedLoc.includes("kathmandu")) return "Kathmandu";
        if (savedLoc.includes("lalitpur") || savedLoc.includes("patan")) return "Lalitpur";
        if (savedLoc.includes("bhaktapur")) return "Bhaktapur";
        return "All Locations";
    });
    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [showFilters, setShowFilters] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [userProfileImage, setUserProfileImage] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.profileImage) {
                    setUserProfileImage(user.profileImage);
                }
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);


    // Extract dynamic categories from the fetched professionals
    const dynamicCategories = useMemo(() => {
        const uniqueCats = [...new Set(professionals.map(p => p.title))];
        return uniqueCats.map(title => {
            const normalizedTitle = title.toLowerCase().replace(/\s+/g, '_');
            const matchedCat = categoriesData.find(c => c.value?.toLowerCase() === normalizedTitle || c.label?.toLowerCase().includes(title.toLowerCase()));
            
            let imageUrl = CATEGORY_IMAGE_MAP[title] || DEFAULT_IMAGE;
            if (matchedCat && matchedCat.image) {
                imageUrl = matchedCat.image.startsWith('http') ? matchedCat.image : `/${matchedCat.image.replace(/\\/g, '/')}`;
            }

            return {
                title,
                image: imageUrl
            };
        });
    }, [professionals, categoriesData]);

    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/professionals/', {
                    params: { isVerified: true }
                });

                if (response.data.success) {
                    let mapped = response.data.data.map(p => ({
                        id: p._id,
                        title: p.serviceCategory ? p.serviceCategory.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'Professional',
                        company: `${p.firstName} ${p.lastName}`,
                        location: p.serviceArea ? p.serviceArea.charAt(0).toUpperCase() + p.serviceArea.slice(1) : 'Nepal',
                        salary: ['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(p.serviceCategory) 
                            ? `रू ${p.hourlyWage} (Fixed)` 
                            : `रू ${p.hourlyWage}/hr`,
                        level: p.completedJobs > 10 ? 'Senior' : (p.completedJobs > 3 ? 'Mid-level' : 'Entry-level'),
                        completedJobs: p.completedJobs || 0,
                        skills: [p.serviceCategory, 'Reliable'],
                        posted: 'Recent',
                        description: p.bio || `Expert professional in ${p.serviceCategory} services available for hire.`,
                        profileImage: p.profileImage,
                        rating: p.rating || 0,
                        reviews: p.totalReviews || 0
                    }));

                    const userId = localStorage.getItem('userId');
                    if (userId) {
                        try {
                            const { getUserBookings } = await import('../bookingService');
                            const bookingsData = await getUserBookings(userId);
                            const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || []);
                            
                            const activeBookingProfessionalIds = bookings
                                .filter(b => ['Pending', 'Confirmed', 'In Progress'].includes(b.status))
                                .map(b => {
                                    if (b.professionalId && typeof b.professionalId === 'object') return b.professionalId._id;
                                    return b.professionalId;
                                })
                                .filter(Boolean);

                            if (activeBookingProfessionalIds.length > 0) {
                                mapped = mapped.filter(p => !activeBookingProfessionalIds.includes(p.id));
                            }
                        } catch (err) {
                            console.error('Error filtering booked professionals:', err);
                        }
                    }

                    setProfessionals(mapped);
                }
            } catch (err) {
                console.error('Error fetching professionals:', err);
            } finally {
                setTimeout(() => setLoading(false), 800); // Smooth loading transition
            }
        };

        fetchProfessionals();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                if (response.data.success) {
                    setCategoriesData(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const filteredJobs = useMemo(() => {
        return professionals.filter(job => {
            const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = selectedLocation === 'All Locations' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
            const matchesLevel = selectedLevel === 'All Levels' || job.level === selectedLevel;
            return matchesSearch && matchesLocation && matchesLevel;
        });
    }, [searchQuery, selectedLocation, selectedLevel, professionals]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);

    const toggleSaveJob = (e, jobId) => {
        e.stopPropagation();
        setSavedJobs(prev =>
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    const isJobSaved = (jobId) => savedJobs.includes(jobId);

    const [compareJobs, setCompareJobs] = useState([]);
    const toggleCompareJob = (e, jobId) => {
        e.stopPropagation();
        setCompareJobs(prev => {
            if (prev.includes(jobId)) {
                toast.success("Removed from comparison");
                return prev.filter(id => id !== jobId);
            } else {
                if (prev.length >= 3) {
                    toast.error("You can only compare up to 3 professionals");
                    return prev;
                }
                toast.success("Added to comparison");
                return [...prev, jobId];
            }
        });
    };
    const isJobCompared = (jobId) => compareJobs.includes(jobId);

    const scrollCategories = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* 1. Header / Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    {/* Left: Logo */}
                    <div className="flex-1 flex items-center gap-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                            title="Go Back"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <Logo />
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex flex-1 items-center justify-center gap-10">
                        {['Companies', 'Services', 'People'].map((item) => (
                            <button 
                                key={item} 
                                onClick={() => navigate(`/${item.toLowerCase()}`)} 
                                className={`text-sm font-semibold transition-colors ${location.pathname === `/${item.toLowerCase()}` ? 'text-teal-600 font-bold' : 'text-slate-600 hover:text-teal-600'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-1 flex items-center justify-end gap-4 relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 relative"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                        </Button>
                        
                        <NotificationsMenu 
                            isOpen={isNotificationsOpen} 
                            onClose={() => setIsNotificationsOpen(false)} 
                        />

                        <button
                            onClick={() => navigate(localStorage.getItem('userRole') === 'admin' ? '/admin/dashboard' : '/dashboard')}
                            className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                                {userProfileImage ? (
                                    <OptimizedImage 
                                        src={userProfileImage.startsWith('http') ? userProfileImage : `/${userProfileImage}`} 
                                        alt={localStorage.getItem('userName') || 'User'} 
                                        className="h-full w-full" 
                                        fallbackIcon={UserCircle}
                                    />
                                ) : (
                                    <div className="h-full w-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                                        {(localStorage.getItem('userName') || 'User').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{localStorage.getItem('userName') || 'User'}</div>
                                <div className="text-[10px] text-slate-400">
                                    {localStorage.getItem('userRole') === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                </div>
                            </div>
                        </button>
                        <button className="lg:hidden p-2 text-slate-500">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="relative pt-20 pb-16 px-6 overflow-hidden bg-white dark:bg-slate-900">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 mb-8 tracking-tight"
                    >
                        Explore Top-Rated <span className="text-teal-600 underline decoration-teal-100 underline-offset-8">Professionals</span> in Nepal
                    </motion.h1>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative group max-w-2xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-teal-600/5 rounded-[32px] blur-2xl group-focus-within:bg-teal-600/10 transition-all" />
                        <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[28px] p-2 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 dark:focus-within:ring-teal-900/30 transition-all">
                            <Search className="ml-6 text-slate-400" size={22} />
                            <input
                                type="text"
                                placeholder="Search by pro name or service category..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="flex-1 px-4 py-4 bg-transparent outline-none text-base font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <Button variant="primary" className="rounded-2xl py-4 px-8 hidden sm:block">Search Now</Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. Top Categories Section */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            Top Service Categories <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        </h2>
                        <p className="text-sm font-bold text-slate-400">Trusted experts across multiple domains</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scrollCategories('left')} className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-100 dark:hover:border-teal-700 shadow-sm transition-all"><ChevronLeft size={20} /></button>
                        <button onClick={() => scrollCategories('right')} className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-100 dark:hover:border-teal-700 shadow-sm transition-all"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                >
                    {dynamicCategories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8 }}
                            onClick={() => {
                                setSearchQuery(cat.title);
                                setCurrentPage(1);
                                window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            className="flex-shrink-0 w-64 h-44 relative rounded-[28px] overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50 border border-slate-100"
                        >
                            <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className="text-white font-black text-lg leading-tight mb-1 group-hover:text-teal-400 transition-colors">{cat.title}</h3>
                                <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                                    Explore Services <ChevronRight size={12} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. Filters & Results Header */}
            <section className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">Featured Professionals</h2>
                        <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                            {filteredJobs.length} Found
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1.5">
                            <Button 
                                variant={!showFilters ? 'ghost' : 'outline'} 
                                size="sm" 
                                className={`rounded-xl ${!showFilters ? 'text-teal-600 font-black' : ''}`}
                                onClick={() => setShowFilters(false)}
                            >
                                <Map size={14} className="mr-2" /> Top Viewed
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl border-transparent shadow-none"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={14} className="mr-2" /> {showFilters ? 'Close' : 'More'} Filters
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1.5 px-4 h-[46px]">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Location:</span>
                            <select 
                                value={selectedLocation} 
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="text-xs font-bold bg-transparent outline-none cursor-pointer text-slate-700"
                            >
                                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white dark:bg-slate-800 border-x border-b border-slate-100 dark:border-slate-700 rounded-b-[32px] mb-8"
                        >
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Award size={14} className="text-orange-500" /> Experience Level
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {LEVELS.map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSelectedLevel(level)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedLevel === level ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-teal-500" /> Professional Status
                                    </h4>
                                    <div className="flex gap-3">
                                        <button className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100">Verified Only</button>
                                        <button className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100">Background Checked</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* 5. Professional Grid */}
            <section className="max-w-7xl mx-auto px-6 py-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 animate-pulse border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-100 rounded w-2/3" />
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="h-3 bg-slate-100 rounded w-full" />
                                    <div className="h-3 bg-slate-100 rounded w-full" />
                                </div>
                                <div className="h-12 bg-slate-100 rounded-2xl" />
                            </div>
                        ))
                    ) : paginatedJobs.length > 0 ? (
                        paginatedJobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 hover:border-teal-100 dark:hover:border-teal-700 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all p-7 relative"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner">
                                            {job.profileImage ? (
                                                <OptimizedImage 
                                                    src={job.profileImage.startsWith('http') ? job.profileImage : `/${job.profileImage}`} 
                                                    alt={job.company} 
                                                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                    objectFit="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-100">👨‍💼</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">{job.company}</h3>
                                                <CheckCircle2 size={14} className="text-teal-500 fill-teal-50" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.title}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => toggleSaveJob(e, job.id)}
                                        className={`p-2.5 rounded-xl transition-all ${isJobSaved(job.id) ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
                                    >
                                        <BookmarkPlus size={18} className={isJobSaved(job.id) ? 'fill-orange-500' : ''} />
                                    </button>
                                </div>

                                {/* Service Category Image */}
                                <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden mb-6 shadow-md">
                                    <OptimizedImage
                                        src={job.image || DEFAULT_IMAGE}
                                        alt={job.title}
                                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        objectFit="object-cover"
                                    />
                                </div>

                                {/* Verification Status */}
                                <div className="flex items-center gap-1.5 mb-6">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                        <ShieldCheck size={10} /> Fully Verified
                                    </div>
                                    {job.completedJobs > 10 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                            <Award size={10} /> Top Rated
                                        </div>
                                    )}
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 text-center">
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5">Services</div>
                                        <div className="text-xs font-black text-slate-900 dark:text-slate-100">{job.completedJobs > 0 ? `${job.completedJobs}+` : 'New'}</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 text-center">
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5">Rating</div>
                                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
                                            <Star size={10} className="fill-orange-400 text-orange-400" /> {job.rating || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 text-center">
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5">Area</div>
                                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">Nepal</div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={14} className="text-slate-400 mt-0.5" />
                                        <p className="text-xs font-bold text-slate-500 leading-tight truncate">{job.location}, Kathmandu City, Bagmati Province...</p>
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-3 bg-teal-50/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} className="text-teal-600" />
                                            <span className="text-xs font-black text-teal-700">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-teal-600 uppercase">
                                            <Clock size={12} /> Flexible
                                        </div>
                                    </div>
                                </div>



                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button 
                                        variant="primary" 
                                        className="w-full rounded-2xl py-4"
                                        onClick={() => navigate(`/professional/${job.id}`)}
                                    >
                                        Book Now
                                    </Button>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl px-0 text-[10px]" onClick={() => navigate(`/professional/${job.id}`)}>Profile</Button>
                                        <Button variant="outline" size="sm" className="rounded-xl px-0 text-[10px]" onClick={(e) => {
                                            e.stopPropagation();
                                            const token = localStorage.getItem('token');
                                            if (!token) { navigate('/login'); return; }
                                            navigate('/messages', { state: { composeTo: job.id, subject: `Inquiry about ${job.title}` } });
                                        }}><MessageSquare size={14} className="mr-1" /> Message</Button>
                                        <Button variant={isJobCompared(job.id) ? "primary" : "outline"} size="sm" className="rounded-xl px-0 text-[10px]" onClick={(e) => toggleCompareJob(e, job.id)}><ArrowRightLeft size={14} className="mr-1" /> {isJobCompared(job.id) ? "Added" : "Compare"}</Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Professionals Found</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <Button variant="primary" className="rounded-2xl" onClick={() => { setSearchQuery(''); setSelectedLocation('All Locations'); setSelectedLevel('All Levels'); }}>
                                Reset All Filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-20">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-14 h-14 rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/30 scale-110' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-200'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>

            {/* Footer Placeholder (Matching the user image) */}
            <footer className="bg-white border-t border-slate-100 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <button onClick={() => navigate("/")} className="hover:text-slate-900 transition">Home</button>
                        <button onClick={() => navigate("/services")} className="hover:text-slate-900 transition">Services</button>
                        <button onClick={() => navigate("/terms")} className="hover:text-slate-900 transition">Terms</button>
                        <button onClick={() => navigate("/companies")} className="hover:text-slate-900 transition">Companies</button>
                        <button onClick={() => navigate("/signup")} className="hover:text-slate-900 transition">Sign Up</button>
                    </div>
                    <div className="flex gap-4">
                        {['facebook', 'instagram', 'youtube'].map(social => (
                            <div key={social} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all cursor-pointer">
                                <Share2 size={14} />
                            </div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
