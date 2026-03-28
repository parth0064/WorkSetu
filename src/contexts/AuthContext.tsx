import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'user' | 'constructor';
  skills?: string[];
  completedJobs?: number;
  averageRating?: number;
  badges?: string[];
  phone?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const googleLogin = async (credential: string) => {
    const res = await api.post('/auth/google', { credential });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    const { token, user: registeredUser } = res.data;
    localStorage.setItem('token', token);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
