import { HeartHandshake } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import PageHeader from '../components/PageHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function Team() {
  const members = campaignConfig.team.members;
  return (
    <>
      <PageHeader eyebrow="Campaign team" title="People behind the campaign">
        A campaign is a team effort.
      </PageHeader>
      <section className="section">
        <div className="container">
          {members.length > 0 && (
            <div className="grid grid-3">
              {members.map((m, i) => (
                <Reveal key={m.name} delay={i * 60}>
                  <article className="card team-card">
                    {m.photo && <img src={m.photo} alt={`${m.name}`} loading="lazy" width="300" height="300" />}
                    <h3>{m.name}</h3>
                    <p className="role">{m.role}</p>
                    {m.bio && <p>{m.bio}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="card invite-card">
            <span className="icon-badge" aria-hidden="true"><HeartHandshake size={26} /></span>
            <h2>{members.length ? 'Want to help too?' : 'Join the campaign team'}</h2>
            <p>
              Volunteers help spread the word, organise events and gather ideas from fellow Commerce students. If you would like to help, send a message
              and the campaign will reply.
            </p>
            <WhatsAppButton messageKey="volunteer">VOLUNTEER ON WHATSAPP</WhatsAppButton>
          </div>
        </div>
      </section>
    </>
  );
}
