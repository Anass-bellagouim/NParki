import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const defaults = {
  title: '',
  description: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  price_per_hour: '',
  price_per_day: '',
  available_from: '',
  available_to: '',
  is_available: true,
  approval_mode: false,
  status: 'active',
};

export default function ParkingSpotForm({ initialValues = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ ...defaults, ...initialValues });
  const [images, setImages] = useState([]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value ?? '');
    });

    images.forEach((image) => payload.append('images[]', image));
    onSubmit(payload);
  };

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="form-grid two">
        <Input label="Parking title" name="title" value={form.title} onChange={update} required />
        <Input label="City" name="city" value={form.city} onChange={update} required />
        <Input label="Address" name="address" value={form.address} onChange={update} required />
        <Input label="Price per hour" name="price_per_hour" type="number" min="0" step="0.01" value={form.price_per_hour} onChange={update} required />
        <Input label="Price per day" name="price_per_day" type="number" min="0" step="0.01" value={form.price_per_day || ''} onChange={update} />
        <Input label="Latitude" name="latitude" type="number" step="0.0000001" value={form.latitude || ''} onChange={update} />
        <Input label="Longitude" name="longitude" type="number" step="0.0000001" value={form.longitude || ''} onChange={update} />
        <Input label="Available from" name="available_from" type="time" value={form.available_from || ''} onChange={update} />
        <Input label="Available to" name="available_to" type="time" value={form.available_to || ''} onChange={update} />
        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={update}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea name="description" rows="5" value={form.description || ''} onChange={update} />
      </label>

      <div className="toggle-row">
        <label>
          <input type="checkbox" name="is_available" checked={Boolean(form.is_available)} onChange={update} />
          Available for booking
        </label>
        <label>
          <input type="checkbox" name="approval_mode" checked={Boolean(form.approval_mode)} onChange={update} />
          Require owner approval
        </label>
      </div>

      <label className="field">
        <span>Parking images</span>
        <input type="file" accept="image/*" multiple onChange={(event) => setImages(Array.from(event.target.files || []))} />
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save parking spot'}
      </Button>
    </form>
  );
}
