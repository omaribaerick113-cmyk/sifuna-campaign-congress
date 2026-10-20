import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import FormField from './FormField.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';
import { validateRegistration, clean, LIMITS } from '../services/validation.js';
import { submitRegistration, newRequestId } from '../services/googleSheetsService.js';
import { getReferral } from '../services/referral.js';
import { mailtoUrl } from '../services/whatsappService.js';

const blank = () => ({
  fullName: '', year: '', course: '', phone: '', email: '', contactMethod: '',
  interests: [], referral: getReferral(), suggestions: '', consent: false, sendConfirmation: false,
  website: '', // honeypot: real people never fill this in
});

export default function RegistrationForm() {
  const f = campaignConfig.forms;
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState(null);
  const [result, setResult] = useState(null);
  const requestId = useRef(newRequestId());
  const busy = useRef(false);

  const set = (name) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: undefined }));
  };
  const toggleInterest = (item) => (e) =>
    setValues((s) => ({ ...s, interests: e.target.checked ? [...s.interests, item] : s.interests.filter((i) => i !== item) }));

  async function onSubmit(e) {
    e.preventDefault();
    if (busy.current) return; // blocks double taps before React re-renders
    const found = validateRegistration(values, { years: f.years });
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('error');
      setServerError(null);
      requestAnimationFrame(() => document.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus());
      return;
    }
    busy.current = true;
    setStatus('submitting');
    setServerError(null);

    const res = await submitRegistration({
      requestId: requestId.current,
      fullName: clean(values.fullName),
      year: values.year,
      course: clean(values.course),
      phone: clean(values.phone),
      email: clean(values.email),
      contactMethod: values.contactMethod,
      interests: values.interests,
      referral: values.referral,
      suggestions: clean(values.suggestions),
      consent: values.consent,
      sendConfirmation: values.sendConfirmation && !!clean(values.email),
      website: values.website,
    });
    busy.current = false;

    if (res.ok) {
      setResult({ name: clean(values.fullName), duplicate: res.duplicate });
      setStatus('success');
      requestId.current = newRequestId(); // a future registration is a new request
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setServerError(res);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="card success-panel" role="status" aria-live="polite">
        <CheckCircle2 size={56} className="success-icon" aria-hidden="true" />
        <h2>Thank you, {result.name.split(' ')[0]}!</h2>
        <p>
          {result.duplicate
            ? 'We already had this registration, so nothing was duplicated. You are all set.'
            : 'Your registration was saved. Thank you for supporting the campaign.'}
        </p>
        <p className="muted">
          Want to talk directly? WhatsApp opens a chat with the campaign number - you still need to press <strong>Send</strong> in WhatsApp.
          Your registration does not depend on this step.
        </p>
        <div className="btn-row center">
          <WhatsAppButton messageKey="registration">CONTINUE ON WHATSAPP</WhatsAppButton>
          <Link to="/manifestos" className="btn btn-ghost">Read the manifestos</Link>
          <Link to="/feedback" className="btn btn-ghost">Share an idea</Link>
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';
  return (
    <form className="card form-card" onSubmit={onSubmit} noValidate aria-labelledby="reg-title">
      <h2 id="reg-title">JOIN THE CAMPAIGN</h2>
      <p className="lead">Register voluntarily to express your support, share your ideas, and choose whether you would like to receive campaign updates.</p>

      {serverError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <strong>Not saved.</strong> {serverError.message}
            {serverError.code === 'NOT_CONFIGURED' && (
              <p className="alert-extra">Email <a href={mailtoUrl('Campaign registration')}>{campaignConfig.contact.email}</a> or use the WhatsApp button below.</p>
            )}
          </div>
        </div>
      )}
      {status === 'error' && !serverError && Object.values(errors).some(Boolean) && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>Please fix the highlighted fields and submit again.</div>
        </div>
      )}

      <div className="form-grid">
        <FormField id="fullName" label="Full name" required error={errors.fullName}>
          {(p) => <input {...p} type="text" autoComplete="name" maxLength={LIMITS.name} value={values.fullName} onChange={set('fullName')} />}
        </FormField>

        <FormField id="year" label="Year of study" required error={errors.year}>
          {(p) => (
            <select {...p} value={values.year} onChange={set('year')}>
              <option value="">Select year</option>
              {f.years.map((y) => <option key={y}>{y}</option>)}
            </select>
          )}
        </FormField>

        <FormField id="course" label="Course or specialization" error={errors.course}>
          {(p) => <input {...p} type="text" maxLength={LIMITS.course} placeholder="e.g. Accounting, Finance, Marketing" value={values.course} onChange={set('course')} />}
        </FormField>

        <FormField id="contactMethod" label="Preferred contact method">
          {(p) => (
            <select {...p} value={values.contactMethod} onChange={set('contactMethod')}>
              <option value="">No preference</option>
              {f.contactMethods.map((m) => <option key={m}>{m}</option>)}
            </select>
          )}
        </FormField>

        <FormField id="phone" label="Phone number" hint="Only if you want to be reached by phone, SMS or WhatsApp." error={errors.phone}>
          {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder="0712 345 678" value={values.phone} onChange={set('phone')} />}
        </FormField>

        <FormField id="email" label="Email address" error={errors.email}>
          {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email} placeholder="you@example.com" value={values.email} onChange={set('email')} />}
        </FormField>
      </div>

      <fieldset className="field">
        <legend>Areas of interest <span className="opt">(optional - pick any)</span></legend>
        <div className="chip-grid">
          {f.interests.map((item) => (
            <label key={item} className={`chip ${values.interests.includes(item) ? 'is-on' : ''}`}>
              <input type="checkbox" checked={values.interests.includes(item)} onChange={toggleInterest(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-grid">
        <FormField id="referral" label="How did you hear about the campaign?">
          {(p) => (
            <select {...p} value={values.referral} onChange={set('referral')}>
              <option value="">Select one</option>
              {f.referralSources.map((r) => <option key={r}>{r}</option>)}
            </select>
          )}
        </FormField>
      </div>

      <FormField id="suggestions" label="Suggestions or ideas" error={errors.suggestions} counter={`${values.suggestions.length}/${LIMITS.suggestions}`}>
        {(p) => <textarea {...p} rows={4} maxLength={LIMITS.suggestions + 200} value={values.suggestions} onChange={set('suggestions')} placeholder="What should the Faculty of Commerce Congress Representative focus on?" />}
      </FormField>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label>Leave this field empty<input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
      </div>

      <div className={`field consent ${errors.consent ? 'has-error' : ''}`}>
        <label className="check">
          <input type="checkbox" checked={values.consent} onChange={set('consent')} aria-required="true" aria-invalid={errors.consent ? 'true' : undefined} aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>
            I voluntarily give the details above to the campaign for campaign communication and engagement, and I have read the{' '}
            <Link to="/privacy" target="_blank">privacy notice</Link>. <span className="req" aria-hidden="true">*</span>
          </span>
        </label>
        {errors.consent && <p className="error-text" id="consent-error" role="alert">{errors.consent}</p>}

        <label className="check">
          <input type="checkbox" checked={values.sendConfirmation} onChange={set('sendConfirmation')} />
          <span>Email me a short confirmation (needs your email address). <span className="opt">(optional)</span></span>
        </label>
      </div>

      <button type="submit" className="btn btn-gold btn-lg btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? (<><Loader2 className="spin" size={20} aria-hidden="true" /> Saving your registration...</>) : 'SUBMIT REGISTRATION'}
      </button>
      <p className="fine-print">Your details are stored privately and are not shown publicly. Registration is not anonymous.</p>
    </form>
  );
}
