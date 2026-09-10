import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Clock3, MapPin, Package } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { Booking } from '../../types';
import { formatDate, isOpenBooking } from './sourceUtils';

type BookingTab = 'upcoming' | 'completed' | 'cancelled';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, getListing } = usePlatform();
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');

  const myBookings = [...bookings]
    .filter((booking) => !user?.id || booking.sourceId === user.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const filtered = myBookings.filter((booking) => {
    if (activeTab === 'upcoming') return isOpenBooking(booking.status);
    return booking.status === activeTab;
  });

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: myBookings.filter((booking) => isOpenBooking(booking.status)).length },
    { id: 'completed', label: 'Completed', count: myBookings.filter((booking) => booking.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: myBookings.filter((booking) => booking.status === 'cancelled').length },
  ];

  const emptyCopy: Record<BookingTab, { title: string; description: string }> = {
    upcoming: { title: 'No upcoming pickups', description: 'Accept a collector bid from one of your listings to schedule a tracked pickup.' },
    completed: { title: 'No completed pickups yet', description: 'Successfully verified pickups will be saved here.' },
    cancelled: { title: 'No cancelled bookings', description: 'Cancelled pickup appointments will appear here for reference.' },
  };

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Pickup management"
        title="Bookings"
        description="See scheduled collections, live pickup status, and completed handovers."
        actions={(
          <Link to="/source/sell" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            + New listing
          </Link>
        )}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as BookingTab)} />

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarCheck}
            title={emptyCopy[activeTab].title}
            description={emptyCopy[activeTab].description}
            actionLabel={activeTab === 'upcoming' ? 'View my listings' : undefined}
            onAction={activeTab === 'upcoming' ? () => navigate('/source') : undefined}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((booking: Booking) => {
            const listing = getListing(booking.listingId);
            return (
              <Link
                key={booking.id}
                to={`/source/bookings/${booking.id}`}
                className="card p-5 flex flex-col gap-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    {listing?.images[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{listing?.itemName ?? 'E-waste pickup'}</h2>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>with {booking.collectorName}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Clock3 size={15} className="flex-shrink-0" /> {formatDate(booking.scheduledAt, true)}
                  </p>
                  <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={15} className="flex-shrink-0 mt-0.5" /> <span className="line-clamp-2">{booking.pickupAddress}</span>
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: booking.otpVerified ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {booking.otpVerified ? 'OTP verified' : booking.status === 'cancelled' ? 'Pickup cancelled' : 'OTP secured'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                    View details <ChevronRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
