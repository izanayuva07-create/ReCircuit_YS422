import api from './api';
import type { APIResponse, Booking } from '../types';

// TODO: Connect to GET /bookings/my
export const getMyBookings = async (): Promise<APIResponse<Booking[]>> => {
  const response = await api.get<APIResponse<Booking[]>>('/bookings/my');
  return response.data;
};

// TODO: Connect to GET /bookings/:id
export const getBookingById = async (id: string): Promise<APIResponse<Booking>> => {
  const response = await api.get<APIResponse<Booking>>(`/bookings/${id}`);
  return response.data;
};

// TODO: Connect to POST /bookings/:id/verify-otp
export const verifyOTP = async (bookingId: string, otp: string): Promise<APIResponse<Booking>> => {
  const response = await api.post<APIResponse<Booking>>(`/bookings/${bookingId}/verify-otp`, { otp });
  return response.data;
};

// TODO: Connect to PUT /bookings/:id/status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<APIResponse<Booking>> => {
  const response = await api.put<APIResponse<Booking>>(`/bookings/${bookingId}/status`, { status });
  return response.data;
};
