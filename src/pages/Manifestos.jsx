import { Link } from 'react-router-dom';
import { Download, Share2 } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import PageHeader from '../components/PageHeader.jsx';
import ManifestoCard from '../components/ManifestoCard.jsx';
import Reveal from '../components/Reveal.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { allManifestosShareUrl } from '../services/whatsappService.js';

export default function Manifestos() {
  const c = campaignConfig;
  return (
    <>
      <PageHeader eyebrow="The manifesto" title="Twenty campaign commitments">
        These are priorities I will advocate for responsibly - not guaranteed results.
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="toolbar" role="group" aria-label="Manifesto actions">
            {c.features.manifestoPdf && (
              <a className="btn btn-navy" href="/manifesto.pdf" download="Campaign-Manifesto.pdf">
                <Download size={18} aria-hidden="true" /> DOWNLOAD MANIFESTO (PDF)
              </a>
            )}
            <a className="btn btn-ghost" href={allManifestosShareUrl()} target="_blank" rel="noopener noreferrer">
              <Share2 size={18} aria-hidden="true" /> Share on WhatsApp
            </a>
            <WhatsAppButton messageKey="manifesto">Discuss the manifestos</WhatsAppButton>
          </div>

          <div className="grid grid-3">
            {c.manifestos.map((m, i) => (
              <Reveal key={m.id} delay={(i % 3) * 60}><ManifestoCard manifesto={m} /></Reveal>
            ))}
          </div>

          <div className="end-cta">
            <h2>Ready to be part of it?</h2>
            <p>Join the campaign and tell us which of these matter most to you.</p>
            <Link to="/register" className="btn btn-gold btn-lg">JOIN THE CAMPAIGN</Link>
          </div>
        </div>
      </section>
    </>
  );
}
