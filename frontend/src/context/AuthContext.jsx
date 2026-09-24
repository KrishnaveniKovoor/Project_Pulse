import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pp_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load current user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pp_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data.data);
      } catch {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('pp_token', newToken);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('pp_token', newToken);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('pp_user', JSON.stringify({ ...user, ...updatedData }));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
