import {
  Users, CalendarCheck, Eye, BookOpen, Megaphone, Briefcase, Building2, Lightbulb, PiggyBank, HeartHandshake,
  Handshake, Smartphone, MessageSquareText, Network, Store, Scale, Info, Link2, ClipboardList, DoorOpen,
} from 'lucide-react';
import { Share2 } from 'lucide-react';
import { manifestoShareUrl } from '../services/whatsappService.js';

export const iconMap = {
  users: Users, calendar: CalendarCheck, eye: Eye, book: BookOpen, megaphone: Megaphone, briefcase: Briefcase,
  building: Building2, lightbulb: Lightbulb, piggy: PiggyBank, heart: HeartHandshake, handshake: Handshake,
  phone: Smartphone, message: MessageSquareText, network: Network, store: Store, scale: Scale, info: Info,
  link: Link2, clipboard: ClipboardList, door: DoorOpen,
};

export default function ManifestoCard({ manifesto, compact = false }) {
  const Icon = iconMap[manifesto.icon] || Info;
  return (
    <article className="card manifesto-card">
      <div className="manifesto-top">
        <span className="icon-badge" aria-hidden="true"><Icon size={24} /></span>
        <span className="manifesto-num" aria-label={`Manifesto ${manifesto.id}`}>{String(manifesto.id).padStart(2, '0')}</span>
      </div>
      <h3>{manifesto.title}</h3>
      <p>{manifesto.text}</p>
      {!compact && (
        <a
          className="card-link"
          href={manifestoShareUrl(manifesto)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share manifesto ${manifesto.id} on WhatsApp`}
        >
          <Share2 size={16} aria-hidden="true" /> Share on WhatsApp
        </a>
      )}
    </article>
  );
}
