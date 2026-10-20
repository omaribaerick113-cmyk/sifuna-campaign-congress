import { Link } from 'react-router-dom';
import { Mail, MessageCircle, UserPlus, Lightbulb } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import { mailtoUrl, whatsappUrlFor, displayWhatsAppNumber } from '../services/whatsappService.js';
import SocialLinks from './SocialLinks.jsx';

export default function ContactSection() {
  const c = campaignConfig.contact;
  return (
    <div className="contact-grid">
      <article className="card contact-card">
        <span className="icon-badge" aria-hidden="true"><Mail size={24} /></span>
        <h3>Email</h3>
        <p><a href={mailtoUrl('Hello from a Commerce student')}>{c.email}</a></p>
        <a className="btn btn-gold" href={mailtoUrl('Hello from a Commerce student')}>EMAIL THE CAMPAIGN</a>
      </article>

      <article className="card contact-card">
        <span className="icon-badge wa" aria-hidden="true"><MessageCircle size={24} /></span>
        <h3>WhatsApp</h3>
        <p><a href={whatsappUrlFor('contact')} target="_blank" rel="noopener noreferrer">{displayWhatsAppNumber()}</a></p>
        <a className="btn btn-whatsapp" href={whatsappUrlFor('contact')} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" /> CHAT ON WHATSAPP
        </a>
      </article>

      <article className="card contact-card">
        <span className="icon-badge" aria-hidden="true"><UserPlus size={24} /></span>
        <h3>Join the campaign</h3>
        <p>Register your support and choose how you would like to hear from us.</p>
        <Link className="btn btn-navy" to="/register">REGISTER YOUR SUPPORT</Link>
      </article>

      <article className="card contact-card">
        <span className="icon-badge" aria-hidden="true"><Lightbulb size={24} /></span>
        <h3>Share your ideas</h3>
        <p>Tell us what the Faculty of Commerce needs. Constructive suggestions are welcome.</p>
        <Link className="btn btn-navy" to="/feedback">SHARE YOUR IDEAS</Link>
      </article>

      <div className="contact-social"><SocialLinks /></div>
    </div>
  );
}
