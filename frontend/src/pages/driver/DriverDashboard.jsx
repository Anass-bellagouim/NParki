import { Link } from 'react-router-dom';
import { CalendarCheck, Car, Clock3, Search, SearchCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import api, { getApiError } from '../../api/client.js';

const statsConfig = [
  ['upcoming_bookings', 'Upcoming bookings', CalendarCheck],
  ['pending_bookings', 'Pending requests', Clock3],
  ['completed_bookings', 'Completed bookings', SearchCheck],
  ['cars', 'Cars saved', Car],
];

export default function DriverDashboard() {
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/driver/dashboard')
      .then(({ data }) => setStats(data))
      .catch((requestError) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title="Driver dashboard"
      eyebrow="Driver workspace"
      actions={
        <Link className="btn btn-primary btn-md" to="/search">
          <Search size={18} />
          Find parking
        </Link>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="page-loader">Loading driver workspace...</div>
      ) : (
        <>
          <div className="stats-grid">
            {statsConfig.map(([key, label, Icon]) => (
              <Card className="stat-card" key={key}>
                <Icon size={22} />
                <span>{label}</span>
                <strong>{stats[key] || 0}</strong>
              </Card>
            ))}
          </div>

          <section className="quick-panel">
            <div>
              <h2>Ready to reserve a spot?</h2>
              <p>Search by city, open exact directions, reserve a spot, then scan the gate QR when you arrive.</p>
            </div>
            <Link className="btn btn-outline btn-md" to="/cars">Manage cars</Link>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
