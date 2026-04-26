import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { CarFront, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isDashboard = location.pathname !== '/';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <CarFront size={22} />
          </span>
          <span>NParki</span>
        </Link>

        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {!isDashboard && (
            <>
              <a href="/#how">How it works</a>
              <a href="/#features">Features</a>
              <a href="/#benefits">Benefits</a>
            </>
          )}
          {isDashboard ? (
            user && (
              <>
                <NavLink to="/profile" className="nav-user">
                  <UserRound size={17} />
                  {user.name}
                </NavLink>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut size={17} />
                  Logout
                </Button>
              </>
            )
          ) : (
            <div className="nav-actions">
              <Link className="btn btn-ghost btn-md" to="/login">Login</Link>
              <Link className="btn btn-primary btn-md" to="/register">Sign up</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
