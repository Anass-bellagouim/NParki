import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPinned,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const steps = [
  ['Create your account', 'Choose driver or parking owner and complete your profile.'],
  ['Search or publish', 'Drivers search by city and price. Owners publish spots with photos and availability.'],
  ['Book with confidence', 'Manage requests, cars, reservations, directions, and booking history in one place.'],
];

const features = [
  { icon: MapPinned, title: 'Location-first search', text: 'Find parking by city, address, price, and availability.' },
  { icon: CalendarCheck, title: 'Booking workflow', text: 'Approval mode, accepted bookings, cancellations, and history.' },
  { icon: ShieldCheck, title: 'Role protection', text: 'Separate secure experiences for owners and drivers.' },
  { icon: CreditCard, title: 'Clear pricing', text: 'Hourly and daily prices are visible before the driver books.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const targetPath = user ? '/dashboard' : '/register';

  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Shared parking platform</span>
              <h1>Book trusted parking spots, or earn from the spaces you already own.</h1>
              <p>
                NParki connects drivers with private parking owners through fast search,
                clean booking tools, role-based dashboards, and professional reservation management.
              </p>
              <div className="hero-actions">
                {user ? (
                  <>
                    <Link className="btn btn-primary btn-lg" to="/dashboard">
                      Find Parking
                      <ArrowRight size={18} />
                    </Link>
                    <Link className="btn btn-outline btn-lg" to="/dashboard">
                      List Your Parking
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-primary btn-lg" to="/register">
                      Get Started
                      <ArrowRight size={18} />
                    </Link>
                    <Link className="btn btn-outline btn-lg" to="/login">
                      Login to Search
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="hero-product" aria-label="NParki dashboard preview">
              <div className="product-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="product-map">
                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-pin pin-one"><CarFront size={18} /></div>
                <div className="map-pin pin-two"><MapPinned size={18} /></div>
                <div className="booking-float">
                  <div>
                    <strong>Maarif secure garage</strong>
                    <span>12 DH/hour - Available now</span>
                  </div>
                  <button type="button">Book</button>
                </div>
              </div>
              <div className="product-stats">
                <div><strong>48</strong><span>active spots</span></div>
                <div><strong>132</strong><span>bookings</span></div>
                <div><strong>4.9</strong><span>rating</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">How it works</span>
              <h2>Simple flows for both sides of the parking market.</h2>
            </div>
            <div className="steps-grid">
              {steps.map(([title, text], index) => (
                <article className="step-card" key={title}>
                  <span>{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section muted-section" id="features">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Features</span>
              <h2>Everything needed for a serious shared parking app.</h2>
            </div>
            <div className="features-grid">
              {features.map(({ icon: Icon, title, text }) => (
                <article className="feature-card" key={title}>
                  <Icon size={24} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="benefits">
          <div className="container benefits-grid">
            <article>
              <span className="eyebrow">For parking owners</span>
              <h2>Turn unused parking into managed income.</h2>
              <ul className="check-list">
                <li><CheckCircle2 size={18} /> Publish spots with photos, address, pricing, and time windows.</li>
                <li><CheckCircle2 size={18} /> Accept or reject booking requests when approval mode is enabled.</li>
                <li><CheckCircle2 size={18} /> Track earnings, active bookings, and previous reservations.</li>
              </ul>
            </article>
            <article>
              <span className="eyebrow">For drivers</span>
              <h2>Find a place before you arrive.</h2>
              <ul className="check-list">
                <li><Star size={18} /> Search by city, location, price, and availability.</li>
                <li><Clock size={18} /> Reserve by date, time, and duration.</li>
                <li><MapPinned size={18} /> Open Google Maps directions and contact the owner.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-card">
            <div>
              <span className="eyebrow">Start with the right account</span>
              <h2>Join as a driver or owner and get the dashboard built for your role.</h2>
            </div>
            {user ? (
              <Link className="btn btn-primary btn-lg" to="/dashboard">
                Go to your dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link className="btn btn-primary btn-lg" to="/register">
                Create your account
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
