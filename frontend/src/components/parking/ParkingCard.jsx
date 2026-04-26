import { Link } from 'react-router-dom';
import { Edit, MapPin, Navigation, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

const mapQuery = (spot) => (
  spot.latitude && spot.longitude
    ? `${spot.latitude},${spot.longitude}`
    : `${spot.address}, ${spot.city}`
);

export default function ParkingCard({ spot, ownerMode = false, onDelete }) {
  const image = spot.images?.[0]?.url;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(spot))}`;

  return (
    <article className="parking-card">
      <div className="parking-media">
        {image ? <img src={image} alt={spot.title} /> : <div className="parking-placeholder">NParki</div>}
        <Badge>{spot.status || (spot.is_available ? 'active' : 'paused')}</Badge>
      </div>
      <div className="parking-body">
        <div>
          <h3>{spot.title}</h3>
          <p>
            <MapPin size={16} />
            {spot.address}, {spot.city}
          </p>
        </div>
        <div className="parking-meta">
          <strong>{Number(spot.price_per_hour).toFixed(2)} DH/h</strong>
          {spot.price_per_day && <span>{Number(spot.price_per_day).toFixed(2)} DH/day</span>}
        </div>
        <div className="parking-actions">
          {ownerMode ? (
            <>
              <Link className="btn btn-outline btn-sm" to={`/owner/spots/${spot.id}/edit`}>
                <Edit size={16} />
                Edit
              </Link>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(spot.id)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Link className="btn btn-primary btn-sm" to={`/parking/${spot.id}`}>View details</Link>
              <a className="btn btn-outline btn-sm" href={mapsLink} target="_blank" rel="noreferrer">
                <Navigation size={16} />
                Directions
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
