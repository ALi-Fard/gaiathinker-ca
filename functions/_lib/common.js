// Shared helpers for /api/* Pages Functions.
// Secrets come from Cloudflare Pages environment variables (never from the client).

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra }
  });
}

const DEFAULT_ORIGINS = ['https://gaiathinker.ca', 'https://www.gaiathinker.ca'];

// Only accept browser requests from our own site (plus optional preview/dev origins).
export function originAllowed(request, env) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const extra = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return DEFAULT_ORIGINS.concat(extra).includes(origin);
}

export async function readJson(request, maxBytes = 8000) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) throw new Error('too_large');
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('too_large');
  return JSON.parse(text);
}

export function clean(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function isEmail(s) {
  return typeof s === 'string' && s.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/.test(s);
}

// Cloudflare Turnstile server-side verification.
export async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: false, reason: 'turnstile_not_configured' };
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, reason: 'missing_token' };
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) form.append('remoteip', ip);
  let data = {};
  try {
    const r = await fetch(env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    data = await r.json().catch(() => ({}));
  } catch (e) { return { ok: false, reason: 'turnstile_unreachable' }; }
  return { ok: !!data.success, reason: data.success ? '' : 'turnstile_failed' };
}

// Azure OpenAI chat completion (deploy in a Canadian region: Canada East / Canada Central).
export async function azureChat(env, messages, { maxTokens = 220, temperature = 0.3, timeoutMs = 15000 } = {}) {
  if (!env.AZURE_OPENAI_ENDPOINT || !env.AZURE_OPENAI_KEY || !env.AZURE_OPENAI_DEPLOYMENT) throw new Error('llm_not_configured');
  const base = env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
  const ver = env.AZURE_OPENAI_API_VERSION || '2024-10-21';
  const url = `${base}/openai/deployments/${encodeURIComponent(env.AZURE_OPENAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(ver)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-key': env.AZURE_OPENAI_KEY },
      body: JSON.stringify({ messages, max_tokens: maxTokens, temperature }),
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error('llm_http_' + r.status);
    const data = await r.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) throw new Error('llm_empty');
    return String(text).trim();
  } finally { clearTimeout(t); }
}

// ---------- Azure Communication Services Email (HMAC-SHA256 auth) ----------
function b64(buf) { let s = ''; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
function unb64(str) { const s = atob(str); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }

function parseAcs(conn) {
  const parts = Object.fromEntries(String(conn || '').split(';').filter(Boolean).map(p => { const i = p.indexOf('='); return [p.slice(0, i).toLowerCase(), p.slice(i + 1)]; }));
  if (!parts.endpoint || !parts.accesskey) throw new Error('email_not_configured');
  return { endpoint: parts.endpoint.replace(/\/+$/, ''), key: parts.accesskey };
}

export async function sendEmail(env, { to, toName, subject, html, text, replyTo }) {
  const { endpoint, key } = parseAcs(env.ACS_CONNECTION_STRING);
  if (!env.EMAIL_FROM) throw new Error('email_not_configured');
  const pathAndQuery = '/emails:send?api-version=2023-03-31';
  const url = new URL(endpoint + pathAndQuery);
  const body = JSON.stringify({
    senderAddress: env.EMAIL_FROM,
    content: { subject, plainText: text, html },
    recipients: { to: [{ address: to, displayName: toName || to }] },
    replyTo: replyTo ? [{ address: replyTo }] : undefined,
    userEngagementTrackingDisabled: true
  });
  const date = new Date().toUTCString();
  const hash = b64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body)));
  const stringToSign = `POST\n${pathAndQuery}\n${date};${url.host};${hash}`;
  const hmacKey = await crypto.subtle.importKey('raw', unb64(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64(await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(stringToSign)));
  const r = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ms-date': date,
      'x-ms-content-sha256': hash,
      authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${sig}`
    },
    body
  });
  if (r.status !== 202 && !r.ok) throw new Error('email_http_' + r.status);
  return true;
}
