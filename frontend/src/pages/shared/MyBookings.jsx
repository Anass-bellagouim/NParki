import { useEffect, useState } from 'react';
import { QrCode, Camera, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import BookingCard from '../../components/parking/BookingCard.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import QrScanner from '../../components/ui/QrScanner.jsx';
import api, { getApiError } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // QR Scan state for owner
  const [qrCode, setQrCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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
    try {
      setError('');
      const { data } = await api.patch(`/bookings/${id}/status`, { status });
      setMessage(data.message);
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const cancel = async (id) => {
    try {
      setError('');
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      setMessage(data.message);
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const confirmCash = async (id) => {
    try {
      setError('');
      const { data } = await api.post(`/bookings/${id}/confirm-cash`);
      setMessage(data.message);
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const pay = async (id, paymentMethod) => {
    try {
      setError('');
      const { data } = await api.post(`/bookings/${id}/payment`, { payment_method: paymentMethod });
      setMessage(data.message);
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const handleCameraScan = async (decodedText) => {
    setShowCamera(false);
    setQrCode(decodedText);
    setTimeout(() => submitQrCode(decodedText), 300);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    submitQrCode(qrCode);
  };

  const submitQrCode = async (codeToSubmit) => {
    if (!codeToSubmit.trim()) return;
    setScanning(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/owner/scan-qr', { qr_code: codeToSubmit });
      setMessage(data.message);
      setQrCode('');
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setScanning(false);
    }
  };

  return (
    <DashboardLayout title={user.role === 'owner' ? 'Booking requests' : 'My bookings'} eyebrow="Reservations">
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {loading ? (
        <div className="page-loader">Loading bookings...</div>
      ) : (
        <>
          {user.role === 'owner' && (
            <Card className="scan-panel" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2><QrCode size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Scan Driver QR</h2>
                <Button size="sm" variant={showCamera ? "outline" : "primary"} onClick={() => setShowCamera(!showCamera)}>
                  {showCamera ? <><X size={16} /> Close Camera</> : <><Camera size={16} /> Use Camera</>}
                </Button>
              </div>
              <p style={{ marginTop: '0.5rem' }}>Enter the booking QR code from the driver to record entry or exit, or use the camera to scan.</p>
              {showCamera && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <QrScanner onScan={handleCameraScan} />
                </div>
              )}
              <form onSubmit={handleScan} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Booking QR Code"
                    placeholder="e.g. NP-ABCD1234EFGH"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={scanning || !qrCode.trim()}>
                  {scanning ? 'Processing...' : 'Process QR'}
                </Button>
              </form>
            </Card>
          )}

          <div className="booking-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              role={user.role}
              onStatus={updateStatus}
              onCancel={cancel}
              onConfirmCash={confirmCash}
              onPay={pay}
            />
          ))}
          {!bookings.length && <Card className="empty-state">No bookings yet.</Card>}
        </div>
        </>
      )}
    </DashboardLayout>
  );
}
