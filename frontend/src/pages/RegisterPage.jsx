import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to ProjectPulse.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#485257]">Create your account</h2>
        <p className="text-sm text-gray-400 mt-1">Join ProjectPulse and start collaborating</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={set('name')} required />
        <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
        <Button type="submit" fullWidth loading={loading} size="lg">Create Account</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#3399B7] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
