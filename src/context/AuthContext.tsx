import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Role, User } from '../types';
import { login as apiLogin, registerUser, findUserByEmail, updateUser } from '../api/users';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: Role;
    company?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshUser: (patch?: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'job-portal-session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    if (!u) return { ok: false, error: 'Invalid email or password.' };
    persist(u);
    return { ok: true };
  };

  const register: AuthContextValue['register'] = async (payload) => {
    const existing = await findUserByEmail(payload.email);
    if (existing) return { ok: false, error: 'An account with this email already exists.' };
    const newUser = await registerUser({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      company: payload.company,
      skills: [],
    });
    persist(newUser);
    return { ok: true };
  };

  const logout = () => persist(null);

  const refreshUser = async (patch?: Partial<User>) => {
    if (!user) return;
    if (patch) {
      const updated = await updateUser(user.id, patch);
      persist(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
