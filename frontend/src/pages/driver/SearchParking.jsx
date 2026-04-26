import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import ParkingCard from '../../components/parking/ParkingCard.jsx';
import Card from '../../components/ui/Card.jsx';
import api, { getApiError } from '../../api/client.js';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when spots change
function MapRecenter({ spots }) {
  const map = useMap();
  useEffect(() => {
    if (spots.length > 0) {
      const validSpots = spots.filter(s => s.latitude && s.longitude);
      if (validSpots.length > 0) {
        const bounds = L.latLngBounds(validSpots.map(s => [s.latitude, s.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [spots, map]);
  return null;
}

export default function SearchParking() {
  const [filters, setFilters] = useState({ city: '', location: '', max_price: '' });
  const [spots, setSpots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default center (Casablanca coords as fallback)
  const defaultCenter = [33.5731, -7.5898];

  const update = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/parking-spots', { params: { ...filters, per_page: 100 } });
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

      <div className="search-layout">
        <div className="map-container">
          <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter spots={spots} />
            {spots.filter(spot => spot.latitude && spot.longitude).map((spot) => (
              <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
                <Popup>
                  <div style={{ padding: '0.5rem', minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{spot.title}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>{spot.address}</p>
                    <strong style={{ display: 'block', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{Number(spot.price_per_hour).toFixed(2)} DH / hour</strong>
                    <a href={`/parking/${spot.id}`} className="btn btn-primary btn-sm" style={{ display: 'block', textAlign: 'center', width: '100%', textDecoration: 'none', color: '#ffffff' }}>View & Book</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="parking-list-scrollable">
          {spots.slice(0, 3).map((spot) => (
            <ParkingCard key={spot.id} spot={spot} />
          ))}
          {!loading && !spots.length && <Card className="empty-state">No available parking spots match your search.</Card>}
        </div>
      </div>
    </DashboardLayout>
  );
}
