import React, { createContext, useContext, useMemo, useState } from 'react';
import { fakeSignIn } from '../services/authService';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (login: string, password: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signIn(login: string, password: string) {
    setIsLoading(true);

    try {
      const response = await fakeSignIn(login, password);

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || 'Não foi possível entrar.',
      };
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}