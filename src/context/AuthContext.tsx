import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      firstName: payload['firstName'] ?? '',
      lastName: payload['lastName'] ?? '',
    };
  } catch {
    return null;
  }
}

function loadInitialState(): { user: User | null; token: string | null } {
  const token = localStorage.getItem('token');
  if (!token) return { user: null, token: null };
  const user = parseJwt(token);
  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState();
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  const login = useCallback((newToken: string) => {
    const parsed = parseJwt(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(parsed);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
