import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, Calendar, MessageSquare, TrendingUp,
    Settings, HelpCircle, Briefcase, LogOut
} from 'lucide-react';
import { useTranslation } from '../utils/LanguageContext';
import { getUnreadCount } from '../services/messageService';

const Sidebar = ({ sidebarOpen, setSidebarOpen, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [professionalProfile, setProfessionalProfile] = React.useState(null);
    const [checkingProfessional, setCheckingProfessional] = React.useState(true);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);

    // Check if user is a professional
    React.useEffect(() => {
        const checkProfessionalStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setCheckingProfessional(false);
                return;
            }

            try {
                const response = await fetch('/api/professionals/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setProfessionalProfile(data.data);

                    // Fetch pending requests count
                    try {
                        const statsResponse = await fetch(`/api/bookings/professional/${data.data._id}/stats`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const statsData = await statsResponse.json();
                        if (statsData.success && statsData.data) {
                            setPendingRequestsCount(statsData.data.pendingRequests || 0);
                        }
                    } catch (err) {
                        console.error("Error fetching professional stats:", err);
                    }
                }
            } catch (err) {
                console.error("Error checking professional status:", err);
            } finally {
                setCheckingProfessional(false);
            }
        };

        checkProfessionalStatus();
    }, []);

    // Fetch unread messages count
    React.useEffect(() => {
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

    // Detect active tab based on route
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'overview';
        if (path === '/my-bookings') return 'bookings';
        if (path === '/services-history') return 'history';
        if (path === '/user-profile') return 'settings';
        if (path === '/messages') return 'messages';
        return 'overview';
    };

    const activeTab = getActiveTab();

    const menuItems = [
        { id: "overview", label: t('dashboard'), icon: Home, route: "/dashboard" },
        { id: "bookings", label: t('my_bookings'), icon: Calendar, route: "/my-bookings" },
        { id: "messages", label: t('messages'), icon: MessageSquare, route: "/messages", badge: unreadCount },
        { id: "history", label: t('history'), icon: TrendingUp, route: "/services-history" },
    
    ];

    const adminItems = [
        { id: "settings", label: t('settings'), icon: Settings, route: "/user-profile" },
        { id: "help", label: t('help'), icon: HelpCircle, route: "/help" },
    ];

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
                </div>
            )}

            <aside
                className={`fixed lg:sticky top-[64px] h-[calc(100vh-64px)] bg-white border-r border-gray-200 w-64 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <nav className="p-4 space-y-1 flex flex-col h-full">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.route) navigate(item.route);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                                    ? "bg-orange-50 text-orange-600 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon size={20} className={activeTab === item.id ? "text-orange-600" : "text-gray-400"} />
                                <span className="text-sm">{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto text-[10px] bg-red-500 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">{t('support_admin')}</p>
                        {adminItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.route) navigate(item.route);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === item.id ? "bg-orange-50 text-orange-600" : "text-gray-400"
                                    }`}
                            >
                                <item.icon size={20} className="text-gray-400" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pb-4 space-y-2">
                        {professionalProfile && professionalProfile.verificationStatus === 'verified' ? (
                            <button
                                onClick={() => {
                                    localStorage.setItem('activeRole', 'professional');
                                    navigate('/professional-dashboard');
                                    setSidebarOpen(false);
                                }}
                                className="relative w-full flex items-center gap-3 px-4 py-3 text-orange-600 bg-orange-50 rounded-xl transition font-bold shadow-sm"
                            >
                                <Briefcase size={20} />
                                <span className="text-sm">{t('pro_role')}</span>
                                {pendingRequestsCount > 0 && (
                                    <span className="absolute top-3 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-4 ring-red-500/20" title={`${pendingRequestsCount} Pending Requests`}></span>
                                )}
                            </button>
                        ) : professionalProfile && professionalProfile.verificationStatus === 'pending' ? (
                            <button
                                onClick={() => {
                                    navigate(`/professional/${professionalProfile._id}`);
                                    setSidebarOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-teal-600 hover:bg-teal-50 rounded-xl transition font-semibold"
                            >
                                <Briefcase size={20} />
                                <span className="text-sm">{t('pending_app')}</span>
                            </button>
                        ) : !checkingProfessional && (
                            <button
                                onClick={() => {
                                    navigate('/professional-registration');
                                    setSidebarOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-teal-600 hover:bg-teal-50 rounded-xl transition font-semibold"
                            >
                                <Briefcase size={20} />
                                <span className="text-sm">{professionalProfile && professionalProfile.verificationStatus === 'rejected' ? t('reapply_pro') : t('reg_pro')}</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-semibold"
                        >
                            <LogOut size={20} />
                            <span className="text-sm">{t('logout')}</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
