import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import BookingCard from '../../components/parking/BookingCard.jsx';
import Card from '../../components/ui/Card.jsx';
import api, { getApiError } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then(({ data }) => setBookings(data.data || []))
      .catch((requestError) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    load();
  };

  const cancel = async (id) => {
    await api.patch(`/bookings/${id}/cancel`);
    load();
  };

  return (
    <DashboardLayout title={user.role === 'owner' ? 'Booking requests' : 'My bookings'} eyebrow="Reservations">
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="page-loader">Loading bookings...</div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role={user.role}
              onStatus={updateStatus}
              onCancel={cancel}
            />
          ))}
          {!bookings.length && <Card className="empty-state">No bookings yet.</Card>}
        </div>
      )}
    </DashboardLayout>
  );
}
