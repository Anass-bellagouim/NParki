import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import api, { getApiError } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    password: '',
    password_confirmation: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      const { data } = await api.put('/profile', payload);
      updateUser(data.user);
      setMessage(data.message);
      setForm((current) => ({ ...current, password: '', password_confirmation: '' }));
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Profile" eyebrow={user.role === 'owner' ? 'Owner account' : 'Driver account'}>
      <Card className="form-card">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form-stack" onSubmit={submit}>
          <div className="form-grid two">
            <Input label="Name" name="name" value={form.name} onChange={update} required />
            <Input label="Phone" name="phone" value={form.phone} onChange={update} />
            <Input label="Email" name="email" type="email" value={form.email} onChange={update} required />
            <Input label="New password" name="password" type="password" value={form.password} onChange={update} />
            <Input
              label="Confirm new password"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={update}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
