import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function DashboardLayout({ title, eyebrow, actions, children }) {
  return (
    <>
      <Navbar />
      <main className="dashboard-shell">
        <Sidebar />
        <section className="dashboard-main">
          <div className="dashboard-header">
            <div>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <h1>{title}</h1>
            </div>
            {actions && <div className="dashboard-actions">{actions}</div>}
          </div>
          {children}
        </section>
      </main>
    </>
  );
}
