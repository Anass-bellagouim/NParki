import { CalendarDays, Car, MapPin } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

const formatDate = (value) => new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

export default function BookingCard({ booking, role, onStatus, onCancel }) {
  const spot = booking.parking_spot || {};
  const car = booking.car || {};

  return (
    <article className="booking-card">
      <div className="booking-main">
        <div>
          <div className="booking-title-row">
            <h3>{spot.title || 'Parking booking'}</h3>
            <Badge>{booking.status}</Badge>
          </div>
          <p>
            <MapPin size={16} />
            {spot.address}, {spot.city}
          </p>
          <p>
            <CalendarDays size={16} />
            {formatDate(booking.start_time)} to {formatDate(booking.end_time)}
          </p>
          <p>
            <Car size={16} />
            {car.brand} {car.model} - {car.plate_number}
          </p>
        </div>
        <strong>{Number(booking.total_price).toFixed(2)} DH</strong>
      </div>

      <div className="booking-actions">
        {role === 'owner' && booking.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => onStatus?.(booking.id, 'accepted')}>Accept</Button>
            <Button size="sm" variant="danger" onClick={() => onStatus?.(booking.id, 'rejected')}>Reject</Button>
          </>
        )}
        {role === 'owner' && booking.status === 'accepted' && (
          <Button size="sm" variant="outline" onClick={() => onStatus?.(booking.id, 'completed')}>Mark completed</Button>
        )}
        {role === 'driver' && ['pending', 'accepted'].includes(booking.status) && (
          <Button size="sm" variant="outline" onClick={() => onCancel?.(booking.id)}>Cancel</Button>
        )}
      </div>
    </article>
  );
}
