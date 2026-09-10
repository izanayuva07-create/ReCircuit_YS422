import type { Booking, ListingStatus, PickupStatus, TraceEvent, WasteListing } from '../../types';

export const CATEGORY_LABELS: Record<WasteListing['category'], string> = {
  mobile: 'Mobile phone',
  laptop: 'Laptop',
  desktop: 'Desktop computer',
  tablet: 'Tablet',
  battery: 'Battery',
  pcb: 'Circuit board (PCB)',
  cable: 'Cables and wires',
  appliance: 'Home appliance',
  tv_monitor: 'TV or monitor',
  printer: 'Printer',
  other: 'Other electronics',
};

export const CONDITION_LABELS: Record<WasteListing['condition'], string> = {
  working: 'Working',
  partially_working: 'Partially working',
  not_working: 'Not working',
  damaged: 'Damaged',
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (value: string, includeTime = false): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(date);
};

export const sortNewestFirst = <T extends { createdAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const isOpenListing = (status: ListingStatus): boolean =>
  !['completed', 'cancelled'].includes(status);

export const isOpenBooking = (status: PickupStatus): boolean =>
  !['completed', 'cancelled'].includes(status);

const bookingStatusIndex: Record<PickupStatus, number> = {
  confirmed: 0,
  collector_assigned: 1,
  on_the_way: 2,
  arrived: 3,
  otp_verification: 4,
  completed: 5,
  cancelled: -1,
};

export const getBookingSteps = (booking: Booking) => {
  const labels = ['Confirmed', 'Collector assigned', 'On the way', 'Arrived', 'OTP verified', 'Completed'];
  const currentIndex = bookingStatusIndex[booking.status];

  return labels.map((label, index) => ({
    label,
    status: (booking.status === 'cancelled'
      ? index === 0 ? 'completed' : 'upcoming'
      : index < currentIndex || booking.status === 'completed'
        ? 'completed'
        : index === currentIndex
          ? 'current'
          : 'upcoming') as 'completed' | 'current' | 'upcoming',
  }));
};

export const getTraceEvents = (listing: WasteListing, booking?: Booking): TraceEvent[] => {
  const complete = listing.status === 'completed';
  const accepted = Boolean(booking) || ['accepted', 'pickup_scheduled', 'picked_up', 'completed'].includes(listing.status);
  const scheduled = Boolean(booking);
  const arrived = Boolean(booking && ['arrived', 'otp_verification', 'completed'].includes(booking.status));
  const pickupVerified = Boolean(booking?.otpVerified) || ['picked_up', 'completed'].includes(listing.status);
  const pickedUp = ['picked_up', 'completed'].includes(listing.status);

  const resolve = (done: boolean, current: boolean): TraceEvent['status'] => {
    if (done) return 'completed';
    if (current) return 'current';
    return 'upcoming';
  };

  return [
    {
      stage: 'source_listed',
      label: 'Listed by source',
      description: `${listing.itemName} was added to Re-Circuit.`,
      timestamp: listing.createdAt,
      status: listing.status === 'draft' ? 'current' : 'completed',
    },
    {
      stage: 'bid_accepted',
      label: 'Collector selected',
      description: accepted ? `${booking?.collectorName ?? 'A verified collector'} was selected.` : 'Waiting for you to accept a collector bid.',
      timestamp: accepted ? booking?.createdAt ?? listing.updatedAt : undefined,
      status: resolve(accepted, ['active', 'bidding'].includes(listing.status)),
    },
    {
      stage: 'pickup_scheduled',
      label: 'Pickup scheduled',
      description: scheduled ? 'A pickup window and destination were confirmed.' : 'A pickup is scheduled after a bid is accepted.',
      timestamp: booking?.scheduledAt,
      status: resolve(scheduled, accepted && !scheduled),
    },
    {
      stage: 'collector_arrived',
      label: 'Collector arrived',
      description: arrived ? `${booking?.collectorName ?? 'The collector'} reached the pickup point.` : 'Arrival is confirmed before the secure hand-off.',
      timestamp: arrived ? listing.updatedAt : undefined,
      status: resolve(arrived, Boolean(booking && ['on_the_way'].includes(booking.status))),
    },
    {
      stage: 'otp_verified',
      label: 'OTP verified',
      description: pickupVerified ? 'The handover was secured with OTP verification.' : 'The pickup OTP confirms a safe handover.',
      timestamp: pickupVerified ? listing.updatedAt : undefined,
      status: resolve(pickupVerified, arrived && !pickupVerified),
    },
    {
      stage: 'added_to_inventory',
      label: 'Inventory recorded',
      description: 'The collected item is recorded before aggregation.',
      timestamp: pickedUp ? listing.updatedAt : undefined,
      status: resolve(pickedUp, pickupVerified && !pickedUp),
    },
    {
      stage: 'lot_created',
      label: 'Digital lot created',
      description: 'Items are grouped into a traceable batch for a certified recycler.',
      timestamp: complete ? listing.updatedAt : undefined,
      status: resolve(complete, pickedUp && !complete),
    },
    {
      stage: 'recycler_accepted',
      label: 'Accepted by recycler',
      description: 'A certified facility accepts the digital lot.',
      timestamp: complete ? listing.updatedAt : undefined,
      status: resolve(complete, false),
    },
    {
      stage: 'recycling_completed',
      label: 'Responsible recycling completed',
      description: 'Recoverable material was processed through an authorized channel.',
      timestamp: complete ? listing.updatedAt : undefined,
      status: resolve(complete, false),
    },
  ];
};
