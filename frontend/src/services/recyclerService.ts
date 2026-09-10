import api from './api';
import type { APIResponse, RecyclerProfile, DigitalLot, PaginatedResponse } from '../types';

// TODO: Connect to GET /recycler/profile
export const getRecyclerProfile = async (): Promise<APIResponse<RecyclerProfile>> => {
  const response = await api.get<APIResponse<RecyclerProfile>>('/recycler/profile');
  return response.data;
};

// TODO: Connect to GET /recycler/lots/incoming
export const getIncomingLots = async (): Promise<APIResponse<PaginatedResponse<DigitalLot>>> => {
  const response = await api.get<APIResponse<PaginatedResponse<DigitalLot>>>('/recycler/lots/incoming');
  return response.data;
};

// TODO: Connect to GET /recycler/lots/:id
export const getLotById = async (id: string): Promise<APIResponse<DigitalLot>> => {
  const response = await api.get<APIResponse<DigitalLot>>(`/recycler/lots/${id}`);
  return response.data;
};

// TODO: Connect to PUT /recycler/lots/:id/accept
export const acceptLot = async (id: string): Promise<APIResponse<DigitalLot>> => {
  const response = await api.put<APIResponse<DigitalLot>>(`/recycler/lots/${id}/accept`);
  return response.data;
};

// TODO: Connect to PUT /recycler/lots/:id/reject
export const rejectLot = async (id: string, reason?: string): Promise<APIResponse<DigitalLot>> => {
  const response = await api.put<APIResponse<DigitalLot>>(`/recycler/lots/${id}/reject`, { reason });
  return response.data;
};

// TODO: Connect to PUT /recycler/lots/:id/received
export const markLotReceived = async (id: string): Promise<APIResponse<DigitalLot>> => {
  const response = await api.put<APIResponse<DigitalLot>>(`/recycler/lots/${id}/received`);
  return response.data;
};

// TODO: Connect to PUT /recycler/lots/:id/processed
export const markLotProcessed = async (id: string): Promise<APIResponse<DigitalLot>> => {
  const response = await api.put<APIResponse<DigitalLot>>(`/recycler/lots/${id}/processed`);
  return response.data;
};
