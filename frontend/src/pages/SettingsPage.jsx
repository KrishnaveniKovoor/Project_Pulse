import { useState } from 'react';
import { Settings, Bell, Palette, Shield, Globe, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-[#3399B7]' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-[#485257]">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    emailOnAssign: true,
    emailOnComment: true,
    emailOnMention: true,
    emailOnDue: false,
    pushNotifications: true,
    weeklyDigest: false,
    compactView: false,
    showCompletedTasks: true,
    defaultView: 'list',
    timezone: 'UTC',
    dateFormat: 'MMM D, YYYY',
  });

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));
  const set = (key) => (e) => setSettings(p => ({ ...p, [key]: e.target.value }));

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  const tabs = [
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'preferences', label: 'Preferences', icon: Globe },
    { key: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings size={24} className="text-[#3399B7]" /> Settings
        </h1>
        <p className="text-muted mt-1">Customize your ProjectPulse experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`tab-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 ${activeTab === key ? 'active' : ''}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <div className="card p-6">
          <h2 className="section-title mb-1">Notification Preferences</h2>
          <p className="text-muted mb-5">Choose when and how you receive notifications</p>

          <div className="mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Notifications</h3>
            <SettingRow
              label="Task Assignment"
              description="Get notified when a task is assigned to you"
            >
              <ToggleSwitch checked={settings.emailOnAssign} onChange={() => toggle('emailOnAssign')} />
            </SettingRow>
            <SettingRow
              label="New Comments"
              description="Receive emails when someone comments on your tasks"
            >
              <ToggleSwitch checked={settings.emailOnComment} onChange={() => toggle('emailOnComment')} />
            </SettingRow>
            <SettingRow
              label="Mentions"
              description="Get notified when someone mentions you"
            >
              <ToggleSwitch checked={settings.emailOnMention} onChange={() => toggle('emailOnMention')} />
            </SettingRow>
            <SettingRow
              label="Due Date Reminders"
              description="Receive reminders before task due dates"
            >
              <ToggleSwitch checked={settings.emailOnDue} onChange={() => toggle('emailOnDue')} />
            </SettingRow>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">In-App Notifications</h3>
            <SettingRow
              label="Push Notifications"
              description="Enable real-time notifications in the app"
            >
              <ToggleSwitch checked={settings.pushNotifications} onChange={() => toggle('pushNotifications')} />
            </SettingRow>
            <SettingRow
              label="Weekly Digest"
              description="Receive a weekly summary of your projects"
            >
              <ToggleSwitch checked={settings.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
            </SettingRow>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="card p-6">
          <h2 className="section-title mb-1">Appearance</h2>
          <p className="text-muted mb-5">Customize how the app looks</p>

          <SettingRow label="Compact View" description="Show more items with less spacing">
            <ToggleSwitch checked={settings.compactView} onChange={() => toggle('compactView')} />
          </SettingRow>
          <SettingRow label="Show Completed Tasks" description="Display done tasks in task lists">
            <ToggleSwitch checked={settings.showCompletedTasks} onChange={() => toggle('showCompletedTasks')} />
          </SettingRow>
          <SettingRow label="Default Task View">
            <select
              className="form-input w-32 text-sm"
              value={settings.defaultView}
              onChange={set('defaultView')}
            >
              <option value="list">List</option>
              <option value="board">Kanban</option>
            </select>
          </SettingRow>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="card p-6">
          <h2 className="section-title mb-1">Regional Preferences</h2>
          <p className="text-muted mb-5">Set your locale and time settings</p>

          <SettingRow label="Timezone">
            <select className="form-input w-40 text-sm" value={settings.timezone} onChange={set('timezone')}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </SettingRow>
          <SettingRow label="Date Format">
            <select className="form-input w-40 text-sm" value={settings.dateFormat} onChange={set('dateFormat')}>
              <option value="MMM D, YYYY">Jan 1, 2024</option>
              <option value="DD/MM/YYYY">01/01/2024</option>
              <option value="MM/DD/YYYY">01/01/2024</option>
              <option value="YYYY-MM-DD">2024-01-01</option>
            </select>
          </SettingRow>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="section-title mb-1">Account Privacy</h2>
            <p className="text-muted mb-5">Manage what others can see about you</p>
            <SettingRow label="Profile Visibility" description="Allow team members to view your profile">
              <ToggleSwitch checked={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Activity Status" description="Show when you're active in the app">
              <ToggleSwitch checked={true} onChange={() => {}} />
            </SettingRow>
          </div>

          <div className="card p-6 border-red-100">
            <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
            <p className="text-muted mb-4">These actions are irreversible. Please be certain.</p>
            <button
              onClick={() => toast.error('Contact your administrator to delete your account')}
              className="btn-danger text-sm"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Check size={15} /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
