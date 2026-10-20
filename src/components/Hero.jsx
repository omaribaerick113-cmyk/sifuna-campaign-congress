import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import WhatsAppButton from './WhatsAppButton.jsx';

export default function Hero() {
  const c = campaignConfig;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="pill"><BadgeCheck size={16} aria-hidden="true" /> {c.candidate.university} &middot; {c.candidate.faculty}</p>
          <h1 id="hero-title">
            <span className="hero-name">{c.candidate.name}</span>
            <span className="hero-role">{c.candidate.position}</span>
          </h1>
          <p className="hero-slogan">{c.candidate.slogan}</p>
          <p className="hero-intro">{c.candidate.intro}</p>

          <div className="btn-row">
            <Link to="/manifestos" className="btn btn-gold">READ MY MANIFESTOS <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link to="/register" className="btn btn-outline-light">REGISTER YOUR SUPPORT</Link>
            <WhatsAppButton messageKey="home">CHAT ON WHATSAPP</WhatsAppButton>
          </div>
          <p className="hero-note">Independent student campaign. Not an official university website.</p>
        </div>

        <div className="hero-photo">
          <div className="photo-frame">
            <img src={c.images.hero} alt={c.images.heroAlt} width="900" height="1075" fetchpriority="high" decoding="async" />
          </div>
          <div className="float-card float-a" aria-hidden="true">
            <strong>20</strong><span>campaign priorities</span>
          </div>
          <div className="float-card float-b" aria-hidden="true">
            <strong>{c.candidate.faculty.replace('Faculty of ', '')}</strong><span>students first</span>
          </div>
        </div>
      </div>
    </section>
  );
}
