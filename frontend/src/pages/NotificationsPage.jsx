import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notificationService';
import NotificationItem from '../components/notifications/NotificationItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/helpers';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const { fetchUnreadCount } = useNotifications() || { fetchUnreadCount: () => {} };

  const loadNotifications = async (pageNumber = 1, append = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ page: pageNumber, limit: 20 });
      const newNotifications = Array.isArray(response) ? response : (response.data || []);
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      setHasMore(response.pagination?.hasMore || false);
      setPage(pageNumber);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => 
        (notif._id || notif.id) === id ? { ...notif, read: true } : notif
      ));
      fetchUnreadCount();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => (notif._id || notif.id) !== id));
      fetchUnreadCount();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="text-[#3399B7]" size={28} />
            Notifications
          </h1>
          <p className="text-muted mt-1">Stay updated on your projects and tasks</p>
        </div>
        <div className="flex gap-2">
          {filteredNotifications.some(n => !n.read) && (
            <Button variant="outline" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
              <CheckCheck size={16} />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button 
            className={`tab-btn px-6 py-3 font-medium text-sm focus:outline-none ${filter === 'all' ? 'active text-[#3399B7] border-b-2 border-[#3399B7]' : 'text-muted hover:text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`tab-btn px-6 py-3 font-medium text-sm focus:outline-none flex items-center gap-2 ${filter === 'unread' ? 'active text-[#3399B7] border-b-2 border-[#3399B7]' : 'text-muted hover:text-gray-700'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-[#3399B7] text-white text-xs px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        <div className="p-0 flex flex-col">
          {loading && page === 1 ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Bell}
                title={filter === 'unread' ? "No unread notifications" : "No notifications"}
                message="You're all caught up!"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification._id || notification.id} 
                  notification={notification} 
                  onMarkRead={() => handleMarkAsRead(notification._id || notification.id)}
                  onDelete={() => handleDelete(notification._id || notification.id)}
                />
              ))}
            </div>
          )}
          
          {hasMore && !loading && (
            <div className="p-4 flex justify-center border-t border-gray-100">
              <Button variant="ghost" onClick={() => loadNotifications(page + 1, true)}>
                Load More
              </Button>
            </div>
          )}
          {loading && page > 1 && (
            <div className="p-4 flex justify-center border-t border-gray-100">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
