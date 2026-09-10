import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PlatformContext } from './PlatformContext';
import type {
  AddInventoryItemInput,
  CreateDigitalLotInput,
  CreateListingInput,
  LotStatusDetails,
  PlaceBidInput,
  PlatformContextValue,
} from './PlatformContext';
import type { Bid, Booking, DigitalLot, InventoryItem, LotStatus, Notification, PickupStatus, Transaction, WasteListing } from '../types';
import { buildDemoPlatformData } from '../data/demoPlatform';
import type { PlatformSnapshot } from '../data/demoPlatform';
import { useAuth } from './AuthContext';
import { createId } from '../utils/format';

const STORAGE_KEY = 'rc_platform_data_v2';

const cloneDemoData = (): PlatformSnapshot => buildDemoPlatformData();

const readInitialState = (): PlatformSnapshot => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneDemoData();
    const parsed = JSON.parse(stored) as Partial<PlatformSnapshot>;
    if (!Array.isArray(parsed.listings) || !Array.isArray(parsed.bids) || !Array.isArray(parsed.bookings)
      || !Array.isArray(parsed.inventory) || !Array.isArray(parsed.lots) || !Array.isArray(parsed.notifications)) {
      return cloneDemoData();
    }
    return {
      listings: parsed.listings,
      bids: parsed.bids,
      bookings: parsed.bookings,
      inventory: parsed.inventory,
      lots: parsed.lots,
      notifications: parsed.notifications,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    };
  } catch {
    return cloneDemoData();
  }
};

const notificationFor = (
  userId: string | undefined,
  role: Notification['role'],
  type: Notification['type'],
  title: string,
  message: string,
  linkTo?: string,
): Notification => ({
  id: createId('not'),
  userId,
  role,
  type,
  title,
  message,
  isRead: false,
  createdAt: new Date().toISOString(),
  linkTo,
});

