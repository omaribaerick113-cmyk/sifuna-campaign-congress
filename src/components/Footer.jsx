import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import { whatsappUrlFor, mailtoUrl, displayWhatsAppNumber } from '../services/whatsappService.js';
import SocialLinks from './SocialLinks.jsx';

export default function Footer() {
  const c = campaignConfig;
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">{c.candidate.name}</p>
          <p className="muted-light">{c.candidate.position}<br />{c.candidate.university}</p>
          <p className="footer-slogan">{c.candidate.slogan}</p>
          <SocialLinks />
        </div>

        <nav aria-label="Footer">
          <p className="footer-heading">Explore</p>
          <ul className="footer-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/manifestos">Manifestos</Link></li>
            <li><Link to="/register">Registration</Link></li>
            <li><Link to="/feedback">Feedback</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy notice</Link></li>
          </ul>
        </nav>

        <div>
          <p className="footer-heading">Reach the campaign</p>
          <ul className="footer-list">
            <li>
              <a href={whatsappUrlFor('footer')} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp {displayWhatsAppNumber()}
              </a>
            </li>
            <li>
              <a href={mailtoUrl()}>
                <Mail size={16} aria-hidden="true" /> {c.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-legal">
        <p>
          <strong>Independent student campaign website.</strong> This is not an official {c.candidate.university} website and is not endorsed by the
          University. The University's name is used only to describe the office being contested.
        </p>
        <p>&copy; {new Date().getFullYear()} {c.candidate.name} Campaign. Campaign commitments are priorities to advocate for, not guaranteed results.</p>
      </div>
    </footer>
  );
}
