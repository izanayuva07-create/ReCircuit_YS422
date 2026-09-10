export enum Actor {
  SOURCE = 'source',
  COLLECTOR = 'collector',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  AUDITOR = 'auditor',
}

export enum ListingStatus {
  CREATING = 'CREATING',
  AI_CLASSIFYING = 'AI_CLASSIFYING',
  CONFIRMING = 'CONFIRMING',
  ACTIVE = 'ACTIVE',
  MATCHED = 'MATCHED',
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum InventoryStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  BIDDING = 'BIDDING',
  NEGOTIATING = 'NEGOTIATING',
  ACCEPTED = 'ACCEPTED',
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  PAID_OUT = 'PAID_OUT',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTERED = 'COUNTERED',
  EXPIRED = 'EXPIRED',
}

export enum BookingStatus {
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  VERIFIED = 'VERIFIED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export enum FulfillmentType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum DisputeReason {
  ITEM_MISMATCH = 'ITEM_MISMATCH',
  NO_SHOW = 'NO_SHOW',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  DAMAGE = 'DAMAGE',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED_COLLECTOR = 'RESOLVED_COLLECTOR',
  RESOLVED_SOURCE = 'RESOLVED_SOURCE',
  RESOLVED_SPLIT = 'RESOLVED_SPLIT',
  ESCALATED = 'ESCALATED',
}

export enum TransactionType {
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  PLATFORM_FEE = 'PLATFORM_FEE',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYOUT = 'PAYOUT',
  ADJUSTMENT = 'ADJUSTMENT',
  DEPOSIT = 'DEPOSIT',
}

export enum PayoutMethodType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  UPI = 'UPI',
  CARD = 'CARD',
  WALLET = 'WALLET',
}

export interface AIPrediction {
  class_id: string;
  confidence: number;
  category_slug: string;
  category_name: string;
  attributes: Record<string, any>;
}

export interface MatchedCollector {
  collectorId: string;
  businessName: string;
  rating: number;
  totalCollections: number;
  distanceKm: number;
  serviceRadiusKm: number;
  priceScore: number;
  availabilityScore: number;
  compositeScore: number;
  etaMinutes: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  kycStatus: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Actor;
  region: string;
  collectorId?: string;
  sourceProfileId?: string;
}
