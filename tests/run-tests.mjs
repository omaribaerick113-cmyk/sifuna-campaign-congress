/**
 * Zero-dependency checks. Run with:  npm test
 * Covers: WhatsApp number/URL building, form validation, config sanity,
 * and the Google Apps Script backend logic (run against an in-memory fake of Sheets/Mail).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import config from '../src/config/campaignConfig.js';
import { toWhatsAppNumber, buildWhatsAppUrl, campaignWhatsAppNumber, whatsappMessages, mailtoUrl } from '../src/services/whatsappService.js';
import { validateRegistration, validateFeedback } from '../src/services/validation.js';

const here = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('  ok  ' + name); };

console.log('WhatsApp + email links');
test('0743929633 -> 254743929633', () => assert.equal(toWhatsAppNumber('0743929633'), '254743929633'));
test('+254 743 929 633 -> 254743929633', () => assert.equal(toWhatsAppNumber('+254 743 929 633'), '254743929633'));
test('254743929633 unchanged', () => assert.equal(toWhatsAppNumber('254743929633'), '254743929633'));
test('743929633 -> 254743929633', () => assert.equal(toWhatsAppNumber('743929633'), '254743929633'));
test('garbage -> empty', () => assert.equal(toWhatsAppNumber('abc'), ''));
test('config number is digits only', () => assert.match(campaignWhatsAppNumber(), /^254743929633$/));
test('wa.me url encodes message', () => {
  const url = buildWhatsAppUrl('Hello & welcome? 100%');
  assert.equal(url, 'https://wa.me/254743929633?text=Hello%20%26%20welcome%3F%20100%25');
});
test('share url has no number', () => assert.ok(buildWhatsAppUrl('hi', '').startsWith('https://wa.me/?text=')));
test('every message builds a valid url', () => {
  for (const k of Object.keys(whatsappMessages)) assert.match(buildWhatsAppUrl(whatsappMessages[k]), /^https:\/\/wa\.me\/254743929633\?text=[^\s]+$/);
});
test('mailto uses config email', () => assert.equal(mailtoUrl(), 'mailto:casifunamike@gmail.com'));

console.log('Config');
test('20 manifestos with unique ids, titles and text', () => {
  assert.equal(config.manifestos.length, 20);
  assert.equal(new Set(config.manifestos.map((m) => m.id)).size, 20);
  config.manifestos.forEach((m) => assert.ok(m.title && m.text && m.icon));
});
test('no social link is active without a real URL', () => config.socials.forEach((s) => assert.ok(s.url === '' || s.url.startsWith('https://'))));
test('manifesto icons all exist in the icon map source', () => {
  const src = fs.readFileSync(path.join(here, '../src/components/ManifestoCard.jsx'), 'utf8');
  [...config.manifestos, ...config.priorities].forEach((m) => assert.ok(new RegExp(`\\b${m.icon}:`).test(src), `missing icon ${m.icon}`));
});

console.log('Validation (client)');
const ok = { fullName: 'Jane Wanjiru', year: 'Year 2', consent: true };
test('minimal valid registration passes', () => assert.deepEqual(validateRegistration(ok, { years: config.forms.years }), {}));
test('name, year and consent are required', () => {
  const e = validateRegistration({}, { years: config.forms.years });
  assert.ok(e.fullName && e.year && e.consent);
});
test('bad email/phone rejected', () => {
  const e = validateRegistration({ ...ok, email: 'nope', phone: '12' }, {});
  assert.ok(e.email && e.phone);
});
test('contact method needs matching detail', () => assert.ok(validateRegistration({ ...ok, contactMethod: 'Email' }, {}).email));
test('feedback requires message; consent only with identity', () => {
  assert.ok(validateFeedback({}, {}).message);
  assert.deepEqual(validateFeedback({ message: 'Please improve revision timetables.' }, {}), {});
  assert.ok(validateFeedback({ message: 'Please improve revision timetables.', name: 'A' }, {}).consent);
});

console.log('Apps Script backend (fake Google services)');
function makeBackend(opts = {}) {
  const sheets = {};
  const mails = [];
  const cacheStore = new Map();
  const mkSheet = (name) => {
    const rows = [];
    const sheet = {
      rows,
      getLastRow: () => rows.length,
      appendRow: (r) => rows.push([...r]),
      getRange: (r, c, nr = 1, nc = 1) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
        setValue: (v) => { rows[r - 1][c - 1] = v; },
        setFontWeight() { return this; }, setBackground() { return this; }, setFontColor() { return this; },
      }),
      setFrozenRows() {},
    };
    sheets[name] = sheet;
    return sheet;
  };
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => mkSheet(n) }),
      flush() {},
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cacheStore.get(k) ?? null, put: (k, v) => cacheStore.set(k, v) }) },
    MailApp: {
      sendEmail: (a, s, b) => {
        if (opts.mailFails) throw new Error('Service invoked too many times');
        mails.push(typeof a === 'object' ? a : { to: a, subject: s, body: b });
      },
      getRemainingDailyQuota: () => 100,
    },
    Session: { getScriptTimeZone: () => 'Africa/Nairobi' },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_alg, s) => [...crypto.createHash('sha256').update(s).digest()].map((b) => (b > 127 ? b - 256 : b)),
      formatDate: (d) => d.toISOString(),
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ t, setMimeType() { return this; }, getContent: () => t }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(here, '../google-apps-script/Code.gs'), 'utf8'), sandbox);
  const post = (obj) => JSON.parse(sandbox.doPost({ postData: { contents: JSON.stringify(obj) } }).getContent());
  return { post, sheets, mails, sandbox };
}
const reg = (o = {}) => ({ type: 'registration', requestId: 'req-' + Math.random(), fullName: 'Jane Wanjiru', year: 'Year 2', consent: true, ...o });

test('valid registration is saved, then emailed to the campaign', () => {
  const b = makeBackend();
  const r = b.post(reg({ email: 'jane@example.com', phone: '0712345678', interests: ['Career opportunities'], referral: 'WhatsApp' }));
  assert.equal(r.ok, true);
  assert.equal(b.sheets.Registrations.rows.length, 2); // header + 1
  assert.equal(b.mails.length, 1);
  assert.equal(b.mails[0].to, 'casifunamike@gmail.com');
  assert.equal(b.mails[0].subject, 'New Student Campaign Registration');
  assert.ok(!/Course/.test(b.mails[0].body), 'missing optional fields are omitted');
  assert.equal(b.sheets.Registrations.rows[1].at(-1), 'sent');
});
test('same request ID twice saves only once', () => {
  const b = makeBackend();
  const body = reg();
  assert.equal(b.post(body).duplicate, false);
  assert.equal(b.post(body).duplicate, true);
  assert.equal(b.sheets.Registrations.rows.length, 2);
  assert.equal(b.mails.length, 1);
});
test('two different students with the same name both save', () => {
  const b = makeBackend();
  b.post(reg({ phone: '0711111111' }));
  b.post(reg({ phone: '0722222222' }));
  assert.equal(b.sheets.Registrations.rows.length, 3);
});
test('server-side validation rejects bad data and saves nothing', () => {
  const b = makeBackend();
  const r = b.post(reg({ consent: false, year: 'Year 9', email: 'x' }));
  assert.equal(r.ok, false);
  assert.ok(r.fieldErrors.consent && r.fieldErrors.year && r.fieldErrors.email);
  assert.ok(!b.sheets.Registrations || b.sheets.Registrations.rows.length === 0);
});
test('email failure keeps the saved registration and still returns ok', () => {
  const b = makeBackend({ mailFails: true });
  const r = b.post(reg());
  assert.equal(r.ok, true);
  assert.equal(b.sheets.Registrations.rows.length, 2);
  assert.match(b.sheets.Registrations.rows[1].at(-1), /^FAILED/);
});
test('spreadsheet formula injection is neutralised', () => {
  const b = makeBackend();
  b.post(reg({ fullName: '=HYPERLINK("http://evil","x")', suggestions: '+cmd' }));
  const row = b.sheets.Registrations.rows[1];
  assert.ok(row[1].startsWith("'="));
  assert.ok(row[9].startsWith("'+"));
});
test('honeypot submissions are dropped silently', () => {
  const b = makeBackend();
  assert.equal(b.post(reg({ website: 'http://spam' })).ok, true);
  assert.ok(!b.sheets.Registrations);
});
test('over-long and malformed requests are rejected', () => {
  const b = makeBackend();
  assert.equal(b.sandbox.doPost({ postData: { contents: 'not json' } }).getContent().includes('BAD_REQUEST'), true);
  assert.equal(b.post({ type: 'nope' }).ok, false);
});
test('rate limit trips after the configured number of requests', () => {
  const b = makeBackend();
  let limited = false;
  for (let i = 0; i < 40; i++) if (b.post(reg({ phone: '07' + String(10000000 + i) })).code === 'RATE_LIMITED') limited = true;
  assert.ok(limited);
});
test('student confirmation only when opted in with an email', () => {
  const b = makeBackend();
  b.post(reg({ email: 'a@b.co', sendConfirmation: true }));
  assert.equal(b.mails.length, 2);
  assert.equal(b.mails[1].to, 'a@b.co');
  const c = makeBackend();
  c.post(reg({ email: 'a@b.co', sendConfirmation: false }));
  assert.equal(c.mails.length, 1);
});
test('feedback saves to its own tab and validates', () => {
  const b = makeBackend();
  assert.equal(b.post({ type: 'feedback', requestId: 'f1', message: 'short' }).ok, false);
  const r = b.post({ type: 'feedback', requestId: 'f2', message: 'Please share revision timetables earlier.', category: 'Academic support' });
  assert.equal(r.ok, true);
  assert.equal(b.sheets.Feedback.rows.length, 2);
  assert.ok(!b.sheets.Registrations);
});

console.log(`\nAll ${passed} checks passed.`);
