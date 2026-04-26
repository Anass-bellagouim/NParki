import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CalendarPlus, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import api, { getApiError } from '../../api/client.js';

export default function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [cars, setCars] = useState([]);
  const [booking, setBooking] = useState({
    car_id: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/parking-spots/${id}`), api.get('/cars')])
      .then(([spotResponse, carsResponse]) => {
        setSpot(spotResponse.data.data);
        const carList = carsResponse.data.data || [];
        setCars(carList);
        setBooking((current) => ({ ...current, car_id: carList[0]?.id || '' }));
      })
      .catch((requestError) => setError(getApiError(requestError)));
  }, [id]);

  const mapsLink = useMemo(() => {
    if (!spot) {
      return '#';
    }

    const query = spot.latitude && spot.longitude ? `${spot.latitude},${spot.longitude}` : `${spot.address}, ${spot.city}`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }, [spot]);

  const mapEmbed = useMemo(() => {
    if (!spot?.latitude || !spot?.longitude) {
      return '';
    }

    const lat = Number(spot.latitude);
    const lng = Number(spot.longitude);
    const delta = 0.006;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [spot]);

  const update = (event) => {
    setBooking((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/bookings', {
        ...booking,
        parking_spot_id: Number(id),
      });
      setMessage(data.message);
      // Auto redirect to bookings after 2.5 seconds so they can see the QR code
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Parking details" eyebrow="Reserve spot">
      {error && <div className="alert alert-error">{error}</div>}
      {message && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {message}
          <Link to="/bookings" className="btn btn-sm btn-outline">Go to my QR Code</Link>
        </div>
      )}

      {!spot ? (
        <div className="page-loader">Loading parking spot...</div>
      ) : (
        <div className="details-grid">
          <section>
            <div className="details-gallery">
              {spot.images?.length ? (
                spot.images.map((image) => <img src={image.url} alt={spot.title} key={image.id} />)
              ) : (
                <div className="details-placeholder">NParki</div>
              )}
            </div>

            <Card className="details-card">
              <div className="details-heading">
                <div>
                  <h2>{spot.title}</h2>
                  <p>
                    <MapPin size={17} />
                    {spot.address}, {spot.city}
                  </p>
                </div>
                <Badge>{spot.status}</Badge>
              </div>
              <p>{spot.description || 'No description provided.'}</p>
              <div className="details-meta">
                <span>{Number(spot.price_per_hour).toFixed(2)} DH/hour</span>
                {spot.price_per_day && <span>{Number(spot.price_per_day).toFixed(2)} DH/day</span>}
                {spot.available_from && <span>{spot.available_from} - {spot.available_to}</span>}
              </div>
              <div className="contact-row">
                <a className="btn btn-outline btn-sm" href={mapsLink} target="_blank" rel="noreferrer">
                  <Navigation size={16} />
                  Directions
                </a>
                {spot.owner?.email && (
                  <a className="btn btn-outline btn-sm" href={`mailto:${spot.owner.email}`}>
                    <Mail size={16} />
                    Email owner
                  </a>
                )}
                {spot.owner?.phone && (
                  <a className="btn btn-outline btn-sm" href={`tel:${spot.owner.phone}`}>
                    <Phone size={16} />
                    Call owner
                  </a>
                )}
              </div>
              {mapEmbed && (
                <iframe
                  className="details-map"
                  title={`${spot.title} exact map location`}
                  src={mapEmbed}
                  loading="lazy"
                />
              )}
            </Card>
          </section>

          <Card className="booking-form-card">
            <h2>Reserve this spot</h2>
            {!cars.length ? (
              <div className="empty-state compact">
                Add a car before booking.
                <Link className="btn btn-primary btn-sm" to="/cars">Add car</Link>
              </div>
            ) : (
              <form className="form-stack" onSubmit={submit}>
                <label className="field">
                  <span>Car</span>
                  <select name="car_id" value={booking.car_id} onChange={update} required>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} - {car.plate_number}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="booking-note">
                  You have 20 minutes to arrive and scan the gate QR. Billing starts only after the entry scan.
                </div>
                <Button type="submit" disabled={loading}>
                  <CalendarPlus size={18} />
                  {loading ? 'Reserving...' : 'Reserve parking'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