const transactionExists = (items: Transaction[], relatedId: string, type: Transaction['type']) =>
  items.some((item) => item.relatedId === relatedId && item.type === type);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<PlatformSnapshot>(readInitialState);
  const stateRef = useRef(state);

  const commit = useCallback((updater: (current: PlatformSnapshot) => PlatformSnapshot) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage can be unavailable in strict privacy mode. */ }
    return next;
  }, []);

  const createListing = useCallback((input: CreateListingInput): WasteListing => {
    if (!input.itemName.trim()) throw new Error('Item name is required.');
    if (input.quantity <= 0 || input.weightKg <= 0 || input.expectedPrice < 0) throw new Error('Quantity, weight, and price must be valid.');
    const timestamp = new Date().toISOString();
    const listing: WasteListing = {
      ...input,
      sourceId: input.sourceId ?? user?.id ?? 'user-001',
      itemName: input.itemName.trim(),
      pickupAddress: input.pickupAddress.trim(),
      description: input.description?.trim(),
      images: [...input.images],
      status: input.status ?? 'active',
      id: createId('lst'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    commit((current) => ({
      ...current,
      listings: [listing, ...current.listings],
      notifications: [notificationFor(listing.sourceId, 'source', 'system', 'Listing published', `${listing.itemName} is now visible to nearby collectors.`, `/source/listing/${listing.id}`), ...current.notifications],
    }));
    return listing;
  }, [commit, user?.id]);

  const updateListing = useCallback((id: string, updates: Partial<WasteListing>): WasteListing => {
    const existing = stateRef.current.listings.find((listing) => listing.id === id);
    if (!existing) throw new Error('Listing not found.');
    const updated: WasteListing = { ...existing, ...updates, id: existing.id, sourceId: existing.sourceId, updatedAt: new Date().toISOString() };
    commit((current) => ({ ...current, listings: current.listings.map((listing) => listing.id === id ? updated : listing) }));
    return updated;
  }, [commit]);

  const deleteListing = useCallback((id: string) => {
    const existing = stateRef.current.listings.find((listing) => listing.id === id);
    if (!existing) throw new Error('Listing not found.');
    const activeBooking = stateRef.current.bookings.some((booking) => booking.listingId === id && !['completed', 'cancelled'].includes(booking.status));
    if (activeBooking) throw new Error('Cancel the active pickup before deleting this listing.');
    commit((current) => ({
      ...current,
      listings: current.listings.filter((listing) => listing.id !== id),
      bids: current.bids.filter((bid) => bid.listingId !== id),
      bookings: current.bookings.filter((booking) => booking.listingId !== id),
    }));
  }, [commit]);

  const placeBid = useCallback((listingId: string, input: PlaceBidInput): Bid => {
    const listing = stateRef.current.listings.find((item) => item.id === listingId);
    if (!listing || !['active', 'bidding'].includes(listing.status)) throw new Error('This listing is no longer accepting bids.');
    if (!Number.isFinite(input.offeredPrice) || input.offeredPrice <= 0) throw new Error('Enter a valid offer amount.');
    const collectorId = user?.id ?? 'col-001';
    const duplicate = stateRef.current.bids.some((bid) => bid.listingId === listingId && bid.collectorId === collectorId && bid.status === 'pending');
    if (duplicate) throw new Error('You already have an active bid on this listing.');
    const bid: Bid = {
      id: createId('bid'),
      listingId,
      collectorId,
      collectorName: user?.name ?? 'Verified collector',
      collectorRating: 4.7,
      collectorCompletedPickups: 230,
      offeredPrice: input.offeredPrice,
      distanceKm: input.distanceKm ?? 2.5,
      estimatedArrivalMins: input.estimatedArrivalMins ?? 30,
      notes: input.notes?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    commit((current) => ({
      ...current,
      listings: current.listings.map((item) => item.id === listingId ? { ...item, status: 'bidding', updatedAt: new Date().toISOString() } : item),
      bids: [bid, ...current.bids],
      notifications: [notificationFor(listing.sourceId, 'source', 'bid', 'New collector bid', `${bid.collectorName} offered ₹${bid.offeredPrice.toLocaleString('en-IN')} for ${listing.itemName}.`, `/source/listing/${listingId}`), ...current.notifications],
    }));
    return bid;
  }, [commit, user?.id, user?.name]);

  const withdrawBid = useCallback((id: string): Bid => {
    const existing = stateRef.current.bids.find((bid) => bid.id === id);
    if (!existing) throw new Error('Bid not found.');
    if (existing.status !== 'pending') throw new Error('Only pending bids can be withdrawn.');
    const updated: Bid = { ...existing, status: 'withdrawn' };
    commit((current) => ({ ...current, bids: current.bids.map((bid) => bid.id === id ? updated : bid) }));
    return updated;
  }, [commit]);

  const acceptBid = useCallback((id: string, scheduledAt?: string): { bid: Bid; booking: Booking } => {
    const bid = stateRef.current.bids.find((item) => item.id === id);
    if (!bid) throw new Error('Bid not found.');
    if (bid.status !== 'pending') throw new Error('This bid is no longer available.');
    const listing = stateRef.current.listings.find((item) => item.id === bid.listingId);
    if (!listing) throw new Error('Listing not found.');
    const updatedBid: Bid = { ...bid, status: 'accepted' };
    const date = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) throw new Error('Choose a pickup time in the future.');
    const booking: Booking = {
      id: createId('bkg'),
      listingId: listing.id,
      bidId: bid.id,
      sourceId: listing.sourceId,
      collectorId: bid.collectorId,
      collectorName: bid.collectorName,
      pickupAddress: listing.pickupAddress,
      scheduledAt: date.toISOString(),
      status: 'confirmed',
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      otpVerified: false,
      createdAt: new Date().toISOString(),
    };
    commit((current) => ({
      ...current,
      bids: current.bids.map((item) => item.id === id ? updatedBid : item.listingId === listing.id && item.status === 'pending' ? { ...item, status: 'rejected' } : item),
      listings: current.listings.map((item) => item.id === listing.id ? { ...item, status: 'pickup_scheduled', updatedAt: new Date().toISOString() } : item),
      bookings: [booking, ...current.bookings.filter((item) => item.listingId !== listing.id)],
      notifications: [
        notificationFor(bid.collectorId, 'collector', 'booking', 'Bid accepted', `Your offer for ${listing.itemName} was accepted.`, `/collector/pickups/${booking.id}`),
        notificationFor(listing.sourceId, 'source', 'booking', 'Pickup confirmed', `${bid.collectorName} is scheduled to collect ${listing.itemName}.`, `/source/bookings/${booking.id}`),
        ...current.notifications,
      ],
    }));
    return { bid: updatedBid, booking };
  }, [commit]);

  const completeBooking = useCallback((current: PlatformSnapshot, booking: Booking): PlatformSnapshot => {
    const listing = current.listings.find((item) => item.id === booking.listingId);
    const bid = current.bids.find((item) => item.id === booking.bidId);
    if (!listing) return current;
    const completedBooking: Booking = { ...booking, status: 'completed', otpVerified: true };
    const alreadyInInventory = current.inventory.some((item) => item.id === `pickup-${booking.id}`);
    const inventoryItem: InventoryItem = {
      id: `pickup-${booking.id}`,
      collectorId: booking.collectorId,
      category: listing.category,
      itemName: listing.itemName,
      quantity: listing.quantity,
      weightKg: listing.weightKg,
      estimatedValue: bid?.offeredPrice ?? listing.expectedPrice,
      condition: listing.condition,
      collectedFrom: listing.pickupAddress,
      collectedAt: new Date().toISOString(),
      images: [...listing.images],
    };
    const paymentAmount = bid?.offeredPrice ?? listing.expectedPrice;
    const payment: Transaction = { id: createId('txn'), userId: listing.sourceId, role: 'source', type: 'payment', amount: paymentAmount, description: `Payment for ${listing.itemName}`, relatedId: booking.id, createdAt: new Date().toISOString() };
    const earning: Transaction = { id: createId('txn'), userId: booking.collectorId, role: 'collector', type: 'earning', amount: Math.max(75, Math.round(paymentAmount * 0.12)), description: `Collection earnings for ${listing.itemName}`, relatedId: booking.id, createdAt: new Date().toISOString() };
    return {
      ...current,
      bookings: current.bookings.map((item) => item.id === booking.id ? completedBooking : item),
      listings: current.listings.map((item) => item.id === listing.id ? { ...item, status: 'picked_up', updatedAt: new Date().toISOString() } : item),
      inventory: alreadyInInventory ? current.inventory : [inventoryItem, ...current.inventory],
      transactions: [
        ...(!transactionExists(current.transactions, booking.id, 'payment') ? [payment] : []),
        ...(!transactionExists(current.transactions, booking.id, 'earning') ? [earning] : []),
        ...current.transactions,
      ],
      notifications: [
        notificationFor(listing.sourceId, 'source', 'pickup', 'Pickup completed', `${listing.itemName} was handed over securely.`, '/source/history'),
        notificationFor(booking.collectorId, 'collector', 'pickup', 'Added to inventory', `${listing.itemName} is now ready for lot creation.`, '/collector/inventory'),
        ...current.notifications,
      ],
    };
  }, []);

  const updateBookingStatus = useCallback((id: string, status: PickupStatus): Booking => {
    const existing = stateRef.current.bookings.find((booking) => booking.id === id);
    if (!existing) throw new Error('Booking not found.');
    if (existing.status === 'completed' && status !== 'completed') throw new Error('A completed pickup cannot be reopened.');
    const updated: Booking = { ...existing, status, otpVerified: status === 'completed' ? true : existing.otpVerified };
    commit((current) => {
      if (status === 'completed') return completeBooking(current, updated);
      const listingStatus = status === 'cancelled' ? 'cancelled' : status === 'confirmed' ? 'pickup_scheduled' : current.listings.find((item) => item.id === existing.listingId)?.status;
      return {
        ...current,
        bookings: current.bookings.map((booking) => booking.id === id ? updated : booking),
        listings: current.listings.map((listing) => listing.id === existing.listingId && listingStatus ? { ...listing, status: listingStatus, updatedAt: new Date().toISOString() } : listing),
        notifications: status === 'cancelled'
          ? [notificationFor(existing.collectorId, 'collector', 'booking', 'Pickup cancelled', 'The source cancelled this scheduled pickup.', '/collector/jobs'), ...current.notifications]
          : current.notifications,
      };
    });
    return updated;
  }, [commit, completeBooking]);

  const verifyBookingOtp = useCallback((id: string, otp: string): boolean => {
    const booking = stateRef.current.bookings.find((item) => item.id === id);
    if (!booking || booking.otp !== otp.trim()) return false;
    const completed = { ...booking, status: 'completed' as const, otpVerified: true };
    commit((current) => completeBooking(current, completed));
    return true;
  }, [commit, completeBooking]);

  const addInventoryItem = useCallback((input: AddInventoryItemInput): InventoryItem => {
    if (!input.itemName.trim() || input.quantity <= 0 || input.weightKg <= 0) throw new Error('Enter valid inventory item details.');
    const item: InventoryItem = {
      ...input,
      id: createId('inv'),
      collectorId: input.collectorId ?? user?.id ?? 'col-001',
      itemName: input.itemName.trim(),
      collectedAt: input.collectedAt ?? new Date().toISOString(),
      images: input.images ? [...input.images] : [],
    };
    commit((current) => ({ ...current, inventory: [item, ...current.inventory] }));
    return item;
  }, [commit, user?.id]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>): InventoryItem => {
    const existing = stateRef.current.inventory.find((item) => item.id === id);
    if (!existing) throw new Error('Inventory item not found.');
    const updated: InventoryItem = { ...existing, ...updates, id: existing.id, collectorId: existing.collectorId };
    commit((current) => ({
      ...current,
      inventory: current.inventory.map((item) => item.id === id ? updated : item),
      lots: current.lots.map((lot) => lot.items.some((item) => item.id === id)
        ? {
            ...lot,
            items: lot.items.map((item) => item.id === id ? updated : item),
            totalQuantity: lot.items.reduce((sum, item) => sum + (item.id === id ? updated.quantity : item.quantity), 0),
            totalWeightKg: lot.items.reduce((sum, item) => sum + (item.id === id ? updated.weightKg : item.weightKg), 0),
            estimatedValue: lot.items.reduce((sum, item) => sum + (item.id === id ? updated.estimatedValue : item.estimatedValue), 0),
            updatedAt: new Date().toISOString(),
          }
        : lot),
    }));
    return updated;
  }, [commit]);

  const removeInventoryItem = useCallback((id: string) => {
    const item = stateRef.current.inventory.find((candidate) => candidate.id === id);
    if (!item) throw new Error('Inventory item not found.');
    if (item.lotId) throw new Error('Remove this item from its digital lot before deleting it.');
    commit((current) => ({ ...current, inventory: current.inventory.filter((candidate) => candidate.id !== id) }));
  }, [commit]);

  const createDigitalLot = useCallback((input: CreateDigitalLotInput): DigitalLot => {
    if (!input.lotName.trim()) throw new Error('Lot name is required.');
    const uniqueIds = [...new Set(input.itemIds)];
    const items = stateRef.current.inventory.filter((item) => uniqueIds.includes(item.id) && !item.lotId);
    if (items.length !== uniqueIds.length || items.length === 0) throw new Error('Select one or more available inventory items.');
    const timestamp = new Date().toISOString();
    const lotId = createId('lot');
    const lotItems = items.map((item) => ({ ...item, lotId }));
    const lot: DigitalLot = {
      id: lotId,
      collectorId: user?.id ?? items[0].collectorId,
      lotName: input.lotName.trim(),
      items: lotItems,
      totalQuantity: lotItems.reduce((sum, item) => sum + item.quantity, 0),
      totalWeightKg: lotItems.reduce((sum, item) => sum + item.weightKg, 0),
      estimatedValue: lotItems.reduce((sum, item) => sum + item.estimatedValue, 0),
      storageLocation: input.storageLocation?.trim(),
      notes: input.notes?.trim(),
      status: 'ready',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    commit((current) => ({
      ...current,
      inventory: current.inventory.map((item) => uniqueIds.includes(item.id) ? { ...item, lotId } : item),
      lots: [lot, ...current.lots],
    }));
    return lot;
  }, [commit, user?.id]);

  const updateLotStatus = useCallback((id: string, status: LotStatus, details: LotStatusDetails = {}): DigitalLot => {
    const existing = stateRef.current.lots.find((lot) => lot.id === id);
    if (!existing) throw new Error('Digital lot not found.');
    const allowed: Record<LotStatus, LotStatus[]> = {
      draft: ['ready'], ready: ['sent_to_recycler'], sent_to_recycler: ['accepted', 'rejected'], accepted: ['received', 'rejected'], rejected: ['ready'], received: ['processed'], processed: [],
    };
    if (status !== existing.status && !allowed[existing.status].includes(status)) throw new Error(`Cannot move a ${existing.status.replaceAll('_', ' ')} lot to ${status.replaceAll('_', ' ')}.`);
    const timestamp = new Date().toISOString();
    const updated: DigitalLot = {
      ...existing,
      ...details,
      status,
      updatedAt: timestamp,
      acceptedAt: status === 'accepted' ? timestamp : existing.acceptedAt,
      receivedAt: status === 'received' ? timestamp : existing.receivedAt,
      processedAt: status === 'processed' ? timestamp : existing.processedAt,
    };
    commit((current) => {
      const notifications = [...current.notifications];
      if (status === 'accepted') notifications.unshift(notificationFor(existing.collectorId, 'collector', 'system', 'Lot accepted', `${existing.lotName} was accepted by ${updated.recyclerName ?? user?.name ?? 'the recycler'}.`, `/collector/lots/${id}`));
      if (status === 'rejected') notifications.unshift(notificationFor(existing.collectorId, 'collector', 'system', 'Lot needs attention', `${existing.lotName} was declined. ${details.rejectionReason ?? ''}`.trim(), `/collector/lots/${id}`));
      if (status === 'received') notifications.unshift(notificationFor(existing.collectorId, 'collector', 'system', 'Lot received', `${existing.lotName} arrived at the recycling facility.`, `/collector/lots/${id}`));
      if (status === 'processed') notifications.unshift(notificationFor(existing.collectorId, 'collector', 'payment', 'Recycling completed', `${existing.lotName} has completed its traceability journey.`, `/collector/lots/${id}`));
      const payout: Transaction = { id: createId('txn'), userId: existing.collectorId, role: 'collector', type: 'earning', amount: existing.estimatedValue, description: `Digital lot payout · ${existing.lotName}`, relatedId: id, createdAt: timestamp };
      return {
        ...current,
        lots: current.lots.map((lot) => lot.id === id ? updated : lot),
        listings: status === 'processed'
          ? current.listings.map((listing) => listing.status === 'picked_up' ? { ...listing, status: 'completed', updatedAt: timestamp } : listing)
          : current.listings,
        transactions: status === 'processed' && !transactionExists(current.transactions, id, 'earning') ? [payout, ...current.transactions] : current.transactions,
        notifications,
      };
    });
    return updated;
  }, [commit, user?.name]);

  const sendLotToRecycler = useCallback((id: string, recyclerName = 'GreenLoop Recycling') =>
    updateLotStatus(id, 'sent_to_recycler', { recyclerId: 'rec-001', recyclerName }), [updateLotStatus]);

  const markNotificationRead = useCallback((id: string) => {
    commit((current) => ({ ...current, notifications: current.notifications.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification) }));
  }, [commit]);

  const markAllNotificationsRead = useCallback(() => {
    commit((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => {
        const belongsToUser = !notification.userId || notification.userId === user?.id || (!notification.userId && notification.role === user?.role);
        return belongsToUser ? { ...notification, isRead: true } : notification;
      }),
    }));
  }, [commit, user?.id, user?.role]);

  const resetDemoData = useCallback(() => {
    const next = cloneDemoData();
    stateRef.current = next;
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Ignore unavailable storage. */ }
  }, []);

  const visibleNotifications = useMemo(
    () => state.notifications.filter((notification) => !notification.userId || notification.userId === user?.id || (!notification.userId && (!notification.role || notification.role === user?.role))),
    [state.notifications, user?.id, user?.role],
  );

  const value = useMemo<PlatformContextValue>(() => ({
    ...state,
    notifications: visibleNotifications,
    unreadNotificationCount: visibleNotifications.filter((notification) => !notification.isRead).length,
    createListing,
    updateListing,
    deleteListing,
    placeBid,
    withdrawBid,
    acceptBid,
    updateBookingStatus,
    verifyBookingOtp,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    createLot: createDigitalLot,
    createDigitalLot,
    sendLotToRecycler,
    updateLotStatus,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    resetPlatformData: resetDemoData,
    getListing: (id: string) => state.listings.find((listing) => listing.id === id),
    getBidsForListing: (id: string) => state.bids.filter((bid) => bid.listingId === id),
    getBooking: (id: string) => state.bookings.find((booking) => booking.id === id),
    getLot: (id: string) => state.lots.find((lot) => lot.id === id),
  }), [acceptBid, addInventoryItem, createDigitalLot, createListing, deleteListing, markAllNotificationsRead, markNotificationRead, placeBid, removeInventoryItem, resetDemoData, sendLotToRecycler, state, updateBookingStatus, updateInventoryItem, updateListing, updateLotStatus, verifyBookingOtp, visibleNotifications, withdrawBid]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

export default PlatformProvider;
