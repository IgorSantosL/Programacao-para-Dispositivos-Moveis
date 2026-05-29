import React, { createContext, useContext, useMemo, useState } from 'react';
import { signInRequest } from '../services/authService';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signIn(login: string, password: string) {
    setIsLoading(true);

    try {
      const response = await signInRequest(login, password);

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
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
    setToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      signIn,
      signOut,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
