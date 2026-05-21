import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Search, Star, MapPin, CheckCircle2,
  MoreHorizontal, Twitter, Linkedin, Github,
  Heart, Zap, ShieldCheck, ArrowRight, UserCircle
} from 'lucide-react';
import Logo from '../Logo';
import axios from 'axios';
import Button from '../components/Button';
import OptimizedImage from '../components/OptimizedImage';
import { useTranslation } from '../utils/LanguageContext';



const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userName = localStorage.getItem('userName') || 'Professional User';
  const userProfileImage = localStorage.getItem('userProfileImage');

  const getInitials = (name) => {
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'UN'
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const fetchStatus = async () => {
        try {
          const response = await axios.get('/api/professionals/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            // Also sycn the role in localStorage if verified
            if (response.data.data.verificationStatus === 'verified') {
               localStorage.setItem('userRole', 'professional');
            }
          }
        } catch (error) {
          console.error('Error fetching professional status:', error);
        }
      };
      fetchStatus();
    }
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
    // Optional: reload to ensure full state clear
    window.location.reload();
  };

  // Fetch verified professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoadingProfessionals(true);
        const response = await axios.get('/api/professionals/', {
          params: {
            isVerified: true,
            limit: 12
          }
        });

        if (response.data.success && response.data.data) {
          // Format professionals data for display
          let formattedProfessionals = response.data.data.map(prof => ({
            _id: prof._id,
            name: `${prof.firstName} ${prof.lastName}`,
            title: prof.serviceCategory.charAt(0).toUpperCase() + prof.serviceCategory.slice(1),
            location: prof.serviceArea.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ', Nepal',
            rating: prof.rating || 4.5,
            reviews: prof.totalReviews || 0,
            verified: prof.isVerified,
            avatar: "👨‍💼",
            hourlyRate: ['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(prof.serviceCategory) 
              ? `रू ${prof.hourlyWage} (Fixed)` 
              : `रू ${prof.hourlyWage}/hr`,
            profileImage: prof.profileImage,
            serviceCategory: prof.serviceCategory, // Keep raw for OptimizedImage
            completedJobs: prof.completedJobs || 0
          }));

          // Filter out professionals with active bookings
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
                formattedProfessionals = formattedProfessionals.filter(p => !activeBookingProfessionalIds.includes(p._id));
              }
            } catch (err) {
              console.error('Error fetching bookings to filter professionals:', err);
            }
          }

          setProfessionals(formattedProfessionals);
        }
      } catch (error) {
        console.error('Error fetching professionals:', error);
        // Fallback to empty state if API fails
        setProfessionals([]);
      } finally {
        setLoadingProfessionals(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const [categoriesRes, activeCategoriesRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/professionals/categories')
        ]);

        if (categoriesRes.data.success && activeCategoriesRes.data.success) {
          const activeCategoryValues = activeCategoriesRes.data.data;
          
          const dynamicCategories = categoriesRes.data.data
            .filter(cat => activeCategoryValues.includes(cat.value))
            .map(cat => {
              const imgSrc = cat.image 
                ? (cat.image.startsWith('http') ? cat.image : `/${cat.image.replace(/\\/g, '/')}`)
                : null;
              return {
                name: cat.label,
                icon: imgSrc || '💼',
                iconType: imgSrc ? 'image' : 'emoji',
                id: cat.value
              };
            });

          setCategories(dynamicCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);



  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Part */}
      <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left: Logo */}
            <div className="flex-1">
              <Logo />
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-10">
              {['Companies', 'Services', 'People'].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
                  {item}
                </Link>
              ))}
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex-1 flex justify-end">
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => navigate(localStorage.getItem('userRole') === 'admin' ? '/admin/dashboard' : '/dashboard')}
                      className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                    >
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        {userProfileImage ? (
                          <OptimizedImage 
                            src={userProfileImage} 
                            alt={userName} 
                            className="h-full w-full" 
                            fallbackIcon={UserCircle}
                          />
                        ) : (
                          <div className="h-full w-full bg-teal-600 flex items-center justify-center text-white font-bold">
                            {getInitials(userName)}
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-900 leading-none">{userName}</div>
                        <div className="text-[11px] text-slate-400">
                          {localStorage.getItem('userRole') === 'admin' ? 'Admin Panel' : t('dashboard')}
                        </div>
                      </div>
                    </button>

                    <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>{t('login')}</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>{t('signup')}</Button>
                  </>
                )}
              </div>
              
              {/* Mobile Menu Toggle */}
              <div className="md:hidden flex items-center">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:text-teal-600">
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4 shadow-xl">
            {['Companies', 'Services', 'People'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="block text-base font-semibold text-slate-700 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="w-full" 
                    variant="secondary" 
                    onClick={() => { 
                      navigate(localStorage.getItem('userRole') === 'admin' ? '/admin/dashboard' : '/dashboard'); 
                      setMobileMenuOpen(false); 
                    }}
                  >
                    {localStorage.getItem('userRole') === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                  </Button>

                  <Button className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/login')}>{t('login')}</Button>
                  <Button className="w-full" onClick={() => navigate('/signup')}>{t('signup')}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Hero Part */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-br from-teal-50 via-white to-orange-50">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-6">
                  <Zap size={14} className="fill-teal-700" /> {t('trusted_by')}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                  {t('hero_title_1')} <span className="text-teal-600">{t('hero_title_2')}</span>{t('hero_title_3')}
                </h1>
                <p className="text-base text-slate-600 mb-10 max-w-2xl leading-relaxed">
                  {t('hero_desc')}
                </p>
                <div className="relative group max-w-2xl mb-12">
                  <div className="absolute inset-0 bg-teal-600/5 rounded-[22px] blur-xl group-focus-within:bg-teal-600/10 transition-all" />
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[20px] shadow-lg border border-slate-200">
                    <div className="flex-grow relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input type="text" placeholder={t('search_placeholder')} className="w-full bg-transparent py-4 pl-12 pr-4 text-slate-800 focus:outline-none font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button 
                      variant="primary" 
                      className="sm:px-10 rounded-2xl group"
                      onClick={() => navigate('/explore-jobs', { state: { searchQuery } })}
                    >
                      {t('search')} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 mb-4"><ShieldCheck size={20} /></div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('looking_for_work')}</h3>
                    <p className="text-sm text-slate-500 mb-4">Set up your profile and reach top companies searching for your skills.</p>
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/explore-jobs')}>{t('explore_pros')} </Button>
                  </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 mb-4"><UserCircle size={20} /></div>
                    <h3 className="font-bold text-slate-900 mb-1">{t('need_to_hire')}</h3>
                    <p className="text-sm text-slate-500 mb-4">Find verified service providers with high ratings and local expertise.</p>
                    <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/explore-jobs')}>{t('start_hiring')}</Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 hidden lg:block relative">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200/40 rounded-3xl rotate-12 -z-10" />
                  <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-teal-200/40 rounded-full -z-10" />
                  <img src="/assets/homepage.jpg" alt="Professional Worker" className="rounded-[40px] shadow-2xl border-[12px] border-white object-cover aspect-[4/5] w-full" />
                  <div className="absolute bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white"><ShieldCheck size={24} /></div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                          <CheckCircle2 size={14} className="fill-emerald-100" />
                          <p className="text-[10px] font-black uppercase tracking-wider">{t('verified_talent')}</p>
                        </div>
                        <p className="text-lg font-black text-slate-900">{t('guaranteed')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Part */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-orange-500 mb-4 tracking-tight">{t('what_need_today')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium mb-16">{t('popular_subtitle')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {loadingCategories ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-100 h-32 rounded-3xl" />
                ))
              ) : categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <button 
                    key={category.id} 
                    onClick={() => navigate('/people', { state: { selectedCategory: category.id } })}
                    className="group flex flex-col items-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="w-20 h-20 mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                      {category.iconType === 'image' ? (
                        <OptimizedImage 
                          src={category.icon} 
                          alt={category.name} 
                          className="w-full h-full" 
                          objectFit="object-contain"
                        />
                      ) : (
                        <span className="text-5xl">{category.icon}</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 text-center">{category.name}</p>
                    <span className="text-[10px] uppercase tracking-widest text-teal-600 font-bold mt-1">{t('available_now')}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-8 text-slate-400 font-medium">No active categories found</div>
              )}
            </div>
            {!loadingCategories && categories.length > 5 && (
              <div className="mt-10 text-center">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => navigate('/services')}
                >
                  View All Services <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Professional Part */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">{t('featured_pros')}</h2>
                <p className="text-slate-500 font-medium">{t('featured_subtitle')}</p>
              </div>
              <Button 
                variant="outline" 
                className="hidden md:flex gap-2"
                onClick={() => navigate('/people')}
              >
                {t('view_all_experts')} <MoreHorizontal size={18} />
              </Button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              {loadingProfessionals ? (
                <div className="flex-1 text-center py-8 min-w-full">
                  <p className="text-slate-500">Loading professionals...</p>
                </div>
              ) : professionals.length > 0 ? (
                professionals.map((p) => (
                  <div key={p._id} className="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:border-teal-500 transition-all duration-300 flex flex-col relative overflow-hidden snap-start shrink-0" style={{ width: '300px', minHeight: '380px' }}>
                    <div className="absolute top-0 left-0 w-full h-2 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 shadow-inner overflow-hidden relative">
                        <OptimizedImage
                          src={p.profileImage}
                          alt={p.name}
                          className="w-full h-full"
                          fallbackIcon={UserCircle}
                        />
                      </div>
                      {p.verified && <div className="bg-teal-50 text-teal-600 p-1.5 rounded-xl"><CheckCircle2 size={18} /></div>}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.name}</h3>
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">{p.title}</p>
                    </div>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(p.rating) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                        </div>
                        <span className="text-sm font-black">{p.rating}</span>
                        <span className="text-sm text-slate-400">({p.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 truncate"><MapPin size={16} className="text-teal-500 shrink-0" /> <span className="truncate">{p.location}</span></div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600 w-fit">
                        <CheckCircle2 size={14} className="text-emerald-500" /> {p.completedJobs} {p.completedJobs === 1 ? t('service') : t('services_done')}
                      </div>
                      <div className="text-base font-black text-slate-900">{p.hourlyRate}</div>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-auto rounded-2xl"
                      onClick={() => navigate(`/professional/${p._id}`)}
                    >
                      {t('book_now')}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex-1 text-center py-8 min-w-full">
                  <p className="text-slate-500">No verified professionals yet. Be the first to register!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Part */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <Logo className="mb-6 brightness-0 invert" />
              <p className="max-w-xs text-slate-400 font-medium leading-relaxed mb-8">Empowering Nepal's workforce by connecting skilled professionals with life-changing opportunities.</p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all"><Icon size={20} /></button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/services" className="hover:text-teal-400 transition-colors">Services</Link></li>
                <li><Link to="/companies" className="hover:text-teal-400 transition-colors">Companies</Link></li>
                <li><Link to="/explore-jobs" className="hover:text-teal-400 transition-colors">Featured Talent</Link></li>
                <li><Link to="/help" className="hover:text-teal-400 transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/help" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
                {[
                  { label: 'Privacy Policy', path: '/privacy-policy' },
                  { label: 'Terms of Service', path: '/terms-of-service' },
                  { label: 'Trust & Safety', path: '/trust-and-safety' }
                ].map(l => (
                  <li key={l.label}><Link to={l.path} className="hover:text-teal-400 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2025 Kamau Nepal. All rights reserved.</p>
            <div className="flex items-center gap-1">Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Kathmandu</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;