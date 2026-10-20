import { Link } from 'react-router-dom';
import { Target, Compass } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import PageHeader from '../components/PageHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function About() {
  const c = campaignConfig;
  return (
    <>
      <PageHeader eyebrow="About me" title={c.candidate.name}>
        {c.candidate.position} &middot; {c.candidate.university}
      </PageHeader>

      <section className="section">
        <div className="container split">
          <Reveal className="split-media tall">
            <img src={c.images.about} alt={c.images.aboutAlt} width="760" height="1015" decoding="async" />
          </Reveal>
          <Reveal className="split-copy" delay={80}>
            <p className="eyebrow">Meet your candidate</p>
            <h2>{c.candidate.course}</h2>
            <p className="lead">{c.candidate.intro}</p>

            <dl className="facts">
              <div><dt>University</dt><dd>{c.candidate.university}</dd></div>
              <div><dt>Faculty</dt><dd>{c.candidate.faculty}</dd></div>
              <div><dt>Course</dt><dd>{c.candidate.course}</dd></div>
              <div><dt>Campaign position</dt><dd>{c.candidate.position}</dd></div>
              {c.candidate.facts.map((f) => (<div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>))}
            </dl>

            <div className="btn-row">
              <WhatsAppButton messageKey="about">CHAT ON WHATSAPP</WhatsAppButton>
              <Link to="/register" className="btn btn-gold">JOIN THE CAMPAIGN</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container grid grid-2">
          <Reveal><article className="card vm-card"><span className="icon-badge" aria-hidden="true"><Compass size={24} /></span><h3>Vision</h3><p>{c.candidate.vision}</p></article></Reveal>
          <Reveal delay={80}><article className="card vm-card"><span className="icon-badge" aria-hidden="true"><Target size={24} /></span><h3>Mission</h3><p>{c.candidate.mission}</p></article></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="How I will lead" title="Leadership values" />
          <div className="grid grid-4">
            {c.candidate.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}><article className="card value-card"><h3>{v.title}</h3><p>{v.text}</p></article></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHeading eyebrow="Focus areas" title="Campaign priorities" />
          <ul className="priority-chips">
            {c.priorities.map((p) => <li key={p.title}>{p.title}</li>)}
          </ul>
          <div className="btn-row center mt">
            <Link to="/manifestos" className="btn btn-navy">Read all 20 manifestos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
