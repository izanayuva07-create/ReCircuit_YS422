import { createContext, useContext } from 'react';
import type {
  Bid,
  Booking,
  DigitalLot,
  InventoryItem,
  ItemCondition,
  ListingStatus,
  LotStatus,
  Notification,
  PickupStatus,
  Transaction,
  WasteCategory,
  WasteListing,
} from '../types';

export interface CreateListingInput {
  sourceId?: string;
  category: WasteCategory;
  itemName: string;
  quantity: number;
  weightKg: number;
  condition: ItemCondition;
  expectedPrice: number;
  description?: string;
  pickupAddress: string;
  images: string[];
  status?: ListingStatus;
  aiAnalysis?: WasteListing['aiAnalysis'];
}

export interface PlaceBidInput {
  offeredPrice: number;
  notes?: string;
  distanceKm?: number;
  estimatedArrivalMins?: number;
}

export interface AddInventoryItemInput {
  collectorId?: string;
  category: WasteCategory;
  itemName: string;
  quantity: number;
  weightKg: number;
  estimatedValue: number;
  condition: ItemCondition;
  collectedFrom?: string;
  collectedAt?: string;
  images?: string[];
  lotId?: string;
}

export interface CreateDigitalLotInput {
  lotName: string;
  itemIds: string[];
  storageLocation?: string;
  notes?: string;
}

export type CreateLotInput = CreateDigitalLotInput;

export interface LotStatusDetails {
  rejectionReason?: string;
  recyclerId?: string;
  recyclerName?: string;
}

export interface PlatformContextValue {
  listings: WasteListing[];
  bids: Bid[];
  bookings: Booking[];
  inventory: InventoryItem[];
  lots: DigitalLot[];
  notifications: Notification[];
  transactions: Transaction[];
  unreadNotificationCount: number;
  createListing: (input: CreateListingInput) => WasteListing;
  updateListing: (id: string, updates: Partial<WasteListing>) => WasteListing;
  deleteListing: (id: string) => void;
  placeBid: (listingId: string, input: PlaceBidInput) => Bid;
  withdrawBid: (id: string) => Bid;
  acceptBid: (id: string, scheduledAt?: string) => { bid: Bid; booking: Booking };
  updateBookingStatus: (id: string, status: PickupStatus) => Booking;
  verifyBookingOtp: (id: string, otp: string) => boolean;
  addInventoryItem: (input: AddInventoryItemInput) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => InventoryItem;
  removeInventoryItem: (id: string) => void;
  createLot: (input: CreateLotInput) => DigitalLot;
  createDigitalLot: (input: CreateDigitalLotInput) => DigitalLot;
  sendLotToRecycler: (id: string, recyclerName?: string) => DigitalLot;
  updateLotStatus: (id: string, status: LotStatus, details?: LotStatusDetails) => DigitalLot;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  resetPlatformData: () => void;
  getListing: (id: string) => WasteListing | undefined;
  getBidsForListing: (id: string) => Bid[];
  getBooking: (id: string) => Booking | undefined;
  getLot: (id: string) => DigitalLot | undefined;
}

export const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export const usePlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within PlatformProvider');
  return context;
};
