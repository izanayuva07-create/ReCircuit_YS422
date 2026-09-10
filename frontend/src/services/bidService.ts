import api from './api';
import type { APIResponse, Bid } from '../types';

// TODO: Connect to GET /bids/listing/:listingId
export const getBidsForListing = async (listingId: string): Promise<APIResponse<Bid[]>> => {
  const response = await api.get<APIResponse<Bid[]>>(`/bids/listing/${listingId}`);
  return response.data;
};

// TODO: Connect to POST /bids
export const placeBid = async (data: { listingId: string; offeredPrice: number; notes?: string }): Promise<APIResponse<Bid>> => {
  const response = await api.post<APIResponse<Bid>>('/bids', data);
  return response.data;
};

// TODO: Connect to PUT /bids/:id/accept
export const acceptBid = async (bidId: string): Promise<APIResponse<Bid>> => {
  const response = await api.put<APIResponse<Bid>>(`/bids/${bidId}/accept`);
  return response.data;
};

// TODO: Connect to PUT /bids/:id/reject
export const rejectBid = async (bidId: string): Promise<APIResponse<Bid>> => {
  const response = await api.put<APIResponse<Bid>>(`/bids/${bidId}/reject`);
  return response.data;
};

// TODO: Connect to GET /bids/my (collector's own bids)
export const getMyBids = async (): Promise<APIResponse<Bid[]>> => {
  const response = await api.get<APIResponse<Bid[]>>('/bids/my');
  return response.data;
};
