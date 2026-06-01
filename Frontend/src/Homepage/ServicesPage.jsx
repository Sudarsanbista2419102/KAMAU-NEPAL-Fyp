import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, Zap, Droplets, Paintbrush, 
  Trash2, GraduationCap, Car, 
  Hammer, ArrowRight, Loader, UserCircle
} from 'lucide-react';
import axios from 'axios';
import Logo from '../Logo';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import OptimizedImage from '../components/OptimizedImage';


const ServicesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/professionals/categories');
      if (response.data.success) {
        // Map raw strings to object with icons
        const iconMap = {
          'plumbing': <Droplets className="text-blue-500" size={32} />,
          'electrical': <Zap className="text-yellow-500" size={32} />,
          'cleaning': <Trash2 className="text-teal-500" size={32} />,
          'carpentry': <Hammer className="text-orange-700" size={32} />,
          'painting': <Paintbrush className="text-purple-500" size={32} />,
          'mechanic': <Car className="text-red-500" size={32} />,
          'tutoring': <GraduationCap className="text-indigo-500" size={32} />,
          'gardening': <Wrench className="text-emerald-500" size={32} />,
        };

        const descMap = {
          'plumbing': 'Expert leak repairs, pipe installations, and bathroom fittings.',
          'electrical': 'Wiring, appliance repair, and electrical safety inspections.',
          'cleaning': 'Deep home cleaning, office maintenance, and sanitization.',
          'carpentry': 'Custom furniture, cabinet making, and wood repairs.',
          'painting': 'Interior and exterior painting with premium finishes.',
          'mechanic': 'On-site vehicle maintenance and emergency repairs.',
          'tutoring': 'Academic support for all levels and specialized skills.',
          'gardening': 'Expert lawn care, landscaping, and garden maintenance.',
        };

        const mapped = response.data.data.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: iconMap[cat.toLowerCase()] || <Wrench className="text-slate-500" size={32} />,
          description: descMap[cat.toLowerCase()] || 'Find the best professionals in this category.',
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate('/people', { state: { selectedCategory: catId } });
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
            <Link to="/services" className="text-teal-600 font-bold">Services</Link>
            <Link to="/people" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors">People</Link>
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

      <header className="bg-orange-500 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black mb-4">Our Services</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            From home repairs to professional consulting, find the right expert for any task.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="text-orange-500 animate-spin mb-4" size={48} />
            <p className="text-slate-500 font-bold">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(service => (
              <div 
                key={service.id} 
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center cursor-pointer"
                onClick={() => handleCategoryClick(service.id)}
              >
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{service.description}</p>
                <Button variant="ghost" className="w-full group-hover:bg-teal-50">
                  Explore <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}

       
      </main>
    </div>
  );
};

export default ServicesPage;
