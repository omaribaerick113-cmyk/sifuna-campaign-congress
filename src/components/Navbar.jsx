import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Me' },
  { to: '/manifestos', label: 'Manifestos' },
  { to: '/register', label: 'Register' },
  { to: '/team', label: 'Campaign Team', feature: 'campaignTeamPage' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const visible = links.filter((l) => !l.feature || campaignConfig.features[l.feature]);

  return (
    <header className={`navbar ${scrolled || open ? 'is-solid' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label={`${campaignConfig.candidate.shortName} - home`}>
          <img src="/favicon.svg" alt="" width="36" height="36" />
          <span className="brand-text">
            <strong>{campaignConfig.candidate.shortName}</strong>
            <small>{campaignConfig.candidate.faculty}</small>
          </span>
        </Link>

        <nav id="primary-nav" className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {visible.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/register" className="btn btn-gold nav-cta">JOIN THE CAMPAIGN</Link>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
