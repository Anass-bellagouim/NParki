import { LocateFixed, MapPin, Minus, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';

const TILE_SIZE = 256;
const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const lngToTile = (lng, zoom) => ((lng + 180) / 360) * 2 ** zoom;
const latToTile = (lat, zoom) => {
  const radians = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 2 ** zoom;
};
const tileToLng = (x, zoom) => (x / 2 ** zoom) * 360 - 180;
const tileToLat = (y, zoom) => {
  const value = Math.PI * (1 - (2 * y) / 2 ** zoom);
  return (Math.atan(Math.sinh(value)) * 180) / Math.PI;
};

export default function MapPicker({ latitude, longitude, address, city, onChange }) {
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(15);
  const [dimensions, setDimensions] = useState({ width: 720, height: 320 });
  const [geocoding, setGeocoding] = useState(false);
  const [message, setMessage] = useState('');

  const center = useMemo(() => ({
    lat: toNumber(latitude, DEFAULT_CENTER.lat),
    lng: toNumber(longitude, DEFAULT_CENTER.lng),
  }), [latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width || 720,
        height: entry.contentRect.height || 320,
      });
    });

    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const centerTile = useMemo(() => ({
    x: lngToTile(center.lng, zoom),
    y: latToTile(center.lat, zoom),
  }), [center.lat, center.lng, zoom]);

  const tiles = useMemo(() => {
    const list = [];
    const marginX = Math.ceil(dimensions.width / TILE_SIZE / 2) + 1;
    const marginY = Math.ceil(dimensions.height / TILE_SIZE / 2) + 1;
    const tileX = Math.floor(centerTile.x);
    const tileY = Math.floor(centerTile.y);
    const maxTile = 2 ** zoom;

    for (let x = tileX - marginX; x <= tileX + marginX; x += 1) {
      for (let y = tileY - marginY; y <= tileY + marginY; y += 1) {
        if (y < 0 || y >= maxTile) {
          continue;
        }

        const wrappedX = ((x % maxTile) + maxTile) % maxTile;
        list.push({
          key: `${zoom}-${x}-${y}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: (x - centerTile.x) * TILE_SIZE + dimensions.width / 2,
          top: (y - centerTile.y) * TILE_SIZE + dimensions.height / 2,
        });
      }
    }

    return list;
  }, [centerTile.x, centerTile.y, dimensions.height, dimensions.width, zoom]);

  const pickFromMap = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = centerTile.x + (event.clientX - rect.left - rect.width / 2) / TILE_SIZE;
    const y = centerTile.y + (event.clientY - rect.top - rect.height / 2) / TILE_SIZE;

    onChange({
      latitude: tileToLat(y, zoom).toFixed(7),
      longitude: tileToLng(x, zoom).toFixed(7),
    });
    setMessage('Pin moved to the selected map point.');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not available in this browser.');
      return;
    }

    setMessage('Detecting your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        });
        setMessage('Current location selected.');
      },
      () => setMessage('Could not read current location. Pick the point manually on the map.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const findAddress = async () => {
    const query = [address, city, 'Morocco'].filter(Boolean).join(', ');

    if (!query.trim()) {
      setMessage('Enter address and city first.');
      return;
    }

    setGeocoding(true);
    setMessage('');

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const results = await response.json();

      if (!results.length) {
        setMessage('No map result found. Click the exact point manually.');
        return;
      }

      onChange({
        latitude: Number(results[0].lat).toFixed(7),
        longitude: Number(results[0].lon).toFixed(7),
      });
      setMessage('Address found. Adjust the pin if needed.');
    } catch {
      setMessage('Could not search the address right now. Pick the point manually on the map.');
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="map-picker">
      <div className="map-toolbar">
        <Button type="button" variant="outline" size="sm" onClick={findAddress} disabled={geocoding}>
          <Search size={16} />
          {geocoding ? 'Searching...' : 'Find address'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation}>
          <LocateFixed size={16} />
          Use my location
        </Button>
        <div className="map-zoom">
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => clamp(value + 1, 3, 19))}>
            <Plus size={16} />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => clamp(value - 1, 3, 19))}>
            <Minus size={16} />
          </button>
        </div>
      </div>

      <button type="button" className="map-canvas" ref={mapRef} onClick={pickFromMap}>
        {tiles.map((tile) => (
          <img
            alt=""
            aria-hidden="true"
            draggable="false"
            key={tile.key}
            src={tile.url}
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
        <span className="map-center-pin">
          <MapPin size={34} fill="currentColor" />
        </span>
      </button>

      <div className="map-meta">
        <span>Lat {Number(center.lat).toFixed(7)}</span>
        <span>Lng {Number(center.lng).toFixed(7)}</span>
      </div>
      {message && <p className="map-message">{message}</p>}
    </div>
  );
}
