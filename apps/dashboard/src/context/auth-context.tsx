'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'ADMIN' | 'VENDOR' | 'PROVIDER' | 'DRIVER';

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  roles: Role[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: Role | null;
  isLoading: boolean;
  login: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setActiveRole: (role: Role) => void;
  hasRole: (role: Role) => boolean;
  hasMultipleRoles: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('dashboard_token');
    const savedUser = localStorage.getItem('dashboard_user');
    const savedRole = localStorage.getItem('dashboard_active_role');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (savedRole) {
        setActiveRoleState(savedRole as Role);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to send OTP' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Invalid OTP' };
      }

      // Save auth state
      const newToken = data.token || data.accessToken;
      const userData: User = {
        id: data.user?.id || data.userId,
        phone: phone,
        name: data.user?.name,
        email: data.user?.email,
        roles: data.user?.roles || ['VENDOR'], // Default to VENDOR if no roles
      };

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('dashboard_token', newToken);
      localStorage.setItem('dashboard_user', JSON.stringify(userData));

      // Auto-select role if only one
      if (userData.roles.length === 1) {
        setActiveRoleState(userData.roles[0]);
        localStorage.setItem('dashboard_active_role', userData.roles[0]);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveRoleState(null);
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('dashboard_user');
    localStorage.removeItem('dashboard_active_role');
  };

  const setActiveRole = (role: Role) => {
    if (user?.roles.includes(role)) {
      setActiveRoleState(role);
      localStorage.setItem('dashboard_active_role', role);
    }
  };

  const hasRole = (role: Role): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasMultipleRoles = (): boolean => {
    return (user?.roles.length || 0) > 1;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isLoading,
        login,
        verifyOtp,
        logout,
        setActiveRole,
        hasRole,
        hasMultipleRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
