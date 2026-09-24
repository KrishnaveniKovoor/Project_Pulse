import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, loading, fetchNotifications, markRead, markAllRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (isOpen) fetchNotifications({ limit: 8 });
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-in overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-[#3399B7]" />
          <span className="text-sm font-semibold text-[#485257]">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-[#3399B7] hover:underline flex items-center gap-1"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => { markRead(n._id); onClose(); }}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-[#F0FAFD]' : ''}`}
            >
              <div className="flex items-start gap-2">
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#3399B7] flex-shrink-0 mt-1.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#485257] truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100">
        <button
          onClick={() => { navigate('/notifications'); onClose(); }}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-[#3399B7] hover:underline font-medium"
        >
          <ExternalLink size={13} />
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
