import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { User, Mail, Shield, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'developer', label: 'Developer / Member' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'stakeholder', label: 'Stakeholder' },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', role: '', bio: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'developer',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const setPw = (field) => (e) => setPasswords(p => ({ ...p, [field]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const res = await userService.updateProfile({ name: form.name, bio: form.bio, role: form.role });
      updateUser(res.data.data || form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) return toast.error('Fill all password fields');
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPass.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await userService.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile Info' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <User size={24} className="text-[#3399B7]" /> My Profile
        </h1>
        <p className="text-muted mt-1">Manage your account information and security settings</p>
      </div>

      {/* Avatar Card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <Avatar name={user?.name} size="xl" />
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#3399B7] rounded-full flex items-center justify-center shadow text-white hover:bg-[#2980a0] transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#485257]">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 badge bg-[#A8D7E8] text-[#2980a0] capitalize">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-btn px-5 py-1.5 rounded-lg ${activeTab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <User size={17} className="text-[#3399B7]" /> Personal Information
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              placeholder="Your full name"
              icon={User}
              required
            />
            <Input
              label="Email Address"
              value={form.email}
              onChange={set('email')}
              type="email"
              icon={Mail}
              disabled
            />
            <div>
              <label className="form-label">Role</label>
              <Select value={form.role} onChange={set('role')} options={roleOptions} />
            </div>
            <div>
              <label className="form-label">Bio</label>
              <textarea
                className="form-input min-h-[80px] resize-none"
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tell your team a bit about yourself…"
                rows={3}
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : <Save size={15} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Shield size={17} className="text-[#3399B7]" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={setPw('current')}
              placeholder="••••••••"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.newPass}
              onChange={setPw('newPass')}
              placeholder="Min. 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={setPw('confirm')}
              placeholder="Repeat new password"
              required
            />
            <div className="pt-2">
              <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
                {pwLoading ? <LoadingSpinner size="sm" /> : <Shield size={15} />}
                Update Password
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Password Requirements</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number or special character</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
