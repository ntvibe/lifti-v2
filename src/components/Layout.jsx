import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/plans', label: 'Plans' },
  { to: '/library', label: 'Library' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' }
];

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Lifti</h1>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
