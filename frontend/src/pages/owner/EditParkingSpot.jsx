import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import ParkingSpotForm from '../../components/parking/ParkingSpotForm.jsx';
import api, { getApiError } from '../../api/client.js';

export default function EditParkingSpot() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/parking-spots/${id}`)
      .then(({ data }) => setSpot(data.data))
      .catch((requestError) => setError(getApiError(requestError)));
  }, [id]);

  const submit = async (payload) => {
    payload.append('_method', 'PUT');
    setError('');
    setLoading(true);

    try {
      await api.post(`/parking-spots/${id}`, payload, {
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
    <DashboardLayout title="Edit parking spot" eyebrow="Owner listing">
      <Card className="form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {!spot ? <div className="page-loader">Loading listing...</div> : <ParkingSpotForm initialValues={spot} onSubmit={submit} loading={loading} />}
      </Card>
    </DashboardLayout>
  );
}
