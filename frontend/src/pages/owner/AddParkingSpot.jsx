import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import ParkingSpotForm from '../../components/parking/ParkingSpotForm.jsx';
import api, { getApiError } from '../../api/client.js';

export default function AddParkingSpot() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (payload) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/parking-spots', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/owner/dashboard');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add parking spot" eyebrow="Owner listing">
      <Card className="form-card">
        {error && <div className="alert alert-error">{error}</div>}
        <ParkingSpotForm onSubmit={submit} loading={loading} />
      </Card>
    </DashboardLayout>
  );
}
