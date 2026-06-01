import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Star, MapPin, CheckCircle2, SlidersHorizontal, Loader, UserCircle } from 'lucide-react';
import axios from 'axios';
import Logo from '../Logo';
import Button from '../components/Button';
import OptimizedImage from '../components/OptimizedImage';
import BackButton from '../components/BackButton';


const PeoplePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userName = localStorage.getItem('userName') || 'User';
  const userProfileImage = localStorage.getItem('userProfileImage');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

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
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedCategory || location.state?.searchQuery || '');
  const [selectedArea, setSelectedArea] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [catRes, areaRes] = await Promise.all([
        axios.get('/api/professionals/categories'),
        axios.get('/api/professionals/areas')
      ]);
      if (catRes.data.success) setAvailableCategories(catRes.data.data);
      if (areaRes.data.success) setAvailableAreas(areaRes.data.data);
    } catch (err) {
      console.error('Error fetching filter metadata:', err);
    }
  }, []);

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory) params.append('serviceCategory', selectedCategory);
      if (selectedArea) params.append('serviceArea', selectedArea);
      
      const response = await axios.get(`/api/professionals?${params.toString()}`);
      if (response.data.success) {
        setProfessionals(response.data.data || []);
      } else {
        setError('Failed to load professionals');
      }
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedArea]);

  useEffect(() => {
    fetchMetadata();
    fetchProfessionals();
  }, [selectedCategory, selectedArea, fetchMetadata, fetchProfessionals]);

  const filteredPeople = professionals.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.serviceCategory && p.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.serviceArea && p.serviceArea.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatServiceCategory = (cat) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const formatServiceArea = (area) => {
    if (!area) return '';
    return area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedArea('');
    setSearchQuery('');
  };



  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center gap-6">
            <BackButton variant="simple" />
            <Logo />
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            <Link to="/companies" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors">Companies</Link>
            <Link to="/services" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors">Services</Link>
            <Link to="/people" className="text-teal-600 font-bold">People</Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(localStorage.getItem('userRole') === 'admin' ? '/admin/dashboard' : '/dashboard')}
                className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all"
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
                    <div className="h-full w-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(userName)}
                    </div>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">{userName}</div>
                  <div className="text-[10px] text-slate-400">
                    {localStorage.getItem('userRole') === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </div>
                </div>
              </button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 mt-4">Find Professionals</h1>
              <p className="text-slate-500">Connect with verified experts in your area.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative flex-grow md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search by name or keyword..." 
                    className="w-full py-3.5 pl-11 pr-4 bg-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant={showFilters || selectedCategory || selectedArea ? 'secondary' : 'outline'} 
                  size="icon" 
                  className="rounded-2xl h-[52px] w-[52px]"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={20} />
                </Button>
              </div>
              
              {/* Filter Overlay */}
              {showFilters && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl absolute md:relative top-full right-0 left-0 z-40 mt-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Filters</h3>
                    {(selectedCategory || selectedArea) && (
                      <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold"
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map((cat, idx) => (
                          <option key={`cat-${cat}-${idx}`} value={cat}>{formatServiceCategory(cat)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Location</label>
                      <select 
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold"
                      >
                        <option value="">All Locations</option>
                        {availableAreas.map((area, idx) => (
                          <option key={`area-${area}-${idx}`} value={area}>{formatServiceArea(area)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="text-teal-600 animate-spin mb-4" size={48} />
            <p className="text-slate-500 font-bold">Refining your results...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <Button onClick={fetchProfessionals}>Try Again</Button>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500 mb-6">We couldn't find anyone matching those filters.</p>
            <Button variant="outline" onClick={clearFilters}>Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPeople.map(person => (
              <div key={person._id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <OptimizedImage 
                      src={person.profileImage}
                      alt={`${person.firstName} ${person.lastName}`}
                      className="w-20 h-20 rounded-2xl shadow-md border-2 border-white"
                    />
                    {person.isVerified && (
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-1 rounded-lg border-2 border-white">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-black text-slate-900">
                      <Star size={16} className="text-orange-400 fill-orange-400" />
                      {person.rating || 0}
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{person.totalReviews || 0} Reviews</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase">
                    {person.firstName} {person.lastName}
                  </h3>
                  <p className="text-teal-600 font-bold text-sm uppercase tracking-widest mt-1">
                    {formatServiceCategory(person.serviceCategory)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <MapPin size={16} className="text-teal-500" /> {formatServiceArea(person.serviceArea)}, Nepal
                </div>

                {person.bio && (
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 italic">
                    "{person.bio}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                  <div className="text-lg font-black text-slate-900">
                    रू {person.hourlyWage || 'N/A'}/hr
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="rounded-[14px]"
                    onClick={() => navigate(`/professional/${person._id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PeoplePage;
