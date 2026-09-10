import type { WasteListing, Bid, Booking, CollectorJob, InventoryItem, DigitalLot } from '../types';

// ============================================================
// Re-Circuit — Placeholder Data for Layout/UI Purposes Only
// These are clearly marked placeholder values.
// All real data will come from the backend API.
// ============================================================

// PLACEHOLDER: Source listings
export const PLACEHOLDER_LISTINGS: WasteListing[] = [
  {
    id: 'lst-001',
    sourceId: 'user-001',
    category: 'mobile',
    itemName: 'Old Smartphones (Mixed)',
    quantity: 3,
    weightKg: 0.6,
    condition: 'not_working',
    expectedPrice: 450,
    description: 'Three old smartphones in non-working condition.',
    pickupAddress: 'Placeholder Address, Chennai',
    images: [],
    status: 'bidding',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 'lst-002',
    sourceId: 'user-001',
    category: 'laptop',
    itemName: 'Old Laptop',
    quantity: 1,
    weightKg: 2.1,
    condition: 'partially_working',
    expectedPrice: 1200,
    description: 'Laptop powers on but screen is cracked.',
    pickupAddress: 'Placeholder Address, Chennai',
    images: [],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
];

// PLACEHOLDER: Bids
export const PLACEHOLDER_BIDS: Bid[] = [
  {
    id: 'bid-001',
    listingId: 'lst-001',
    collectorId: 'col-001',
    collectorName: 'Rajan Kumar',
    collectorRating: 4.7,
    collectorCompletedPickups: 230,
    offeredPrice: 420,
    distanceKm: 2.3,
    estimatedArrivalMins: 25,
    notes: 'Can pick up today evening.',
    status: 'pending',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'bid-002',
    listingId: 'lst-001',
    collectorId: 'col-002',
    collectorName: 'Suresh E-Waste Services',
    collectorRating: 4.4,
    collectorCompletedPickups: 115,
    offeredPrice: 440,
    distanceKm: 4.1,
    estimatedArrivalMins: 40,
    notes: 'Can collect tomorrow morning.',
    status: 'pending',
    createdAt: '2024-01-15T11:30:00Z',
  },
];

// PLACEHOLDER: Collector Jobs
export const PLACEHOLDER_COLLECTOR_JOBS: CollectorJob[] = [
  {
    id: 'job-001',
    listing: PLACEHOLDER_LISTINGS[0],
    sourceName: 'Priya S.',
    sourceArea: 'Anna Nagar, Chennai',
    distanceKm: 1.8,
    postedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'job-002',
    listing: PLACEHOLDER_LISTINGS[1],
    sourceName: 'Karthik M.',
    sourceArea: 'T. Nagar, Chennai',
    distanceKm: 3.5,
    postedAt: '2024-01-14T09:00:00Z',
  },
];

// PLACEHOLDER: Inventory Items
export const PLACEHOLDER_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    collectorId: 'col-001',
    category: 'mobile',
    itemName: 'Mixed Smartphones',
    quantity: 5,
    weightKg: 1.0,
    estimatedValue: 750,
    condition: 'not_working',
    collectedFrom: 'Anna Nagar',
    collectedAt: '2024-01-15T14:00:00Z',
    images: [],
  },
  {
    id: 'inv-002',
    collectorId: 'col-001',
    category: 'laptop',
    itemName: 'Old Laptop',
    quantity: 1,
    weightKg: 2.1,
    estimatedValue: 1100,
    condition: 'partially_working',
    collectedFrom: 'T. Nagar',
    collectedAt: '2024-01-14T10:00:00Z',
    images: [],
  },
  {
    id: 'inv-003',
    collectorId: 'col-001',
    category: 'battery',
    itemName: 'Li-Ion Batteries',
    quantity: 8,
    weightKg: 3.2,
    estimatedValue: 320,
    condition: 'not_working',
    collectedFrom: 'Adyar',
    collectedAt: '2024-01-13T16:00:00Z',
    images: [],
  },
];

// PLACEHOLDER: Digital Lot
export const PLACEHOLDER_LOT: DigitalLot = {
  id: 'lot-001',
  collectorId: 'col-001',
  lotName: 'Batch Jan-2024-01',
  items: PLACEHOLDER_INVENTORY,
  totalQuantity: 14,
  totalWeightKg: 6.3,
  estimatedValue: 2170,
  storageLocation: 'Godown A, Ambattur',
  notes: 'Ready for recycler pickup.',
  status: 'ready',
  createdAt: '2024-01-16T09:00:00Z',
  updatedAt: '2024-01-16T09:00:00Z',
};

// PLACEHOLDER: Booking
export const PLACEHOLDER_BOOKING: Booking = {
  id: 'bkg-001',
  listingId: 'lst-001',
  bidId: 'bid-001',
  sourceId: 'user-001',
  collectorId: 'col-001',
  collectorName: 'Rajan Kumar',
  pickupAddress: 'Placeholder Address, Anna Nagar, Chennai',
  scheduledAt: '2024-01-16T17:00:00Z',
  status: 'on_the_way',
  otpVerified: false,
  createdAt: '2024-01-15T13:00:00Z',
};
