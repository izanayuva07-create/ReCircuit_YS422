import api from './api';
import type { APIResponse, User, UserRole } from '../types';

// ============================================================
// Auth Service — Connect backend endpoints here
// ============================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface AuthTokenResponse {
  token: string;
  user: User;
}

// TODO: Connect to POST /auth/login
export const loginUser = async (payload: LoginPayload): Promise<APIResponse<AuthTokenResponse>> => {
  const response = await api.post<APIResponse<AuthTokenResponse>>('/auth/login', payload);
  return response.data;
};

// TODO: Connect to POST /auth/signup
export const signupUser = async (payload: SignupPayload): Promise<APIResponse<AuthTokenResponse>> => {
  const response = await api.post<APIResponse<AuthTokenResponse>>('/auth/signup', payload);
  return response.data;
};

// TODO: Connect to GET /auth/me
export const getMe = async (): Promise<APIResponse<User>> => {
  const response = await api.get<APIResponse<User>>('/auth/me');
  return response.data;
};

export const updateCurrentUser = async (
  updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'location' | 'avatar'>>,
): Promise<APIResponse<User>> => {
  const response = await api.put<APIResponse<User>>('/auth/me', updates);
  return response.data;
};

// TODO: Connect to POST /auth/logout
export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};
