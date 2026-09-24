import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/common/Avatar';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/sprints': 'Sprints',
  '/issues': 'Issues',
  '/teams': 'Teams',
  '/workload': 'Workload',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Navbar = ({ onMenuClick, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'ProjectPulse';

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 z-20 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <h1 className="text-lg font-semibold text-[#485257] hidden sm:block">{pageTitle}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#3399B7] focus:border-transparent transition-all bg-gray-50"
            onFocus={(e) => navigate('/tasks')}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#485257] leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize leading-tight">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-slide-in">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#485257]">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={14} />
              Profile
            </button>
            <button
              onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={14} />
              Settings
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
