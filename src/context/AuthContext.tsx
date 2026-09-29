/**
 * src/context/AuthContext.tsx — Authentication and User Session Context.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../lib/api';
import type { User, NgoProfile, VolunteerProfile } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  profile: NgoProfile | VolunteerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; role: 'volunteer' | 'ngo' | 'admin'; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingDone: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NgoProfile | VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.auth.me();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        const data = await api.auth.me();
        setUser(data.user);
        setProfile(data.profile);
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      setUser(data.user);
      setProfile(data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; role: 'volunteer' | 'ngo' | 'admin'; name?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Immediately clear state for instant UI update
    setUser(null);
    setProfile(null);
    try {
      await api.auth.logout();
    } catch {
      // Ignore errors — state is already cleared
    }
  };

  const setOnboardingDone = () => {
    if (user) {
      setUser({ ...user, onboardingComplete: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
        setOnboardingDone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
