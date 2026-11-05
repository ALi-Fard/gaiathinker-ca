// GET /api/config — public runtime config (same pattern as gaiasystems.ca).
// Set TURNSTILE_SITEKEY in Cloudflare; no rebuild needed.
import { json } from '../lib/common.js';

export function onRequestGet({ env }) {
  return json({ turnstileSiteKey: env.TURNSTILE_SITEKEY || '', chat: !!env.ANTHROPIC_API_KEY, email: !!(env.RESEND_API_KEY && env.EMAIL_FROM && env.TURNSTILE_SECRET_KEY) }, 200, { 'cache-control': 'public, max-age=300' });
}

export function onRequest() { return json({ error: 'method_not_allowed' }, 405, { allow: 'GET' }); }
