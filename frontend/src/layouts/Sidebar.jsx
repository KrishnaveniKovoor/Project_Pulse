import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Zap,
  AlertCircle, Users, BarChart2, PieChart,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/common/Avatar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/sprints', icon: Zap, label: 'Sprints' },
  { to: '/issues', icon: AlertCircle, label: 'Issues' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/workload', icon: BarChart2, label: 'Workload' },
  { to: '/reports', icon: PieChart, label: 'Reports' },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300
          bg-[#485257] shadow-xl
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#3399B7] rounded-lg flex items-center justify-center flex-shrink-0">
                <Target size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">ProjectPulse</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 bg-[#3399B7] rounded-lg flex items-center justify-center mx-auto">
              <Target size={16} className="text-white" />
            </div>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-auto flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-2 space-y-0.5 flex-shrink-0">
          <NavLink
            to="/notifications"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <div className="relative flex-shrink-0">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && <span>Notifications</span>}
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <Avatar name={user?.name} size="xs" className="flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white/90 text-xs font-medium truncate">{user?.name}</p>
                <p className="text-white/50 text-[10px] truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-left ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0 text-red-400" />
            {!collapsed && <span className="text-red-400">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
