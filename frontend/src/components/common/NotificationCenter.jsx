import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      
      // Ensure we always have an array
      const notificationsData = Array.isArray(response.data) ? response.data : 
                               (response.data.notifications && Array.isArray(response.data.notifications)) ? response.data.notifications : 
                               [];
      
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('âŒ Failed to fetch notifications:', error.response?.data || error.message);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getFilteredNotifications = () => {
    // Ensure notifications is always an array
    const notificationsArray = Array.isArray(notifications) ? notifications : [];
    
    switch (activeTab) {
      case 'unread':
        return notificationsArray.filter(n => !n.isRead);
      case 'appointments':
        return notificationsArray.filter(n => n.type?.includes('appointment'));
      case 'payments':
        return notificationsArray.filter(n => n.type?.includes('payment'));
      default:
        return notificationsArray;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_confirmed': return 'âœ…';
      case 'appointment_reminder': return 'ðŸ””';
      case 'consultation_completed': return 'ðŸ“‹';
      case 'payment_successful': return 'ðŸ’³';
      case 'consultation_ready': return 'ðŸ‘¨â€âš•ï¸';
      case 'report_generated': return 'ðŸ“„';
      default: return 'ðŸ“¬';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-blue-100">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              âœ•
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 px-6">
            {[
              { id: 'all', label: 'All', count: Array.isArray(notifications) ? notifications.length : 0 },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'appointments', label: 'Appointments', count: Array.isArray(notifications) ? notifications.filter(n => n.type?.includes('appointment')).length : 0 },
              { id: 'payments', label: 'Payments', count: Array.isArray(notifications) ? notifications.filter(n => n.type?.includes('payment')).length : 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">ðŸ“­</div>
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      âœ•
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-500">
            ðŸ’¡ Enable push notifications to stay updated on your appointments and reports
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
