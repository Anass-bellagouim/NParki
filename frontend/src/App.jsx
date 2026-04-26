import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import DriverDashboard from './pages/driver/DriverDashboard.jsx';
import AddParkingSpot from './pages/owner/AddParkingSpot.jsx';
import EditParkingSpot from './pages/owner/EditParkingSpot.jsx';
import SearchParking from './pages/driver/SearchParking.jsx';
import ParkingDetails from './pages/driver/ParkingDetails.jsx';
import MyBookings from './pages/shared/MyBookings.jsx';
import MyCars from './pages/driver/MyCars.jsx';
import Profile from './pages/shared/Profile.jsx';

function RoleRedirect() {
  const { user, booting } = useAuth();

  if (booting) {
    return <div className="page-loader">Loading NParki...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/driver/dashboard'} replace />;
}

function ProtectedRoute({ children, roles }) {
  const { user, booting } = useAuth();

  if (booting) {
    return <div className="page-loader">Loading NParki...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute roles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/spots/new"
        element={
          <ProtectedRoute roles={['owner']}>
            <AddParkingSpot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/spots/:id/edit"
        element={
          <ProtectedRoute roles={['owner']}>
            <EditParkingSpot />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute roles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute roles={['driver']}>
            <SearchParking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parking/:id"
        element={
          <ProtectedRoute roles={['driver']}>
            <ParkingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cars"
        element={
          <ProtectedRoute roles={['driver']}>
            <MyCars />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute roles={['owner', 'driver']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['owner', 'driver']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
