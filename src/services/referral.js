import campaignConfig from '../config/campaignConfig.js';

const KEY = 'campaign_ref';

/** Map ?ref= values (lowercase) to the labels used in the form. Unknown values are ignored. */
const REF_MAP = {
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X',
  twitter: 'X',
  telegram: 'Telegram',
  youtube: 'YouTube',
  friend: 'Friend',
  poster: 'Poster',
  class: 'Class or lecture',
};

/** Reads ?ref=... once, validates it against a fixed allow-list, and remembers it for this browser tab only. */
export function captureReferral() {
  try {
    const raw = new URLSearchParams(window.location.search).get('ref');
    if (!raw) return;
    const label = REF_MAP[raw.toLowerCase().slice(0, 30)];
    if (label && campaignConfig.forms.referralSources.includes(label)) sessionStorage.setItem(KEY, label);
  } catch {
    /* storage can be blocked; referral tracking is optional */
  }
}

export function getReferral() {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}
