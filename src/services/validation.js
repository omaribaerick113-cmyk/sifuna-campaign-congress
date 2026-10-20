/**
 * Client-side validation. The Google Apps Script backend repeats these checks
 * (never trust the browser), so keep the limits below in sync with Code.gs.
 */
export const LIMITS = {
  name: 100,
  course: 100,
  phone: 20,
  email: 120,
  suggestions: 1000,
  feedback: 2000,
  short: 60,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,18}$/;

export const clean = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();

export function isValidEmail(v) {
  return EMAIL_RE.test(v);
}
export function isValidPhone(v) {
  return PHONE_RE.test(v) && v.replace(/\D/g, '').length >= 9 && v.replace(/\D/g, '').length <= 15;
}

export function validateRegistration(values, allowed) {
  const e = {};
  const name = clean(values.fullName);
  if (!name) e.fullName = 'Please enter your full name.';
  else if (name.length < 2) e.fullName = 'Name looks too short.';
  else if (name.length > LIMITS.name) e.fullName = `Please keep your name under ${LIMITS.name} characters.`;

  if (!clean(values.year)) e.year = 'Please select your year of study.';
  else if (allowed?.years && !allowed.years.includes(values.year)) e.year = 'Please choose one of the listed options.';

  if (clean(values.course).length > LIMITS.course) e.course = `Keep this under ${LIMITS.course} characters.`;

  const phone = clean(values.phone);
  if (phone && !isValidPhone(phone)) e.phone = 'Enter a valid phone number, e.g. 0712345678.';

  const email = clean(values.email);
  if (email && !isValidEmail(email)) e.email = 'Enter a valid email address.';
  else if (email.length > LIMITS.email) e.email = 'Email is too long.';

  const method = clean(values.contactMethod);
  if (method === 'Email' && !email) e.email = 'Add your email address, or choose another contact method.';
  if (['WhatsApp', 'Phone call', 'SMS'].includes(method) && !phone) e.phone = `Add your phone number, or choose another contact method.`;

  if (clean(values.suggestions).length > LIMITS.suggestions) e.suggestions = `Please keep this under ${LIMITS.suggestions} characters.`;
  if (values.sendConfirmation && !email) e.email = 'Add your email address to receive a confirmation email.';
  if (!values.consent) e.consent = 'Please tick the consent box to continue.';
  return e;
}

export function validateFeedback(values, allowed) {
  const e = {};
  const msg = clean(values.message);
  if (!msg) e.message = 'Please write your feedback or suggestion.';
  else if (msg.length < 10) e.message = 'Please add a little more detail (at least 10 characters).';
  else if (msg.length > LIMITS.feedback) e.message = `Please keep this under ${LIMITS.feedback} characters.`;

  if (clean(values.name).length > LIMITS.name) e.name = `Keep this under ${LIMITS.name} characters.`;
  if (clean(values.category) && allowed?.categories && !allowed.categories.includes(values.category)) e.category = 'Choose one of the listed topics.';

  const contact = clean(values.contact);
  if (contact && !isValidEmail(contact) && !isValidPhone(contact)) e.contact = 'Enter a valid email address or phone number, or leave it blank.';

  const identifying = clean(values.name) || contact;
  if (identifying && !values.consent) e.consent = 'Please tick the box so we can store the details you gave.';
  return e;
}
