/**
 * ============================================================================
 *  CAMPAIGN BACKEND  -  Google Apps Script (free)
 * ============================================================================
 *  Receives registrations and feedback from the website, validates them,
 *  saves them to a PRIVATE Google Sheet, and emails the campaign.
 *
 *  SETUP (full steps in google-apps-script/README.md):
 *   1. Create a Google Sheet, then Extensions > Apps Script.
 *   2. Paste this whole file, save.
 *   3. Run  setup  once (authorize), then Deploy > New deployment > Web app.
 *
 *  NO secrets live in this file. The campaign email is already public on the site.
 * ============================================================================
 */

var CONFIG = {
  // Leave '' when this script was created from the Sheet (Extensions > Apps Script).
  // Only fill in if the script is standalone: the long ID in the Sheet's URL.
  SPREADSHEET_ID: '',

  CAMPAIGN_EMAIL: 'casifunamike@gmail.com', // where notifications go
  CAMPAIGN_NAME: 'Faculty of Commerce Congress Representative Campaign',
  SEND_STUDENT_CONFIRMATION: true, // only sent when the student opted in AND gave an email

  REGISTRATION_SHEET: 'Registrations',
  FEEDBACK_SHEET: 'Feedback',

  // Abuse controls (simple, free, and honest: a public form can never be 100% spam-proof)
  MAX_REQUESTS_PER_MINUTE: 30, // across ALL visitors (Apps Script cannot see visitor IPs)
  DUPLICATE_WINDOW_SECONDS: 600, // identical content within 10 min is treated as a duplicate

  // Future: official WhatsApp Business Platform. NOT CONFIGURED. Leave false.
  WHATSAPP_AUTOMATION_ENABLED: false,
};

var YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate', 'Other'];
var CONTACT_METHODS = ['WhatsApp', 'Phone call', 'SMS', 'Email', 'Please do not contact me'];
var INTERESTS = ['Academic support', 'Career opportunities', 'Entrepreneurship', 'Student welfare', 'Events and networking', 'Communication', 'Volunteering', 'Sharing ideas'];
var REFERRALS = ['WhatsApp', 'Facebook', 'Instagram', 'TikTok', 'X', 'Telegram', 'YouTube', 'Friend', 'Poster', 'Class or lecture', 'Other'];
var CATEGORIES = ['Academic support', 'Career development', 'Student welfare', 'Communication', 'Entrepreneurship', 'Faculty engagement', 'Other concerns'];

var LIMITS = { name: 100, course: 100, phone: 20, email: 120, suggestions: 1000, feedback: 2000 };

var REG_HEADERS = ['Timestamp', 'Full name', 'Year of study', 'Course / specialization', 'Phone', 'Email', 'Preferred contact', 'Areas of interest', 'Heard about us via', 'Suggestions', 'Consent given', 'Confirmation email requested', 'Request ID', 'Content hash', 'Email notification'];
var FB_HEADERS = ['Timestamp', 'Name', 'Year of study', 'Topic', 'Feedback', 'Contact', 'Consent given', 'Request ID', 'Content hash', 'Email notification'];

/* ------------------------------------------------------------------------- */
/*  Web app entry points                                                      */
/* ------------------------------------------------------------------------- */

/** Health check: open the /exec URL in a browser to see this. It never returns any stored data. */
function doGet() {
  return json_({ ok: true, service: CONFIG.CAMPAIGN_NAME, status: 'Backend is running. Submissions are accepted via POST only.' });
}

function doPost(e) {
  try {
    var body = parseBody_(e);
    if (!body) return json_(fail_('BAD_REQUEST', 'We could not read that request.'));

    // Honeypot: bots fill the hidden field. Pretend success, save nothing.
    if (body.website) return json_({ ok: true, duplicate: false });

    if (!rateLimitOk_()) return json_(fail_('RATE_LIMITED', 'The form is receiving a lot of traffic right now. Please try again in a minute.'));

    if (body.type === 'registration') return json_(handleRegistration_(body));
    if (body.type === 'feedback') return json_(handleFeedback_(body));
    return json_(fail_('BAD_REQUEST', 'Unknown request type.'));
  } catch (err) {
    console.error('doPost failed: ' + (err && err.message)); // no personal data in logs
    return json_(fail_('SERVER_ERROR', 'Something went wrong on our side and your details were not saved. Please try again.'));
  }
}

