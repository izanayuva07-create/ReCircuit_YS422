import type { Bid, Booking, DigitalLot, InventoryItem, Notification, Transaction, WasteListing } from '../types';
import { PLACEHOLDER_BIDS, PLACEHOLDER_BOOKING, PLACEHOLDER_INVENTORY, PLACEHOLDER_LISTINGS, PLACEHOLDER_LOT } from './placeholders';

export interface PlatformSnapshot {
  listings: WasteListing[];
  bids: Bid[];
  bookings: Booking[];
  inventory: InventoryItem[];
  lots: DigitalLot[];
  notifications: Notification[];
  transactions: Transaction[];
}

const relativeIso = (days: number, hours = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours, 0, 0, 0);
  return date.toISOString();
};

export const buildDemoPlatformData = (): PlatformSnapshot => {
  const listings: WasteListing[] = [
    {
      ...PLACEHOLDER_LISTINGS[0],
      status: 'pickup_scheduled',
      pickupAddress: '18, 4th Avenue, Anna Nagar, Chennai',
      createdAt: relativeIso(-2),
      updatedAt: relativeIso(-1),
    },
    {
      ...PLACEHOLDER_LISTINGS[1],
      pickupAddress: '42, South Usman Road, T. Nagar, Chennai',
      createdAt: relativeIso(-1),
      updatedAt: relativeIso(-1),
    },
    {
      id: 'lst-003',
      sourceId: 'user-001',
      category: 'tv_monitor',
      itemName: '24-inch LED Monitor',
      quantity: 1,
      weightKg: 3.8,
      condition: 'partially_working',
      expectedPrice: 850,
      description: 'Display works but flickers after extended use. Includes stand and power cable.',
      pickupAddress: '7, Besant Road, Adyar, Chennai',
      images: [],
      status: 'bidding',
      createdAt: relativeIso(-1, 3),
      updatedAt: relativeIso(0, -2),
    },
    {
      id: 'lst-004',
      sourceId: 'user-001',
      category: 'cable',
      itemName: 'Mixed Computer Cables',
      quantity: 12,
      weightKg: 2.4,
      condition: 'not_working',
      expectedPrice: 300,
      description: 'USB, HDMI, VGA and power cables collected during an office clean-out.',
      pickupAddress: '18, 4th Avenue, Anna Nagar, Chennai',
      images: [],
      status: 'completed',
      createdAt: relativeIso(-25),
      updatedAt: relativeIso(-20),
    },
  ];

  const bids: Bid[] = [
    { ...PLACEHOLDER_BIDS[0], status: 'accepted', createdAt: relativeIso(-2, 2) },
    { ...PLACEHOLDER_BIDS[1], status: 'rejected', createdAt: relativeIso(-2, 3) },
    {
      id: 'bid-003',
      listingId: 'lst-003',
      collectorId: 'col-002',
      collectorName: 'Suresh E-Waste Services',
      collectorRating: 4.6,
      collectorCompletedPickups: 118,
      offeredPrice: 820,
      distanceKm: 3.4,
      estimatedArrivalMins: 35,
      notes: 'Available tomorrow morning with protected monitor packaging.',
      status: 'pending',
      createdAt: relativeIso(0, -4),
    },
    {
      id: 'bid-004',
      listingId: 'lst-003',
      collectorId: 'col-003',
      collectorName: 'EcoMove Collectors',
      collectorRating: 4.8,
      collectorCompletedPickups: 304,
      offeredPrice: 875,
      distanceKm: 5.2,
      estimatedArrivalMins: 45,
      notes: 'Can collect this evening.',
      status: 'pending',
      createdAt: relativeIso(0, -2),
    },
    {
      id: 'bid-005',
      listingId: 'lst-004',
      collectorId: 'col-001',
      collectorName: 'Rajan Kumar',
      collectorRating: 4.7,
      collectorCompletedPickups: 230,
      offeredPrice: 320,
      distanceKm: 2.1,
      estimatedArrivalMins: 25,
      status: 'accepted',
      createdAt: relativeIso(-23),
    },
  ];

  const bookings: Booking[] = [
    {
      ...PLACEHOLDER_BOOKING,
      scheduledAt: relativeIso(1, 1),
      createdAt: relativeIso(-1),
      otp: '4826',
      status: 'on_the_way',
      pickupAddress: '18, 4th Avenue, Anna Nagar, Chennai',
    },
    {
      id: 'bkg-002',
      listingId: 'lst-004',
      bidId: 'bid-005',
      sourceId: 'user-001',
      collectorId: 'col-001',
      collectorName: 'Rajan Kumar',
      pickupAddress: '18, 4th Avenue, Anna Nagar, Chennai',
      scheduledAt: relativeIso(-21),
      status: 'completed',
      otp: '7315',
      otpVerified: true,
      createdAt: relativeIso(-23),
    },
  ];

  const inventory: InventoryItem[] = [
    { ...PLACEHOLDER_INVENTORY[0], lotId: 'lot-001', collectedAt: relativeIso(-12) },
    { ...PLACEHOLDER_INVENTORY[1], lotId: 'lot-001', collectedAt: relativeIso(-11) },
    { ...PLACEHOLDER_INVENTORY[2], collectedAt: relativeIso(-3) },
    {
      id: 'inv-004', collectorId: 'col-001', category: 'cable', itemName: 'Mixed Computer Cables', quantity: 12, weightKg: 2.4,
      estimatedValue: 320, condition: 'not_working', collectedFrom: 'Anna Nagar', collectedAt: relativeIso(-21), images: [], lotId: 'lot-002',
    },
    {
      id: 'inv-005', collectorId: 'col-001', category: 'pcb', itemName: 'Desktop Motherboards', quantity: 6, weightKg: 4.6,
      estimatedValue: 1850, condition: 'not_working', collectedFrom: 'Guindy', collectedAt: relativeIso(-18), images: [], lotId: 'lot-002',
    },
    {
      id: 'inv-006', collectorId: 'col-001', category: 'battery', itemName: 'Sorted Li-ion Battery Lot', quantity: 20, weightKg: 7.8,
      estimatedValue: 980, condition: 'not_working', collectedFrom: 'Velachery', collectedAt: relativeIso(-42), images: [], lotId: 'lot-003',
    },
  ];

  const lotOneItems = inventory.filter((item) => item.lotId === 'lot-001');
  const lotTwoItems = inventory.filter((item) => item.lotId === 'lot-002');
  const lotThreeItems = inventory.filter((item) => item.lotId === 'lot-003');
  const lots: DigitalLot[] = [
    {
      ...PLACEHOLDER_LOT,
      lotName: 'Sorted devices · September A',
      items: lotOneItems,
      totalQuantity: lotOneItems.reduce((sum, item) => sum + item.quantity, 0),
      totalWeightKg: lotOneItems.reduce((sum, item) => sum + item.weightKg, 0),
      estimatedValue: lotOneItems.reduce((sum, item) => sum + item.estimatedValue, 0),
      createdAt: relativeIso(-8),
      updatedAt: relativeIso(-2),
    },
    {
      id: 'lot-002', collectorId: 'col-001', lotName: 'Office electronics · August B', items: lotTwoItems,
      totalQuantity: lotTwoItems.reduce((sum, item) => sum + item.quantity, 0),
      totalWeightKg: lotTwoItems.reduce((sum, item) => sum + item.weightKg, 0),
      estimatedValue: lotTwoItems.reduce((sum, item) => sum + item.estimatedValue, 0),
      storageLocation: 'Godown A, Ambattur', notes: 'Cables bundled separately from circuit boards.', status: 'sent_to_recycler',
      recyclerId: 'rec-001', recyclerName: 'GreenLoop Recycling', createdAt: relativeIso(-16), updatedAt: relativeIso(-1),
    },
    {
      id: 'lot-003', collectorId: 'col-001', lotName: 'Battery batch · July C', items: lotThreeItems,
      totalQuantity: lotThreeItems.reduce((sum, item) => sum + item.quantity, 0),
      totalWeightKg: lotThreeItems.reduce((sum, item) => sum + item.weightKg, 0),
      estimatedValue: lotThreeItems.reduce((sum, item) => sum + item.estimatedValue, 0),
      storageLocation: 'Battery isolation rack, Ambattur', notes: 'Terminals isolated and packed in fire-resistant containers.', status: 'processed',
      recyclerId: 'rec-001', recyclerName: 'GreenLoop Recycling', createdAt: relativeIso(-39), updatedAt: relativeIso(-31),
      acceptedAt: relativeIso(-37), receivedAt: relativeIso(-34), processedAt: relativeIso(-31),
    },
  ];

  const notifications: Notification[] = [
    { id: 'not-001', userId: 'user-001', role: 'source', type: 'bid', title: 'New offer received', message: 'EcoMove Collectors offered ₹875 for your LED monitor.', isRead: false, createdAt: relativeIso(0, -2), linkTo: '/source/listing/lst-003' },
    { id: 'not-002', userId: 'user-001', role: 'source', type: 'pickup', title: 'Collector is on the way', message: 'Rajan has started the journey for your smartphone pickup.', isRead: false, createdAt: relativeIso(0, -1), linkTo: '/source/bookings/bkg-001' },
    { id: 'not-003', userId: 'col-001', role: 'collector', type: 'system', title: 'New listing nearby', message: 'A laptop listing was posted in T. Nagar.', isRead: false, createdAt: relativeIso(-1), linkTo: '/collector/jobs/lst-002' },
    { id: 'not-004', userId: 'rec-001', role: 'recycler', type: 'booking', title: 'Digital lot awaiting review', message: 'Office electronics · August B is ready for your decision.', isRead: false, createdAt: relativeIso(-1), linkTo: '/recycler/lots/lot-002' },
    { id: 'not-005', userId: 'user-001', role: 'source', type: 'payment', title: 'Payment recorded', message: '₹320 was recorded for your completed cable pickup.', isRead: true, createdAt: relativeIso(-20), linkTo: '/source/history' },
  ];

  const transactions: Transaction[] = [
    { id: 'txn-001', userId: 'user-001', role: 'source', type: 'payment', amount: 320, description: 'Payment for Mixed Computer Cables', relatedId: 'lst-004', createdAt: relativeIso(-20) },
    { id: 'txn-002', userId: 'col-001', role: 'collector', type: 'earning', amount: 480, description: 'Collection and handling earnings', relatedId: 'bkg-002', createdAt: relativeIso(-20) },
    { id: 'txn-003', userId: 'col-001', role: 'collector', type: 'earning', amount: 2170, description: 'Digital lot payout', relatedId: 'lot-003', createdAt: relativeIso(-31) },
  ];

  return { listings, bids, bookings, inventory, lots, notifications, transactions };
};
