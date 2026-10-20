import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import campaignConfig from '../config/campaignConfig.js';
import FormField from './FormField.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';
import { validateFeedback, clean, LIMITS } from '../services/validation.js';
import { submitFeedback, newRequestId } from '../services/googleSheetsService.js';
import { mailtoUrl } from '../services/whatsappService.js';

const blank = () => ({ name: '', year: '', category: '', message: '', contact: '', consent: false, website: '' });

export default function FeedbackForm() {
  const f = campaignConfig.forms;
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);
  const requestId = useRef(newRequestId());
  const busy = useRef(false);

  const set = (name) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (busy.current) return;
    const found = validateFeedback(values, { categories: f.feedbackCategories });
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
    const res = await submitFeedback({
      requestId: requestId.current,
      name: clean(values.name),
      year: values.year,
      category: values.category,
      message: clean(values.message),
      contact: clean(values.contact),
      consent: values.consent,
      website: values.website,
    });
    busy.current = false;
    if (res.ok) {
      setStatus('success');
      requestId.current = newRequestId();
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
        <h2>Thank you for your feedback</h2>
        <p>Your message was saved and will be read by the campaign.</p>
        <p className="muted">If you would like to discuss it directly, WhatsApp opens a chat with the campaign number - press <strong>Send</strong> in WhatsApp to send your message. This is optional.</p>
        <div className="btn-row center">
          <WhatsAppButton messageKey="feedback">DISCUSS ON WHATSAPP</WhatsAppButton>
          <Link to="/register" className="btn btn-ghost">Join the campaign</Link>
          <button type="button" className="btn btn-ghost" onClick={() => { setValues(blank()); setStatus('idle'); }}>Send another</button>
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';
  return (
    <form className="card form-card" onSubmit={onSubmit} noValidate aria-labelledby="fb-title">
      <h2 id="fb-title">Share your ideas</h2>
      <p className="lead">Suggestions and concerns are welcome. Please keep them constructive and respectful.</p>

      {serverError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <strong>Not saved.</strong> {serverError.message}
            {serverError.code === 'NOT_CONFIGURED' && (
              <p className="alert-extra">Email <a href={mailtoUrl('Campaign feedback')}>{campaignConfig.contact.email}</a> or use WhatsApp instead.</p>
            )}
          </div>
        </div>
      )}

      <div className="form-grid">
        <FormField id="fb-name" label="Name" error={errors.name}>
          {(p) => <input {...p} type="text" autoComplete="name" maxLength={LIMITS.name} value={values.name} onChange={set('name')} />}
        </FormField>
        <FormField id="fb-year" label="Year of study">
          {(p) => (
            <select {...p} value={values.year} onChange={set('year')}>
              <option value="">Prefer not to say</option>
              {f.years.map((y) => <option key={y}>{y}</option>)}
            </select>
          )}
        </FormField>
        <FormField id="fb-category" label="Topic" error={errors.category}>
          {(p) => (
            <select {...p} value={values.category} onChange={set('category')}>
              <option value="">Choose a topic</option>
              {f.feedbackCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
        </FormField>
        <FormField id="fb-contact" label="Email or phone" hint="Only if you would like a reply." error={errors.contact}>
          {(p) => <input {...p} type="text" inputMode="email" autoComplete="off" maxLength={LIMITS.email} value={values.contact} onChange={set('contact')} />}
        </FormField>
      </div>

      <FormField id="fb-message" label="Your feedback or suggestion" required error={errors.message} counter={`${values.message.length}/${LIMITS.feedback}`}>
        {(p) => <textarea {...p} rows={6} maxLength={LIMITS.feedback + 200} value={values.message} onChange={set('message')} />}
      </FormField>

      <div className="hp" aria-hidden="true">
        <label>Leave this field empty<input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
      </div>

      <div className={`field consent ${errors.consent ? 'has-error' : ''}`}>
        <label className="check">
          <input type="checkbox" checked={values.consent} onChange={set('consent')} aria-invalid={errors.consent ? 'true' : undefined} />
          <span>
            I agree the campaign may store my feedback and any name or contact detail I gave, as described in the{' '}
            <Link to="/privacy" target="_blank">privacy notice</Link>. <span className="opt">(needed only if you give a name or contact)</span>
          </span>
        </label>
        {errors.consent && <p className="error-text" role="alert">{errors.consent}</p>}
      </div>

      <button type="submit" className="btn btn-gold btn-lg btn-block" disabled={submitting} aria-busy={submitting}>
        {submitting ? (<><Loader2 className="spin" size={20} aria-hidden="true" /> Sending...</>) : 'SEND FEEDBACK'}
      </button>
      <p className="fine-print">Leave name and contact blank if you prefer. We cannot promise full anonymity technically, so avoid sharing sensitive personal details.</p>
    </form>
  );
}
