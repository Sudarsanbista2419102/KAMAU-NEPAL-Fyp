'use client';

import React, { useState } from 'react';
import {
  Bell,
  ArrowLeft,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
  Clock,
  User,
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success',
      title: 'Booking Confirmed',
      description: 'Your booking with Sarah Johnson has been confirmed for March 15, 2024',
      timestamp: '2 hours ago',
      read: false,
      userName: 'Sarah Johnson',
      avatar: '👩‍💼',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      description: 'Mike Chen sent you a message about the project details',
      timestamp: '4 hours ago',
      read: false,
      userName: 'Mike Chen',
      avatar: '👨‍💻',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Payment Pending',
      description: 'Your payment for the web development service is pending approval',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'Schedule Reminder',
      description: 'You have a scheduled meeting with John Doe in 2 hours',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: '5',
      type: 'success',
      title: 'Service Completed',
      description: 'The graphic design service has been completed successfully',
      timestamp: '3 days ago',
      read: true,
    },
    {
      id: '6',
      type: 'message',
      title: 'Review Request',
      description: 'Emily Wilson is requesting your feedback on the design work',
      timestamp: '4 days ago',
      read: true,
      userName: 'Emily Wilson',
      avatar: '👩‍🎨',
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-cyan-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type, read) => {
    if (read) return 'bg-white hover:bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50 hover:bg-green-100';
      case 'warning':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'message':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'info':
        return 'bg-cyan-50 hover:bg-cyan-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBg(
                  notification.type,
                  notification.read
                )} border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-pointer group`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {notification.avatar ? (
                      <div className="text-2xl">{notification.avatar}</div>
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm font-semibold ${
                              notification.read
                                ? 'text-gray-700'
                                : 'text-gray-900 font-bold'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        {notification.userName && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {notification.userName}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}