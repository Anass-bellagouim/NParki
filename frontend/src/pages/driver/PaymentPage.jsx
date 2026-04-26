import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import api, { getApiError } from '../../api/client.js';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    // Fetch booking to show price
    api.get(`/bookings`)
      .then(({ data }) => {
        const found = (data.data || []).find((b) => b.id === Number(id));
        if (found) setBooking(found);
        else setError('Booking not found');
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (e) => setCard((current) => ({ ...current, [e.target.name]: e.target.value }));

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate network delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await api.post(`/bookings/${id}/payment`, { payment_method: 'online' });
      navigate('/bookings');
    } catch (err) {
      setError(getApiError(err));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Checkout" eyebrow="Secure payment">
        <div className="page-loader">Loading checkout...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Checkout" eyebrow="Secure payment">
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="details-grid" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        <Card className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <CreditCard size={24} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Payment Method</h2>
          </div>
          
          <form className="form-stack" onSubmit={handlePay}>
            <Input 
              label="Cardholder Name" 
              name="name" 
              placeholder="e.g. John Doe" 
              value={card.name} 
              onChange={update} 
              required 
            />
            <Input 
              label="Card Number" 
              name="number" 
              placeholder="0000 0000 0000 0000" 
              value={card.number} 
              onChange={update} 
              maxLength="19"
              required 
            />
            
            <div className="form-grid two">
              <Input 
                label="Expiry Date" 
                name="expiry" 
                placeholder="MM/YY" 
                value={card.expiry} 
                onChange={update} 
                maxLength="5"
                required 
              />
              <Input 
                label="CVC" 
                name="cvc" 
                placeholder="123" 
                type="password"
                value={card.cvc} 
                onChange={update} 
                maxLength="4"
                required 
              />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" disabled={processing} style={{ width: '100%' }}>
                {processing ? 'Processing Payment...' : `Pay ${Number(booking?.total_price || 0).toFixed(2)} DH`}
              </Button>
            </div>
            
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '1rem' }}>
              <Lock size={14} /> Payments are secure and encrypted
            </p>
          </form>
        </Card>

        <section>
          <Card className="details-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-muted)' }}>
              <span>Parking Spot</span>
              <span>{booking?.parking_spot?.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-muted)' }}>
              <span>Car Plate</span>
              <span>{booking?.car?.plate_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-muted)' }}>
              <span>Duration</span>
              <span>{Math.floor((booking?.duration_minutes || 0) / 60)}h {(booking?.duration_minutes || 0) % 60}m</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '1.25rem' }}>
              <span>Total</span>
              <span>{Number(booking?.total_price || 0).toFixed(2)} DH</span>
            </div>
          </Card>
        </section>

      </div>
    </DashboardLayout>
  );
}
