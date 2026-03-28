import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  _id?: string;       // Mongo also sends _id; alias of id
  name: string;
  email: string;
  role: 'worker' | 'user' | 'constructor';
  language?: string;
  skills?: string[];
  completedJobs?: number;
  averageRating?: number;
  // Structured rating from new schema
  rating?: {
    average: number;
    totalReviews: number;
  };
  points?: number;
  hype?: number;
  score?: number;
  rank?: string;
  badges?: string[];
  phone?: string;
  location?: string;
  availability?: boolean;
  profileImage?: string;
  status?: string;
  wallet?: { balance: number; pending: number };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
          const res = await api.get('auth/me');
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
    const res = await api.post('auth/login', credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (userData: any) => {
    const res = await api.post('auth/register', userData);
    const { token, user: registeredUser } = res.data;
    localStorage.setItem('token', token);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
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
