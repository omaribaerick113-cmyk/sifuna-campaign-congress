import campaignConfig from '../config/campaignConfig.js';

/**
 * Convert a phone number to the digits-only international format wa.me expects.
 *   0743929633      -> 254743929633
 *   +254 743 929633 -> 254743929633
 *   254743929633    -> 254743929633
 *   743929633       -> 254743929633
 * Returns '' when the number cannot be understood.
 */
export function toWhatsAppNumber(raw, defaultCountryCode = '254') {
  let digits = String(raw ?? '').replace(/[^\d+]/g, '');
  const hadPlus = digits.startsWith('+');
  digits = digits.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2); // 00254... style
  else if (!hadPlus && digits.startsWith('0')) digits = defaultCountryCode + digits.slice(1); // 07... / 01...
  else if (!hadPlus && !digits.startsWith(defaultCountryCode) && digits.length <= 9) digits = defaultCountryCode + digits; // 7...
  return /^\d{8,15}$/.test(digits) ? digits : '';
}

/** The campaign number in wa.me format, derived from campaignConfig. */
export function campaignWhatsAppNumber() {
  const { whatsappNumber, defaultCountryCode } = campaignConfig.contact;
  return toWhatsAppNumber(whatsappNumber, defaultCountryCode);
}

/** Build https://wa.me/<number>?text=<encoded>. Without a number, opens WhatsApp's contact picker (used for sharing). */
export function buildWhatsAppUrl(message = '', number = campaignWhatsAppNumber()) {
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const POSITION = `${campaignConfig.candidate.university} ${campaignConfig.candidate.faculty} Congress Representative`;

/** Prefilled messages. Edit wording here; every WhatsApp button reads from this list. */
export const whatsappMessages = {
  home: `Hello, I visited your ${POSITION} campaign website and would like to learn more about your campaign.`,
  about: `Hello, I read your campaign profile and would like to know more about your priorities.`,
  manifesto: 'Hello, I have reviewed your campaign manifestos and would like to share my thoughts.',
  registration: 'Hello, I have completed the campaign registration form and would like to connect with the campaign team.',
  contact: `Hello, I would like to contact the ${POSITION} campaign.`,
  volunteer: 'Hello, I am interested in volunteering and supporting campaign activities.',
  feedback: 'Hello, I have submitted feedback on the campaign website and would like to discuss it.',
  footer: `Hello, I would like to contact the ${POSITION} campaign.`,
};

export const whatsappUrlFor = (key) => buildWhatsAppUrl(whatsappMessages[key] ?? whatsappMessages.contact);

/** Text used by the "share on WhatsApp" buttons (no recipient: the user picks who gets it). */
export function manifestoShareUrl(manifesto) {
  const link = typeof window !== 'undefined' ? `${window.location.origin}/manifestos` : '';
  const text = `${campaignConfig.candidate.slogan}\n\nManifesto ${manifesto.id}: ${manifesto.title}\n${manifesto.text}\n\n${link}`;
  return buildWhatsAppUrl(text, '');
}

export function allManifestosShareUrl() {
  const link = typeof window !== 'undefined' ? `${window.location.origin}/manifestos` : '';
  const text = `${campaignConfig.candidate.slogan}\nRead the ${POSITION} campaign manifestos: ${link}`;
  return buildWhatsAppUrl(text, '');
}

export const mailtoUrl = (subject = '') =>
  `mailto:${campaignConfig.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** Human readable version of the number for display, e.g. "+254 743 929 633". */
export function displayWhatsAppNumber() {
  const n = campaignWhatsAppNumber();
  return n ? `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`.trim() : campaignConfig.contact.whatsappNumber;
}
