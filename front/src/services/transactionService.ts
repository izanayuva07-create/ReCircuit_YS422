import api from './api';
import type { APIResponse, PaginatedResponse, Transaction } from '../types';

// TODO: Connect to GET /transactions/my
export const getMyTransactions = async (params?: Record<string, unknown>): Promise<APIResponse<PaginatedResponse<Transaction>>> => {
  const response = await api.get<APIResponse<PaginatedResponse<Transaction>>>('/transactions/my', { params });
  return response.data;
};

// TODO: Connect to GET /transactions/summary
export const getTransactionSummary = async (): Promise<APIResponse<{ totalEarned: number; totalWeight: number }>> => {
  const response = await api.get<APIResponse<{ totalEarned: number; totalWeight: number }>>('/transactions/summary');
  return response.data;
};
