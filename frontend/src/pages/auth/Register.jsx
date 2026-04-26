import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getApiError } from '../../api/client.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  role: 'driver',
};

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = await register(form);
      navigate(currentUser.role === 'owner' ? '/owner/dashboard' : '/driver/dashboard');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-card wide">
          <span className="eyebrow">Create account</span>
          <h1>Choose how you will use NParki</h1>
          <p>Your account type controls the dashboard, routes, and tools available after login.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} className="form-stack">
            <div className="role-select">
              <label className={form.role === 'driver' ? 'selected' : ''}>
                <input type="radio" name="role" value="driver" checked={form.role === 'driver'} onChange={update} />
                <strong>Driver / Customer</strong>
                <span>Search and book available parking spots.</span>
              </label>
              <label className={form.role === 'owner' ? 'selected' : ''}>
                <input type="radio" name="role" value="owner" checked={form.role === 'owner'} onChange={update} />
                <strong>Parking Owner</strong>
                <span>Publish spots and manage reservations.</span>
              </label>
            </div>

            <div className="form-grid two">
              <Input label="Full name" name="name" value={form.name} onChange={update} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={update} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={update} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={update} required />
              <Input
                label="Confirm password"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={update}
                required
              />
            </div>

            <Button type="submit" className="full-width" disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
