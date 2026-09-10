import React, { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { SignInInput, SignUpInput } from './AuthContext';
import type { User, UserRole } from '../types';
import { loginUser, logoutUser, signupUser, updateCurrentUser } from '../services/authService';

const TOKEN_KEY = 'rc_token';
const USER_KEY = 'rc_user';
const ROLE_KEY = 'rc_pending_role';
const ACCOUNT_KEY = 'rc_demo_accounts';

interface DemoAccount {
  user: User;
  password: string;
}

const now = new Date().toISOString();
const builtInAccounts: DemoAccount[] = [
  {
    user: { id: 'user-001', name: 'Priya Sharma', email: 'source@recircuit.in', phone: '+91 98765 41001', role: 'source', location: 'Anna Nagar, Chennai', createdAt: now },
    password: 'demo123',
  },
  {
    user: { id: 'col-001', name: 'Rajan Kumar', email: 'collector@recircuit.in', phone: '+91 98765 41002', role: 'collector', location: 'Ambattur, Chennai', createdAt: now },
    password: 'demo123',
  },
  {
    user: { id: 'rec-001', name: 'GreenLoop Recycling', email: 'recycler@recircuit.in', phone: '+91 98765 41003', role: 'recycler', location: 'Sriperumbudur, Chennai', createdAt: now },
    password: 'demo123',
  },
];

const apiEnabled = Boolean(import.meta.env.VITE_API_BASE_URL);

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

const readSession = (): { user: User | null; token: string | null } => ({
  user: safeRead<User | null>(USER_KEY, null),
  token: localStorage.getItem(TOKEN_KEY),
});

const readAccounts = (): DemoAccount[] => {
  const stored = safeRead<DemoAccount[]>(ACCOUNT_KEY, []);
  const storedEmails = new Set(stored.map((account) => account.user.email.toLowerCase()));
  return [...stored, ...builtInAccounts.filter((account) => !storedEmails.has(account.user.email.toLowerCase()))];
};

const persistCustomAccounts = (accounts: DemoAccount[]) => {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => readSession(), []);
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return stored === 'source' || stored === 'collector' || stored === 'recycler' ? stored : null;
  });

  const login = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    setError(null);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(ROLE_KEY, nextUser.role);
    setPendingRoleState(nextUser.role);
  }, []);

  const signIn = useCallback(async (input: SignInInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      if (apiEnabled) {
        const response = await loginUser({ email: input.email.trim().toLowerCase(), password: input.password });
        if (!response.success || !response.data?.user || !response.data?.token) throw new Error(response.error || response.message || 'Sign in failed.');
        login(response.data.user, response.data.token);
        return response.data.user;
      }

      const email = input.email.trim().toLowerCase();
      const account = readAccounts().find((candidate) => candidate.user.email.toLowerCase() === email);
      if (!account || account.password !== input.password) throw new Error('Incorrect email or password. Try a demo account shown below.');
      login(account.user, `demo-token-${account.user.id}`);
      return account.user;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to sign in.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (input: SignUpInput): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const role = input.role ?? pendingRole;
      if (!role) throw new Error('Choose how you will use Re-Circuit before creating an account.');
      const email = input.email.trim().toLowerCase();

      if (apiEnabled) {
        const response = await signupUser({ name: input.name.trim(), email, phone: input.phone.trim(), password: input.password, role });
        if (!response.success || !response.data?.user || !response.data?.token) throw new Error(response.error || response.message || 'Account creation failed.');
        login(response.data.user, response.data.token);
        return response.data.user;
      }

      const accounts = readAccounts();
      if (accounts.some((account) => account.user.email.toLowerCase() === email)) throw new Error('An account with this email already exists.');
      const nextUser: User = {
        id: `${role}-${Date.now().toString(36)}`,
        name: input.name.trim(),
        email,
        phone: input.phone.trim(),
        role,
        createdAt: new Date().toISOString(),
      };
      persistCustomAccounts([...accounts, { user: nextUser, password: input.password }]);
      login(nextUser, `demo-token-${nextUser.id}`);
      return nextUser;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to create your account.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [login, pendingRole]);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'location' | 'avatar'>>): Promise<User> => {
    if (!user) throw new Error('Sign in again to update your profile.');
    setIsLoading(true);
    setError(null);
    try {
      let updated: User;
      if (apiEnabled) {
        const response = await updateCurrentUser(updates);
        if (!response.success || !response.data) throw new Error(response.error || response.message || 'Profile update failed.');
        updated = response.data;
      } else {
        updated = { ...user, ...updates };
        const accounts = readAccounts().map((account) => account.user.id === user.id ? { ...account, user: updated } : account);
        persistCustomAccounts(accounts);
      }
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to update your profile.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
    if (apiEnabled && token) {
      try { await logoutUser(); } catch { /* Local session must still be cleared. */ }
    }
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  const setPendingRole = useCallback((role: UserRole | null) => {
    setPendingRoleState(role);
    if (role) localStorage.setItem(ROLE_KEY, role);
    else localStorage.removeItem(ROLE_KEY);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setPendingRole(role);
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }, [setPendingRole, user]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    authMode: apiEnabled ? 'api' as const : 'demo' as const,
    error,
    pendingRole,
    login,
    signIn,
    signUp,
    updateProfile,
    logout,
    setRole,
    setPendingRole,
    clearError: () => setError(null),
  }), [error, isLoading, login, logout, pendingRole, setPendingRole, setRole, signIn, signUp, token, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
