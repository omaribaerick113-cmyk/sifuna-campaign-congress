import campaignConfig from '../config/campaignConfig.js';

/** Renders only socials that have a real https URL in campaignConfig. Renders nothing otherwise. */
export function activeSocials() {
  return campaignConfig.socials.filter((s) => /^https:\/\//i.test(s.url));
}

export default function SocialLinks({ className = '' }) {
  const list = activeSocials();
  if (!list.length) return null;
  return (
    <ul className={`social-links ${className}`} aria-label="Campaign social media">
      {list.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${campaignConfig.candidate.shortName} on ${s.label} (opens in a new tab)`}>
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
