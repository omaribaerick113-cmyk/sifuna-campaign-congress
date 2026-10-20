import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ListChecks, MessagesSquare } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import Hero from '../components/Hero.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ManifestoCard, { iconMap } from '../components/ManifestoCard.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function Home() {
  const c = campaignConfig;
  useEffect(() => {
    document.title = `${c.candidate.position} Campaign | ${c.candidate.university}`;
  }, [c]);

  return (
    <>
      <Hero />

      <section className="section" aria-labelledby="priorities-title">
        <div className="container">
          <SectionHeading eyebrow="What the campaign stands for" title="Campaign priorities">
            Six priorities that shape everything in the manifesto.
          </SectionHeading>
          <h2 id="priorities-title" className="sr-only">Campaign priorities</h2>
          <div className="grid grid-3">
            {c.priorities.map((p, i) => {
              const Icon = iconMap[p.icon];
              return (
                <Reveal key={p.title} delay={i * 60}>
                  <article className="card priority-card">
                    <span className="icon-badge" aria-hidden="true">{Icon && <Icon size={24} />}</span>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container split">
          <Reveal className="split-media">
            <img src={c.images.about} alt={c.images.aboutAlt} width="760" height="1015" loading="lazy" decoding="async" />
          </Reveal>
          <Reveal className="split-copy" delay={80}>
            <p className="eyebrow">Why join the campaign?</p>
            <h2>Your ideas shape the priorities</h2>
            <p className="lead">
              Registering is voluntary. When you join, you can receive campaign updates, share constructive ideas, and tell us what matters most to you as a
              Commerce student. We cannot promise outcomes - we promise to listen, advocate responsibly, and report back.
            </p>
            <ul className="tick-list">
              <li><ShieldCheck size={20} aria-hidden="true" /> You choose what to share. Only your name and year are required.</li>
              <li><ListChecks size={20} aria-hidden="true" /> Your priorities help decide what the campaign pushes for.</li>
              <li><MessagesSquare size={20} aria-hidden="true" /> Opt in to updates, or just show your support.</li>
            </ul>
            <div className="btn-row">
              <Link to="/register" className="btn btn-gold">JOIN THE CAMPAIGN <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link to="/about" className="btn btn-ghost">About me</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="preview-title">
        <div className="container">
          <SectionHeading eyebrow="The manifesto" title="A few of the twenty commitments">
            Campaign commitments and advocacy priorities - not guaranteed results.
          </SectionHeading>
          <h2 id="preview-title" className="sr-only">Manifesto preview</h2>
          <div className="grid grid-3">
            {c.manifestos.slice(0, 3).map((m, i) => (
              <Reveal key={m.id} delay={i * 60}><ManifestoCard manifesto={m} compact /></Reveal>
            ))}
          </div>
          <div className="btn-row center mt">
            <Link to="/manifestos" className="btn btn-navy">See all 20 manifestos <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <h2>{c.candidate.slogan}</h2>
          <p>Register your support, read the manifestos, or talk to the campaign directly.</p>
          <div className="btn-row center">
            <Link to="/register" className="btn btn-gold">REGISTER YOUR SUPPORT</Link>
            <Link to="/manifestos" className="btn btn-outline-light">READ THE MANIFESTOS</Link>
            <Link to="/contact" className="btn btn-outline-light">CONTACT THE CANDIDATE</Link>
            <WhatsAppButton messageKey="home" />
          </div>
        </div>
      </section>
    </>
  );
}
