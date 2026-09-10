import { createContext, useContext } from 'react';
import type { User, UserRole } from '../types';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  name: string;
  phone: string;
  role?: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: 'api' | 'demo';
  error: string | null;
  pendingRole: UserRole | null;
  login: (user: User, token: string) => void;
  signIn: (input: SignInInput) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'location' | 'avatar'>>) => Promise<User>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setPendingRole: (role: UserRole | null) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
