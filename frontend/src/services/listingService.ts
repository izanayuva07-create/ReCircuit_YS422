import api from './api';
import type { APIResponse, WasteListing, PaginatedResponse } from '../types';

// TODO: Connect to POST /listings
export const createListing = async (data: Partial<WasteListing>): Promise<APIResponse<WasteListing>> => {
  const response = await api.post<APIResponse<WasteListing>>('/listings', data);
  return response.data;
};

// TODO: Connect to GET /listings/my
export const getMyListings = async (): Promise<APIResponse<PaginatedResponse<WasteListing>>> => {
  const response = await api.get<APIResponse<PaginatedResponse<WasteListing>>>('/listings/my');
  return response.data;
};

// TODO: Connect to GET /listings/:id
export const getListingById = async (id: string): Promise<APIResponse<WasteListing>> => {
  const response = await api.get<APIResponse<WasteListing>>(`/listings/${id}`);
  return response.data;
};

// TODO: Connect to PUT /listings/:id
export const updateListing = async (id: string, data: Partial<WasteListing>): Promise<APIResponse<WasteListing>> => {
  const response = await api.put<APIResponse<WasteListing>>(`/listings/${id}`, data);
  return response.data;
};

// TODO: Connect to DELETE /listings/:id
export const deleteListing = async (id: string): Promise<APIResponse<null>> => {
  const response = await api.delete<APIResponse<null>>(`/listings/${id}`);
  return response.data;
};
