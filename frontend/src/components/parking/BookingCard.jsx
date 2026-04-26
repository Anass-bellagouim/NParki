import { Link } from 'react-router-dom';
import { Banknote, CalendarDays, Car, Clock3, CreditCard, LogIn, LogOut, MapPin, QrCode } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

const statusLabels = {
  pending: 'Pending',
  accepted: 'Reserved',
  checked_in: 'Checked in',
  awaiting_payment: 'Awaiting payment',
  cash_pending: 'Cash payment pending',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const formatDate = (value) => {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const formatDuration = (minutes) => {
  if (!minutes) {
    return 'Not calculated yet';
  }

  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || !parts.length) parts.push(`${mins}m`);

  return parts.join(' ');
};

const qrImage = (value) => `https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=8&data=${encodeURIComponent(value || '')}`;

export default function BookingCard({ booking, role, onStatus, onCancel, onPay, onConfirmCash }) {
  const spot = booking.parking_spot || {};
  const car = booking.car || {};
  const canPay = role === 'driver' && booking.status === 'awaiting_payment' && booking.payment_status !== 'cash_pending';
  const isDriverPendingCash = role === 'driver' && booking.payment_status === 'cash_pending';
  const isDriverWithQr = role === 'driver' && ['accepted', 'checked_in', 'awaiting_payment'].includes(booking.status) && booking.qr_code;
  const isOwnerPendingCash = role === 'owner' && booking.payment_status === 'cash_pending';

  return (
    <article className="booking-card">
      <div className="booking-main">
        <div>
          <div className="booking-title-row">
            <h3>{spot.title || 'Parking booking'}</h3>
            <Badge>{statusLabels[booking.status] || booking.status}</Badge>
          </div>
          <p>
            <MapPin size={16} />
            {spot.address}, {spot.city}
          </p>
          <p>
            <Car size={16} />
            {car.brand} {car.model} - {car.plate_number}
          </p>
          {booking.status === 'accepted' && (
            <p>
              <Clock3 size={16} />
              Arrive before {formatDate(booking.reserved_until)}
            </p>
          )}
          {booking.checked_in_at && (
            <p>
              <LogIn size={16} />
              Entry scan {formatDate(booking.checked_in_at)}
            </p>
          )}
          {booking.checked_out_at && (
            <p>
              <LogOut size={16} />
              Exit scan {formatDate(booking.checked_out_at)}
            </p>
          )}
          {booking.duration_minutes && (
            <p>
              <CalendarDays size={16} />
              Parked for {formatDuration(booking.duration_minutes)}
            </p>
          )}
        </div>
        <strong>{Number(booking.total_price || 0).toFixed(2)} DH</strong>
      </div>

      {isDriverWithQr && (
        <div className="booking-qr-row">
          <img src={qrImage(booking.qr_code)} alt={`Booking QR Code`} />
          <div>
            <span>
              <QrCode size={15} />
              Booking QR Code
            </span>
            <strong>{booking.qr_code}</strong>
            <small>Present this to the parking owner.</small>
          </div>
        </div>
      )}

      <div className="booking-actions">
        {role === 'owner' && booking.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => onStatus?.(booking.id, 'accepted')}>Accept</Button>
            <Button size="sm" variant="danger" onClick={() => onStatus?.(booking.id, 'rejected')}>Reject</Button>
          </>
        )}
        {isOwnerPendingCash && (
          <Button size="sm" onClick={() => onConfirmCash?.(booking.id)}>
            <Banknote size={16} />
            Confirm Cash Received
          </Button>
        )}
        {canPay && (
          <>
            <Button size="sm" onClick={() => onPay?.(booking.id, 'cash')}>
              <Banknote size={16} />
              Pay cash
            </Button>
            <Link className="btn btn-sm btn-outline" to={`/bookings/${booking.id}/payment`}>
              <CreditCard size={16} />
              Pay online
            </Link>
          </>
        )}
        {isDriverPendingCash && (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock3 size={14} />
            Waiting for owner to confirm cash
          </span>
        )}
        {role === 'driver' && ['pending', 'accepted'].includes(booking.status) && (
          <Button size="sm" variant="outline" onClick={() => onCancel?.(booking.id)}>Cancel</Button>
        )}
      </div>
    </article>
  );
}
