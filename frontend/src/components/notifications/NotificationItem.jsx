import { Bell, CheckSquare, MessageSquare, AlertCircle, Users, Zap, FolderKanban } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

const typeIcons = {
  task_assigned: CheckSquare,
  task_updated: CheckSquare,
  comment_added: MessageSquare,
  issue_assigned: AlertCircle,
  sprint_started: Zap,
  member_added: Users,
  task_overdue: AlertCircle,
  project_update: FolderKanban,
};

const typeColors = {
  task_assigned: 'bg-blue-100 text-blue-600',
  task_updated: 'bg-[#A8D7E8] text-[#2980a0]',
  comment_added: 'bg-green-100 text-green-600',
  issue_assigned: 'bg-red-100 text-red-600',
  sprint_started: 'bg-purple-100 text-purple-600',
  member_added: 'bg-orange-100 text-orange-600',
  task_overdue: 'bg-red-100 text-red-600',
  project_update: 'bg-[#A8D7E8] text-[#2980a0]',
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-500';

  return (
    <div
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-[#F0FAFD]' : 'bg-white'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-[#485257]' : 'font-medium text-gray-700'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-[#3399B7] flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
};

export default NotificationItem;
