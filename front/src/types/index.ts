// ============================================================
// Re-Circuit — Core TypeScript Interfaces
// ============================================================

// ---- User & Auth ----

export type UserRole = 'source' | 'collector' | 'recycler';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ---- E-Waste & Listings ----

export type WasteCategory =
  | 'mobile'
  | 'laptop'
  | 'desktop'
  | 'tablet'
  | 'battery'
  | 'pcb'
  | 'cable'
  | 'appliance'
  | 'tv_monitor'
  | 'printer'
  | 'other';

export type ItemCondition = 'working' | 'partially_working' | 'not_working' | 'damaged';

export type ListingStatus =
  | 'draft'
  | 'active'
  | 'bidding'
  | 'accepted'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export interface WasteListing {
  id: string;
  sourceId: string;
  category: WasteCategory;
  itemName: string;
  quantity: number;
  weightKg: number;
  condition: ItemCondition;
  expectedPrice: number;
  description?: string;
  pickupAddress: string;
  images: string[];
  status: ListingStatus;
  aiAnalysis?: AIAnalysisResult;
  createdAt: string;
  updatedAt: string;
}

export interface YOLOv8Detection {
  id: string;
  label: string;
  classId: string;
  confidence: number;
  box: [number, number, number, number];
  material: string;
  salvageAction: string;
}

export interface DINOv2Analysis {
  model: string;
  backbone: string;
  embeddingDim: number;
  featureSample: number[];
  materialDecomposition: {
    goldYieldGramsPerTon: number;
    silverYieldGramsPerTon: number;
    copperPurityPercent: number;
    lithiumBatteryWeightKg: number;
    rareEarthMinerals: string[];
  };
  salvageTier: string;
  recyclabilityIndex: number;
  compliance: string;
}

export interface AIAnalysisResult {
  detectedCategory: WasteCategory;
  detectedItems: string[];
  condition: ItemCondition;
  materialTypes: string[];
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  confidenceScore: number;
  safetyWarnings: string[];
  isLoading: boolean;
  error?: string;
  aiEngines?: {
    yolov8?: {
      model: string;
      detectedCount: number;
      components: YOLOv8Detection[];
    };
    dinov2?: DINOv2Analysis;
  };
}

// ---- Bids ----

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Bid {
  id: string;
  listingId: string;
  collectorId: string;
  collectorName: string;
  collectorRating: number;
  collectorCompletedPickups: number;
  offeredPrice: number;
  distanceKm: number;
  estimatedArrivalMins: number;
  notes?: string;
  status: BidStatus;
  createdAt: string;
}

// ---- Bookings & Pickup ----

export type PickupStatus =
  | 'confirmed'
  | 'collector_assigned'
  | 'on_the_way'
  | 'arrived'
  | 'otp_verification'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  listingId: string;
  bidId: string;
  sourceId: string;
  collectorId: string;
  collectorName: string;
  pickupAddress: string;
  scheduledAt: string;
  status: PickupStatus;
  otp?: string;
  otpVerified: boolean;
  createdAt: string;
}

// ---- Collector ----

export interface CollectorProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  rating: number;
  totalPickups: number;
  totalWeightKg: number;
  totalEarnings: number;
  serviceArea: string;
  isVerified: boolean;
}

export interface CollectorJob {
  id: string;
  listing: WasteListing;
  sourceName: string;
  sourceArea: string;
  distanceKm: number;
  postedAt: string;
}

// ---- Inventory ----

export interface InventoryItem {
  id: string;
  collectorId: string;
  category: WasteCategory;
  itemName: string;
  quantity: number;
  weightKg: number;
  estimatedValue: number;
  condition: ItemCondition;
  collectedFrom?: string;
  collectedAt: string;
  images: string[];
  lotId?: string;
}

// ---- Digital Lot ----

export type LotStatus = 'draft' | 'ready' | 'sent_to_recycler' | 'accepted' | 'rejected' | 'received' | 'processed';

export interface DigitalLot {
  id: string;
  collectorId: string;
  lotName: string;
  items: InventoryItem[];
  totalQuantity: number;
  totalWeightKg: number;
  estimatedValue: number;
  storageLocation?: string;
  notes?: string;
  status: LotStatus;
  recyclerId?: string;
  recyclerName?: string;
  rejectionReason?: string;
  acceptedAt?: string;
  receivedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Recycler ----

export interface RecyclerProfile {
  id: string;
  userId: string;
  facilityName: string;
  certifications: string[];
  acceptedCategories: WasteCategory[];
  location: string;
  rating: number;
  totalProcessedKg: number;
  isVerified: boolean;
}

// ---- Traceability ----

export type TraceStage =
  | 'source_listed'
  | 'bid_accepted'
  | 'pickup_scheduled'
  | 'collector_arrived'
  | 'otp_verified'
  | 'pickup_verified'
  | 'added_to_inventory'
  | 'lot_created'
  | 'recycler_accepted'
  | 'recycler_received'
  | 'recycling_completed';

export type TraceStatus = 'completed' | 'current' | 'upcoming';

export interface TraceEvent {
  stage: TraceStage;
  label: string;
  description?: string;
  timestamp?: string;
  status: TraceStatus;
}

// ---- Awareness ----

export interface AwarenessCard {
  id: string;
  category: string;
  title: string;
  body: string;
  icon: string;
  color?: string;
}

// ---- Safety ----

export interface SafetyCard {
  id: string;
  category: string;
  title: string;
  body: string;
  tips: string[];
  icon: string;
  audioUrl?: string;
}

// ---- Notifications ----

export interface Notification {
  id: string;
  type: 'bid' | 'booking' | 'pickup' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
  userId?: string;
  role?: UserRole;
}

// ---- Transactions ----

export interface Transaction {
  id: string;
  userId: string;
  role: UserRole;
  type: 'earning' | 'payment';
  amount: number;
  description: string;
  relatedId: string;
  createdAt: string;
}

// ---- Stats ----

export interface StatCard {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
}

// ---- API ----

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
