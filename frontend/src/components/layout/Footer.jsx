import { CarFront } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">
              <CarFront size={22} />
            </span>
            <span>NParki</span>
          </div>
          <p>Shared parking for owners with unused spots and drivers who need reliable places to park.</p>
        </div>
        <div>
          <h3>Platform</h3>
          <a href="/#how">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#benefits">Benefits</a>
        </div>
        <div>
          <h3>Support</h3>
          <a href="mailto:support@nparki.local">support@nparki.local</a>
          <a href="/login">Login</a>
          <a href="/register">Create account</a>
        </div>
      </div>
    </footer>
  );
}
