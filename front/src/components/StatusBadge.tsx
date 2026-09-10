import React from 'react';
import type { PickupStatus, BidStatus, LotStatus, ListingStatus } from '../types';

type BadgeStatus = PickupStatus | BidStatus | LotStatus | ListingStatus | 'active' | 'pending' | 'completed' | 'cancelled' | 'processing';

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  // Listing
  draft: { label: 'Draft', bg: '#f3f4f6', color: '#6b7280' },
  active: { label: 'Active', bg: '#f0fdf4', color: '#16a34a' },
  bidding: { label: 'Bidding', bg: '#eff6ff', color: '#2563eb' },
  accepted: { label: 'Accepted', bg: '#f0fdf4', color: '#16a34a' },
  pickup_scheduled: { label: 'Pickup Scheduled', bg: '#fefce8', color: '#ca8a04' },
  picked_up: { label: 'Picked Up', bg: '#f0fdf4', color: '#15803d' },
  completed: { label: 'Completed', bg: '#f0fdf4', color: '#15803d' },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626' },
  // Bid
  pending: { label: 'Pending', bg: '#fefce8', color: '#ca8a04' },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626' },
  withdrawn: { label: 'Withdrawn', bg: '#f3f4f6', color: '#6b7280' },
  // Pickup
  confirmed: { label: 'Confirmed', bg: '#f0fdf4', color: '#16a34a' },
  collector_assigned: { label: 'Assigned', bg: '#eff6ff', color: '#2563eb' },
  on_the_way: { label: 'On the Way', bg: '#fefce8', color: '#ca8a04' },
  arrived: { label: 'Arrived', bg: '#fdf4ff', color: '#9333ea' },
  otp_verification: { label: 'OTP Verification', bg: '#fdf4ff', color: '#9333ea' },
  // Lot
  ready: { label: 'Ready', bg: '#f0fdf4', color: '#16a34a' },
  sent_to_recycler: { label: 'Sent to Recycler', bg: '#eff6ff', color: '#2563eb' },
  received: { label: 'Received', bg: '#f0fdf4', color: '#15803d' },
  processed: { label: 'Processed', bg: '#f0fdf4', color: '#15803d' },
  processing: { label: 'Processing', bg: '#fefce8', color: '#ca8a04' },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