/* ------------------------------------------------------------------------- */
/*  Registration                                                              */
/* ------------------------------------------------------------------------- */

function handleRegistration_(b) {
  var d = {
    requestId: str_(b.requestId, 64),
    fullName: str_(b.fullName, LIMITS.name + 50),
    year: str_(b.year, 30),
    course: str_(b.course, LIMITS.course + 50),
    phone: str_(b.phone, LIMITS.phone + 10),
    email: str_(b.email, LIMITS.email + 10).toLowerCase(),
    contactMethod: str_(b.contactMethod, 40),
    referral: str_(b.referral, 40),
    suggestions: str_(b.suggestions, LIMITS.suggestions + 200),
    consent: b.consent === true,
    sendConfirmation: b.sendConfirmation === true,
    interests: Array.isArray(b.interests) ? b.interests.slice(0, 12).map(function (x) { return str_(x, 40); }) : []
  };

  var errors = validateRegistration_(d);
  if (Object.keys(errors).length) return { ok: false, code: 'VALIDATION', message: 'Please check the highlighted fields.', fieldErrors: errors };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return fail_('BUSY', 'The server is busy. Please try again in a few seconds.');
  try {
    var sheet = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
    var hash = hash_([d.fullName.toLowerCase(), d.year, d.phone.replace(/\D/g, ''), d.email, d.suggestions].join('|'));

    // Idempotency: same request ID, or identical content recently => already saved, report success without duplicating.
    if (alreadySaved_(sheet, 13, d.requestId, 14, hash)) return { ok: true, duplicate: true };

    var now = new Date();
    sheet.appendRow([
      now, safe_(d.fullName), d.year, safe_(d.course), safeText_(d.phone), safe_(d.email), d.contactMethod,
      d.interests.filter(function (i) { return INTERESTS.indexOf(i) > -1; }).join(', '),
      d.referral, safe_(d.suggestions), 'Yes', d.sendConfirmation ? 'Yes' : 'No', d.requestId, hash, 'pending'
    ]);
    var row = sheet.getLastRow();
    SpreadsheetApp.flush();
    rememberRequest_(d.requestId, hash);

    // The record is saved. Everything below must NOT make the registration fail.
    var emailStatus = notifyRegistration_(d, now);
    sheet.getRange(row, REG_HEADERS.length).setValue(emailStatus);
    if (CONFIG.SEND_STUDENT_CONFIRMATION && d.sendConfirmation && d.email) sendStudentConfirmation_(d);
    notifyWhatsAppAutomation_('registration', d);

    return { ok: true, duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

function validateRegistration_(d) {
  var e = {};
  if (!d.fullName || d.fullName.length < 2) e.fullName = 'Please enter your full name.';
  else if (d.fullName.length > LIMITS.name) e.fullName = 'Name is too long.';
  if (YEARS.indexOf(d.year) === -1) e.year = 'Please choose your year of study.';
  if (d.course.length > LIMITS.course) e.course = 'Course is too long.';
  if (d.phone && !/^\+?[0-9][0-9\s-]{6,18}$/.test(d.phone)) e.phone = 'Enter a valid phone number.';
  if (d.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) || d.email.length > LIMITS.email)) e.email = 'Enter a valid email address.';
  if (d.contactMethod && CONTACT_METHODS.indexOf(d.contactMethod) === -1) e.contactMethod = 'Invalid choice.';
  if (d.referral && REFERRALS.indexOf(d.referral) === -1) e.referral = 'Invalid choice.';
  if (d.suggestions.length > LIMITS.suggestions) e.suggestions = 'Suggestions are too long.';
  if (!d.consent) e.consent = 'Consent is required.';
  if (!d.requestId) e.requestId = 'Missing request ID.';
  return e;
}

function notifyRegistration_(d, when) {
  try {
    var lines = ['A new student registered on the campaign website.', ''];
    addLine_(lines, 'Name', d.fullName);
    addLine_(lines, 'Year of study', d.year);
    addLine_(lines, 'Course / specialization', d.course);
    addLine_(lines, 'Phone', d.phone);
    addLine_(lines, 'Email', d.email);
    addLine_(lines, 'Preferred contact', d.contactMethod);
    addLine_(lines, 'Areas of interest', d.interests.join(', '));
    addLine_(lines, 'Heard about us via', d.referral);
    addLine_(lines, 'Suggestions', d.suggestions);
    addLine_(lines, 'Submitted', Utilities.formatDate(when, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss z'));
    lines.push('', 'This message contains personal information. Please do not forward it.');
    MailApp.sendEmail({ to: CONFIG.CAMPAIGN_EMAIL, subject: 'New Student Campaign Registration', body: lines.join('\n'), name: CONFIG.CAMPAIGN_NAME });
    return 'sent';
  } catch (err) {
    console.error('Registration notification email failed: ' + (err && err.message));
    return 'FAILED: ' + String(err && err.message).slice(0, 80);
  }
}

function sendStudentConfirmation_(d) {
  try {
    var first = d.fullName.split(' ')[0];
    var body = 'Hello ' + first + ',\n\nThank you for registering your support for the ' + CONFIG.CAMPAIGN_NAME + '. Your registration has been received.\n\n' +
      'You only hear from us in the way you chose on the form, and you can ask us to correct or delete your details at any time by replying to this email or writing to ' + CONFIG.CAMPAIGN_EMAIL + '.\n\n' +
      'Regards,\n' + CONFIG.CAMPAIGN_NAME;
    MailApp.sendEmail({ to: d.email, subject: 'We received your registration', body: body, name: CONFIG.CAMPAIGN_NAME, replyTo: CONFIG.CAMPAIGN_EMAIL });
  } catch (err) {
    console.error('Student confirmation email failed: ' + (err && err.message));
  }
}

/* ------------------------------------------------------------------------- */
/*  Feedback                                                                  */
/* ------------------------------------------------------------------------- */

function handleFeedback_(b) {
  var d = {
    requestId: str_(b.requestId, 64),
    name: str_(b.name, LIMITS.name + 50),
    year: str_(b.year, 30),
    category: str_(b.category, 40),
    message: str_(b.message, LIMITS.feedback + 200),
    contact: str_(b.contact, LIMITS.email + 10),
    consent: b.consent === true
  };
  var e = {};
  if (!d.message || d.message.length < 10) e.message = 'Please write a little more detail.';
  else if (d.message.length > LIMITS.feedback) e.message = 'Feedback is too long.';
  if (d.name.length > LIMITS.name) e.name = 'Name is too long.';
  if (d.year && YEARS.indexOf(d.year) === -1) e.year = 'Invalid choice.';
  if (d.category && CATEGORIES.indexOf(d.category) === -1) e.category = 'Invalid choice.';
  if (d.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.contact) && !/^\+?[0-9][0-9\s-]{6,18}$/.test(d.contact)) e.contact = 'Enter a valid email or phone number.';
  if ((d.name || d.contact) && !d.consent) e.consent = 'Consent is required when you give a name or contact.';
  if (!d.requestId) e.requestId = 'Missing request ID.';
  if (Object.keys(e).length) return { ok: false, code: 'VALIDATION', message: 'Please check the highlighted fields.', fieldErrors: e };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return fail_('BUSY', 'The server is busy. Please try again in a few seconds.');
  try {
    var sheet = getSheet_(CONFIG.FEEDBACK_SHEET, FB_HEADERS);
    var hash = hash_([d.name.toLowerCase(), d.contact, d.message].join('|'));
    if (alreadySaved_(sheet, 8, d.requestId, 9, hash)) return { ok: true, duplicate: true };

    var now = new Date();
    sheet.appendRow([now, safe_(d.name), d.year, d.category, safe_(d.message), safeText_(d.contact), d.consent ? 'Yes' : 'No', d.requestId, hash, 'pending']);
    var row = sheet.getLastRow();
    SpreadsheetApp.flush();
    rememberRequest_(d.requestId, hash);

    var status = 'sent';
    try {
      var lines = ['New feedback from the campaign website.', ''];
      addLine_(lines, 'Topic', d.category);
      addLine_(lines, 'From', d.name);
      addLine_(lines, 'Year of study', d.year);
      addLine_(lines, 'Contact', d.contact);
      lines.push('', 'Feedback:', d.message, '', 'Submitted: ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss z'));
      MailApp.sendEmail({ to: CONFIG.CAMPAIGN_EMAIL, subject: 'New Student Feedback' + (d.category ? ' - ' + d.category : ''), body: lines.join('\n'), name: CONFIG.CAMPAIGN_NAME });
    } catch (err) {
      console.error('Feedback notification email failed: ' + (err && err.message));
      status = 'FAILED: ' + String(err && err.message).slice(0, 80);
    }
    sheet.getRange(row, FB_HEADERS.length).setValue(status);
    notifyWhatsAppAutomation_('feedback', d);
    return { ok: true, duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------------- */
/*  Future WhatsApp automation hook - NOT CONFIGURED                          */
/* ------------------------------------------------------------------------- */

/**
 * Placeholder only. Automatic WhatsApp messages to the campaign owner need the official
 * WhatsApp Business Platform (or an authorized provider), approved templates and credentials
 * stored in Script Properties. None of that exists yet, so this does nothing while
 * CONFIG.WHATSAPP_AUTOMATION_ENABLED is false. See the project README, section "WhatsApp automation".
 */
function notifyWhatsAppAutomation_(kind, data) {
  if (!CONFIG.WHATSAPP_AUTOMATION_ENABLED) return;
  console.warn('WhatsApp automation is enabled in CONFIG but no provider code has been added. NOT CONFIGURED.');
}

/* ------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* ------------------------------------------------------------------------- */

/** Run this once from the editor: creates the tabs and triggers the Gmail/Sheets permission prompt. */
function setup() {
  getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
  getSheet_(CONFIG.FEEDBACK_SHEET, FB_HEADERS);
  MailApp.getRemainingDailyQuota(); // forces the email permission prompt
  console.log('Setup complete. Emails remaining today: ' + MailApp.getRemainingDailyQuota());
}

/** Optional: sends a test email to the campaign address so you can confirm notifications work. */
function testEmail() {
  MailApp.sendEmail(CONFIG.CAMPAIGN_EMAIL, 'Campaign backend test email', 'If you can read this, email notifications are authorized and working.');
}

function getSpreadsheet_() {
  return CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0a1a3a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** True when this request ID or identical content was saved already (cache first, then the sheet). */
function alreadySaved_(sheet, idCol, requestId, hashCol, hash) {
  var cache = CacheService.getScriptCache();
  if (cache.get('rid:' + requestId) || cache.get('h:' + hash)) return true;
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var from = Math.max(2, last - 499); // look at the most recent 500 rows
  var ids = sheet.getRange(from, idCol, last - from + 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === requestId) return true;
  var hashes = sheet.getRange(from, hashCol, last - from + 1, 1).getValues();
  var times = sheet.getRange(from, 1, last - from + 1, 1).getValues();
  var cutoff = Date.now() - CONFIG.DUPLICATE_WINDOW_SECONDS * 1000;
  for (var j = 0; j < hashes.length; j++) {
    if (hashes[j][0] === hash && times[j][0] instanceof Date && times[j][0].getTime() > cutoff) return true;
  }
  return false;
}

function rememberRequest_(requestId, hash) {
  var cache = CacheService.getScriptCache();
  cache.put('rid:' + requestId, '1', 21600);
  cache.put('h:' + hash, '1', CONFIG.DUPLICATE_WINDOW_SECONDS);
}

function rateLimitOk_() {
  var cache = CacheService.getScriptCache();
  var key = 'rate:' + Math.floor(Date.now() / 60000);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return true; // fail open rather than block real students
  try {
    var count = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(count), 120);
    return count <= CONFIG.MAX_REQUESTS_PER_MINUTE;
  } finally {
    lock.releaseLock();
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  if (e.postData.contents.length > 20000) return null; // reject oversized requests
  try {
    var obj = JSON.parse(e.postData.contents);
    return obj && typeof obj === 'object' ? obj : null;
  } catch (err) {
    return null;
  }
}

/** Trim, drop control characters, cap length. */
function str_(v, max) {
  var s = (v === null || v === undefined) ? '' : String(v);
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  return s.length > max ? s.slice(0, max) : s;
}

/** Stops spreadsheet formula injection: a cell starting with = + - @ would be executed as a formula. */
function safe_(v) {
  var s = String(v === null || v === undefined ? '' : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/** For phone numbers: keep a leading + but store as text so Sheets does not mangle it. */
function safeText_(v) {
  var s = String(v === null || v === undefined ? '' : v);
  return s ? "'" + s : '';
}

function hash_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('').slice(0, 24);
}

function addLine_(lines, label, value) {
  if (value) lines.push(label + ': ' + value); // skip fields the student did not provide
}

function fail_(code, message) {
  return { ok: false, code: code, message: message };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
