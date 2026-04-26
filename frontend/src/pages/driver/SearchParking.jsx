import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import ParkingCard from '../../components/parking/ParkingCard.jsx';
import Card from '../../components/ui/Card.jsx';
import api, { getApiError } from '../../api/client.js';

export default function SearchParking() {
  const [filters, setFilters] = useState({ city: '', location: '', max_price: '' });
  const [spots, setSpots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/parking-spots', { params: filters });
      setSpots(data.data || []);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, []);

  return (
    <DashboardLayout title="Find parking" eyebrow="Search">
      <Card className="search-panel">
        <form className="search-form" onSubmit={search}>
          <Input label="City" name="city" value={filters.city} onChange={update} placeholder="Casablanca" />
          <Input label="Location" name="location" value={filters.location} onChange={update} placeholder="Maarif, Gauthier..." />
          <Input label="Max hourly price" name="max_price" type="number" min="0" value={filters.max_price} onChange={update} />
          <Button type="submit" disabled={loading}>
            <Search size={18} />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Card>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="parking-grid">
        {spots.map((spot) => (
          <ParkingCard key={spot.id} spot={spot} />
        ))}
        {!loading && !spots.length && <Card className="empty-state">No available parking spots match your search.</Card>}
      </div>
    </DashboardLayout>
  );
}
