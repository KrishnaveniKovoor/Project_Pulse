import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getPriorityColor = (priority) => {
  const map = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return map[priority] || 'bg-gray-100 text-gray-600';
};

export const getPriorityDot = (priority) => {
  const map = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  return map[priority] || 'bg-gray-400';
};

export const getStatusColor = (status) => {
  const map = {
    // Task statuses
    todo: 'bg-gray-100 text-gray-600',
    inprogress: 'bg-blue-100 text-blue-700',
    inreview: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700',
    // Project statuses
    planning: 'bg-gray-100 text-gray-600',
    active: 'bg-[#A8D7E8] text-[#2980a0]',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
    // Sprint statuses
    planned: 'bg-gray-100 text-gray-600',
    // Issue statuses
    open: 'bg-red-100 text-red-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500',
    // Milestone statuses
    pending: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusLabel = (status) => {
  const map = {
    todo: 'To Do',
    inprogress: 'In Progress',
    inreview: 'In Review',
    done: 'Done',
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    archived: 'Archived',
    planned: 'Planned',
    open: 'Open',
    resolved: 'Resolved',
    closed: 'Closed',
    pending: 'Pending',
    in_progress: 'In Progress',
    overdue: 'Overdue',
  };
  return map[status] || status;
};

export const getRoleLabel = (role) => {
  const map = {
    org_admin: 'Org Admin',
    project_manager: 'Project Manager',
    team_lead: 'Team Lead',
    developer: 'Developer',
    stakeholder: 'Stakeholder',
  };
  return map[role] || role;
};

export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  return dayjs(date).diff(dayjs(), 'day');
};
