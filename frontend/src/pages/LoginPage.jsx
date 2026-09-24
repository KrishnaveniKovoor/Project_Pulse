import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const fillDemo = (email) => {
    setForm({ email, password: 'password123' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#485257]">Sign in to your account</h2>
        <p className="text-sm text-gray-400 mt-1">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          icon={Mail}
          required
        />
        <div>
          <label className="form-label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              className="form-input pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      {/* Demo Accounts Helper */}
      <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-600">
          <UserCheck size={14} className="text-[#3399B7]" />
          <span>Quick Demo Logins (Password: password123)</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => fillDemo('admin@projectpulse.com')}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg hover:border-[#3399B7] hover:text-[#3399B7] transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('pm@projectpulse.com')}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg hover:border-[#3399B7] hover:text-[#3399B7] transition-colors"
          >
            PM
          </button>
          <button
            type="button"
            onClick={() => fillDemo('dev@projectpulse.com')}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg hover:border-[#3399B7] hover:text-[#3399B7] transition-colors"
          >
            Developer
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#3399B7] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
