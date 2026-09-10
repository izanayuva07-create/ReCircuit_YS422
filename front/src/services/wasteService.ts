import api from './api';
import type { APIResponse, WasteListing, AIAnalysisResult, PaginatedResponse } from '../types';

// TODO: Connect to POST /waste/analyze — upload images for AI analysis
export const analyzeWaste = async (formData: FormData): Promise<APIResponse<AIAnalysisResult>> => {
  const response = await api.post<APIResponse<AIAnalysisResult>>('/waste/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// TODO: Connect to GET /waste/categories
export const getWasteCategories = async (): Promise<APIResponse<string[]>> => {
  const response = await api.get<APIResponse<string[]>>('/waste/categories');
  return response.data;
};

// TODO: Connect to GET /waste/listings (public feed for collectors)
export const getPublicListings = async (params?: Record<string, unknown>): Promise<APIResponse<PaginatedResponse<WasteListing>>> => {
  const response = await api.get<APIResponse<PaginatedResponse<WasteListing>>>('/waste/listings', { params });
  return response.data;
};
