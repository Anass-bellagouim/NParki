import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getApiError } from '../../api/client.js';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const currentUser = await login(form);
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
        <section className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h1>Login to NParki</h1>
          <p>Access your protected dashboard and continue managing your parking activity.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit} className="form-stack">
            <Input label="Email" name="email" type="email" value={form.email} onChange={update} required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={update} required />
            <Button type="submit" className="full-width" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <p className="auth-switch">
            New to NParki? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
