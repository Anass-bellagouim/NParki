import { Link } from 'react-router-dom';
import { CalendarCheck, CircleDollarSign, Clock3, ParkingCircle, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ParkingCard from '../../components/parking/ParkingCard.jsx';
import api, { getApiError } from '../../api/client.js';

const statsConfig = [
  ['total_parking_spots', 'Total parking spots', ParkingCircle],
  ['active_bookings', 'Active bookings', CalendarCheck],
  ['total_earnings', 'Total earnings', CircleDollarSign],
  ['pending_requests', 'Pending requests', Clock3],
];

export default function OwnerDashboard() {
  const [stats, setStats] = useState({});
  const [spots, setSpots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, spotsResponse] = await Promise.all([
        api.get('/owner/dashboard'),
        api.get('/owner/parking-spots'),
      ]);

      setStats(dashboardResponse.data);
      setSpots(spotsResponse.data.data || []);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteSpot = async (id) => {
    if (!window.confirm('Delete this parking spot?')) {
      return;
    }

    await api.delete(`/parking-spots/${id}`);
    setSpots((current) => current.filter((spot) => spot.id !== id));
  };

  return (
    <DashboardLayout
      title="Owner dashboard"
      eyebrow="Parking owner"
      actions={
        <Link className="btn btn-primary btn-md" to="/owner/spots/new">
          <PlusCircle size={18} />
          Add spot
        </Link>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="page-loader">Loading owner workspace...</div>
      ) : (
        <>
          <div className="stats-grid">
            {statsConfig.map(([key, label, Icon]) => (
              <Card className="stat-card" key={key}>
                <Icon size={22} />
                <span>{label}</span>
                <strong>{key === 'total_earnings' ? `${Number(stats[key] || 0).toFixed(2)} DH` : stats[key] || 0}</strong>
              </Card>
            ))}
          </div>

          <div className="content-header">
            <div>
              <h2>Your parking spots</h2>
              <p>Manage availability, pricing, photos, and listing status.</p>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <div className="parking-grid">
            {spots.map((spot) => (
              <ParkingCard key={spot.id} spot={spot} ownerMode onDelete={deleteSpot} />
            ))}
            {!spots.length && <Card className="empty-state">No parking spots yet.</Card>}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
