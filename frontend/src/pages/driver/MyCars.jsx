import { useEffect, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import api, { getApiError } from '../../api/client.js';

const blankCar = { brand: '', model: '', plate_number: '', color: '' };

export default function MyCars() {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState(blankCar);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/cars')
      .then(({ data }) => setCars(data.data || []))
      .catch((requestError) => setError(getApiError(requestError)));
  };

  useEffect(() => {
    load();
  }, []);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/cars', form);
      setForm(blankCar);
      setModalOpen(false);
      load();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const remove = async (id) => {
    await api.delete(`/cars/${id}`);
    setCars((current) => current.filter((car) => car.id !== id));
  };

  return (
    <DashboardLayout
      title="My cars"
      eyebrow="Driver profile"
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle size={18} />
          Add car
        </Button>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      <div className="cards-grid">
        {cars.map((car) => (
          <Card className="car-card" key={car.id}>
            <div>
              <h3>{car.brand} {car.model}</h3>
              <p>{car.plate_number}</p>
              {car.color && <span>{car.color}</span>}
            </div>
            <Button variant="danger" size="icon" onClick={() => remove(car.id)} aria-label="Delete car">
              <Trash2 size={17} />
            </Button>
          </Card>
        ))}
        {!cars.length && <Card className="empty-state">No cars saved yet.</Card>}
      </div>

      <Modal open={modalOpen} title="Add car" onClose={() => setModalOpen(false)}>
        <form className="form-stack" onSubmit={submit}>
          <Input label="Brand" name="brand" value={form.brand} onChange={update} required />
          <Input label="Model" name="model" value={form.model} onChange={update} required />
          <Input label="Plate number" name="plate_number" value={form.plate_number} onChange={update} required />
          <Input label="Color" name="color" value={form.color} onChange={update} />
          <Button type="submit">Save car</Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
