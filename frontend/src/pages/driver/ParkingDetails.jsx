import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarPlus, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import api, { getApiError } from '../../api/client.js';

const nowInputValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset() + 60);
  return date.toISOString().slice(0, 16);
};

export default function ParkingDetails() {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);
  const [cars, setCars] = useState([]);
  const [booking, setBooking] = useState({
    car_id: '',
    start_time: nowInputValue(),
    end_time: '',
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

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.address}, ${spot.city}`)}`;
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
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Parking details" eyebrow="Reserve spot">
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

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
            </Card>
          </section>

          <Card className="booking-form-card">
            <h2>Book this spot</h2>
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
                <Input label="Start time" type="datetime-local" name="start_time" value={booking.start_time} onChange={update} required />
                <Input label="End time" type="datetime-local" name="end_time" value={booking.end_time} onChange={update} required />
                <Button type="submit" disabled={loading}>
                  <CalendarPlus size={18} />
                  {loading ? 'Booking...' : 'Book parking'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
