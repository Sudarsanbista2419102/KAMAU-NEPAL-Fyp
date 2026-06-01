import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ExternalLink, Star, UserCircle } from 'lucide-react';
import Logo from '../Logo';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import OptimizedImage from '../components/OptimizedImage';


const CompaniesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userName = localStorage.getItem('userName') || 'User';
  const userProfileImage = localStorage.getItem('userProfileImage');

  React.useEffect(() => {
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

  const companies = [
    {
      id: 'plumbing',
      name: "Kathmandu Plumbing Solutions",
      industry: "Construction",
      location: "Kathmandu",
      rating: 4.5,
      employees: "50+",
      logo: "https://picsum.photos/seed/ntc/200/200",
      description: "Leading service provider for residential and commercial plumbing."
    },
    {
      id: 'electrical',
      name: "Everest Electricals",
      industry: "Maintenance",
      location: "Lalitpur",
      rating: 4.4,
      employees: "30+",
      logo: "https://picsum.photos/seed/ncell/200/200",
      description: "Specialized in high-voltage wiring and smart home systems."
    },
    {
      id: 'cleaning',
      name: "Clean Nepal Co.",
      industry: "Hospitality",
      location: "Kathmandu",
      rating: 4.8,
      employees: "100+",
      logo: "https://picsum.photos/seed/f1soft/200/200",
      description: "Standard-setting cleaning services for offices and homes."
    },
    {
      id: 'carpentry',
      name: "Himalayan Woods",
      industry: "Manufacturing",
      location: "Lalitpur",
      rating: 4.6,
      employees: "20+",
      logo: "https://picsum.photos/seed/cloudfactory/200/200",
      description: "Premium woodwork and custom furniture manufacturing."
    },
    {
      id: 'mechanic',
      name: "AutoFix Experts",
      industry: "Automotive",
      location: "Kathmandu",
      rating: 4.7,
      employees: "40+",
      logo: "https://picsum.photos/seed/deerhold/200/200",
      description: "Full-service automotive repair and maintenance center."
    },
    {
      id: 'painting',
      name: "Vibrant Walls",
      industry: "Decor",
      location: "Kathmandu",
      rating: 4.3,
      employees: "15+",
      logo: "https://picsum.photos/seed/pathao/200/200",
      description: "Professional interior and exterior painting services."
    }
  ];

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSectorView = (sectorId) => {
    navigate('/explore-jobs', { state: { searchQuery: sectorId } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center gap-6">
            <BackButton variant="simple" />
            <Logo />
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-8">
            <Link to="/companies" className="text-teal-600 font-bold">Companies</Link>
            <Link to="/services" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors">Services</Link>
            <Link to="/people" className="text-slate-600 hover:text-teal-600 font-semibold transition-colors">People</Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(localStorage.getItem('userRole') === 'admin' ? '/admin/dashboard' : '/dashboard')}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all"
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
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{userName}</div>
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

      <header className="bg-teal-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black mb-4">Top Companies in Nepal</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">
            Discover and connect with the best employers across various industries in Nepal.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search companies by name or industry..." 
              className="w-full py-4 pl-12 pr-4 rounded-2xl text-slate-900 dark:text-slate-100 dark:bg-slate-800 focus:outline-none shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex gap-4 mb-6">
                <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{company.name}</h3>
                  <p className="text-teal-600 font-semibold text-sm">{company.industry}</p>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{company.description}</p>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1"><MapPin size={16} /> {company.location}</div>
                <div className="flex items-center gap-1"><Building2 size={16} /> {company.employees} Employees</div>
                <div className="flex items-center gap-1"><Star size={16} className="text-orange-400 fill-orange-400" /> {company.rating}</div>
              </div>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all"
                onClick={() => handleSectorView(company.id)}
              >
                View Sector Professionals <ExternalLink size={16} className="ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CompaniesPage;
