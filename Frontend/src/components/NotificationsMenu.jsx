import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Clock, X, Trash2, Info } from 'lucide-react';

const NotificationsMenu = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-teal-500" />;
      case 'warning': return <Clock size={18} className="text-orange-500" />;
      case 'error': return <X size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-14 right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          Notifications 
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-teal-600 font-semibold hover:text-teal-700 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={20} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">You have no notifications!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => !notif.read && markAsRead(notif._id)}
                className={`p-4 flex gap-3 transition cursor-pointer relative group ${!notif.read ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-white hover:bg-slate-50/50'}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
                )}
                <div className="mt-0.5 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-sm tracking-tight mb-0.5 ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 uppercase tracking-widest">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Hover Actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button 
                    onClick={(e) => deleteNotification(notif._id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  {!notif.read && (
                    <button 
                      onClick={(e) => markAsRead(notif._id, e)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Mark as read"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">End of notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
