import api from './api';
import type { APIResponse, CollectorProfile, CollectorJob, InventoryItem, DigitalLot, PaginatedResponse } from '../types';

// TODO: Connect to GET /collector/profile
export const getCollectorProfile = async (): Promise<APIResponse<CollectorProfile>> => {
  const response = await api.get<APIResponse<CollectorProfile>>('/collector/profile');
  return response.data;
};

// TODO: Connect to GET /collector/jobs/available
export const getAvailableJobs = async (params?: Record<string, unknown>): Promise<APIResponse<PaginatedResponse<CollectorJob>>> => {
  const response = await api.get<APIResponse<PaginatedResponse<CollectorJob>>>('/collector/jobs/available', { params });
  return response.data;
};

// TODO: Connect to GET /collector/jobs/:id
export const getJobById = async (id: string): Promise<APIResponse<CollectorJob>> => {
  const response = await api.get<APIResponse<CollectorJob>>(`/collector/jobs/${id}`);
  return response.data;
};

// TODO: Connect to GET /collector/inventory
export const getInventory = async (): Promise<APIResponse<InventoryItem[]>> => {
  const response = await api.get<APIResponse<InventoryItem[]>>('/collector/inventory');
  return response.data;
};

// TODO: Connect to POST /collector/inventory
export const addInventoryItem = async (data: Partial<InventoryItem>): Promise<APIResponse<InventoryItem>> => {
  const response = await api.post<APIResponse<InventoryItem>>('/collector/inventory', data);
  return response.data;
};

// TODO: Connect to GET /collector/lots
export const getMyLots = async (): Promise<APIResponse<DigitalLot[]>> => {
  const response = await api.get<APIResponse<DigitalLot[]>>('/collector/lots');
  return response.data;
};

// TODO: Connect to POST /collector/lots
export const createLot = async (data: Partial<DigitalLot>): Promise<APIResponse<DigitalLot>> => {
  const response = await api.post<APIResponse<DigitalLot>>('/collector/lots', data);
  return response.data;
};
