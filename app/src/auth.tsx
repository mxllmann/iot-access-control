import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, type User } from './api';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User; token: string };

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const loadToken = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setState({ status: 'unauthenticated' });
        return;
      }
      api.setToken(token);
      const user = await api.auth.me();
      setState({ status: 'authenticated', user, token });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      api.setToken(null);
      setState({ status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    api.setToken(result.token);
    setState({ status: 'authenticated', user: result.user, token: result.token });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    api.setToken(null);
    setState({ status: 'unauthenticated' });
  }, []);

  const refresh = useCallback(async () => {
    if (state.status !== 'authenticated') return;
    try {
      const user = await api.auth.me();
      setState((prev) => (prev.status === 'authenticated' ? { ...prev, user } : prev));
    } catch {}
  }, [state.status]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
