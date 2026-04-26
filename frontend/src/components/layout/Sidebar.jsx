import { NavLink } from 'react-router-dom';
import {
  CalendarCheck,
  Car,
  LayoutDashboard,
  MapPinned,
  PlusCircle,
  Search,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar() {
  const { user } = useAuth();

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/owner/spots/new', label: 'Add spot', icon: PlusCircle },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/profile', label: 'Profile', icon: UserCog },
  ];

  const driverLinks = [
    { to: '/driver/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/search', label: 'Find parking', icon: Search },
    { to: '/bookings', label: 'My bookings', icon: CalendarCheck },
    { to: '/cars', label: 'My cars', icon: Car },
    { to: '/profile', label: 'Profile', icon: UserCog },
  ];

  const links = user?.role === 'owner' ? ownerLinks : driverLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <MapPinned size={20} />
        <span>{user?.role === 'owner' ? 'Owner workspace' : 'Driver workspace'}</span>
      </div>
      <nav>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
