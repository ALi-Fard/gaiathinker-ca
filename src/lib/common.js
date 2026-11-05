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

// Claude (Anthropic Messages API) — same provider as the Gaia assistant on gaiasystems.ca.
// messages: [{role:'system'|'user'|'assistant', content}] — the system entry is moved to the top-level `system` field.
export async function claudeChat(env, messages, { maxTokens = 220, temperature = 0.3, timeoutMs = 15000 } = {}) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('llm_not_configured');
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  // Anthropic requires the conversation to start with a user turn and alternate roles.
  const convo = [];
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    if (!convo.length && m.role !== 'user') continue;
    const last = convo[convo.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content; else convo.push({ role: m.role, content: m.content });
  }
  if (!convo.length) throw new Error('llm_bad_input');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: maxTokens, temperature, system, messages: convo }),
      signal: ctrl.signal
    });
    if (!r.ok) {
      const detail = (await r.text().catch(() => '')).slice(0, 300);
      console.error('claude_error', r.status, detail);
      throw new Error('llm_http_' + r.status);
    }
    const data = await r.json();
    const text = (data && Array.isArray(data.content) ? data.content : []).filter(b => b.type === 'text').map(b => b.text).join('');
    if (!text) throw new Error('llm_empty');
    return text.trim();
  } finally { clearTimeout(t); }
}

// Email via Resend — same provider as gaiasystems.ca. Use a sender on a domain already verified in Resend.
export async function sendEmail(env, { to, toName, subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error('email_not_configured');
  const r = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [toName ? `${toName.replace(/[<>"\r\n]/g, '')} <${to}>` : to],
      subject, html, text,
      reply_to: replyTo || undefined,
      headers: { 'List-Unsubscribe': `<mailto:${env.CONTACT_EMAIL || 'support@gaiasystems.ca'}?subject=unsubscribe>` }
    })
  });
  if (!r.ok) {
    console.error('resend_error', r.status, (await r.text().catch(() => '')).slice(0, 300));
    throw new Error('email_http_' + r.status);
  }
  return true;
}
