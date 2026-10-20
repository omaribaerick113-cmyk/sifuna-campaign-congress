import campaignConfig from '../config/campaignConfig.js';

/**
 * Talks to the Google Apps Script web app.
 *
 * Why Content-Type is text/plain: Apps Script web apps cannot answer CORS
 * "preflight" (OPTIONS) requests. A text/plain POST is a "simple request", so the
 * browser sends it directly, and Apps Script reads the JSON from e.postData.contents.
 * The response is readable because Apps Script sends it with permissive CORS headers
 * after its usual redirect. If your browser still blocks it, see the README troubleshooting.
 *
 * A success result is returned ONLY when the backend answers { ok: true }.
 * Anything else (network failure, timeout, bad JSON, ok:false) is an error.
 */

const TIMEOUT_MS = 25000;

export const isBackendConfigured = () => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(campaignConfig.backend.appsScriptUrl);

export function newRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function post(type, payload) {
  if (!isBackendConfigured()) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message: 'This form is not connected yet, so nothing was saved. Please reach the campaign on WhatsApp or email instead.',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(campaignConfig.backend.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type, ...payload }),
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, code: 'HTTP', message: 'The server answered with an error. Please try again in a moment.' };

    let data;
    try {
      data = await res.json();
    } catch {
      return { ok: false, code: 'BAD_RESPONSE', message: 'We could not confirm that your details were saved. Please try again.' };
    }
    if (data && data.ok === true) return { ok: true, duplicate: !!data.duplicate, data };
    return {
      ok: false,
      code: data?.code || 'REJECTED',
      message: data?.message || 'Your details were not saved. Please check the form and try again.',
      fieldErrors: data?.fieldErrors || null,
    };
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    return {
      ok: false,
      code: timedOut ? 'TIMEOUT' : 'NETWORK',
      message: timedOut
        ? 'The request took too long, so we could not confirm it was saved. Tap submit again - repeating it will not create a duplicate.'
        : 'We could not reach the server. Check your internet connection and try again - repeating it will not create a duplicate.',
    };
  } finally {
    clearTimeout(timer);
  }
}

export const submitRegistration = (payload) => post('registration', payload);
export const submitFeedback = (payload) => post('feedback', payload);
