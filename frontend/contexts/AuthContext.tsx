'use client';

import { apiGet, apiPost } from '@/lib/api';
import type {
  AuthResponse,
  PasswordResetRequestInput,
  PasswordUpdateInput,
  SignInInput,
  SignUpInput,
  User,
} from '@/lib/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpInput) => Promise<AuthResponse>;
  signIn: (data: SignInInput) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (data: PasswordResetRequestInput) => Promise<void>;
  updatePassword: (data: PasswordUpdateInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    try {
      const userData = await apiGet<User>('/auth/me');
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signUp = useCallback(
    async (data: SignUpInput): Promise<AuthResponse> => {
      const response = await apiPost<AuthResponse>('/auth/signup', data);
      setUser(response.data.user);
      return response;
    },
    []
  );

  const signIn = useCallback(
    async (data: SignInInput): Promise<AuthResponse> => {
      const response = await apiPost<AuthResponse>('/auth/signin', data);
      setUser(response.data.user);
      return response;
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await apiPost('/auth/signout');
    } catch {
      // Ignore errors - always clear user state
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await apiGet<User>('/auth/me');
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (data: PasswordResetRequestInput): Promise<void> => {
      await apiPost('/auth/password/reset-request', data);
    },
    []
  );

  const updatePassword = useCallback(
    async (data: PasswordUpdateInput): Promise<void> => {
      await apiPost('/auth/password/update', data);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
        requestPasswordReset,
        updatePassword,
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
