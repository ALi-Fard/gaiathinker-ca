// Green AI Bingo — "Ask Ember" game guide + Green AI Readiness Assessment.
// Both are optional. The game itself never sends data anywhere.
import { QUESTIONS, ORG_TYPES, ROLES, scoreAssessment } from '/green-ai-assessment-data.js';

const $ = id => document.getElementById(id);
function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  if (attrs) for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids || []) if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return n;
}
const progress = { count: 1, lines: 0 };
document.addEventListener('gab:progress', e => {
  const before = progress.lines;
  Object.assign(progress, e.detail || {});
  if (progress.lines > 0 && before === 0) showNudge();
});

// =====================================================================
// Ask Ember (chat)
// =====================================================================
const MAX_TURNS = 12;
const FAQ = {
  play: 'Tap any square to read a habit and why it matters. Once you’ve actually done it this week, press “I did this”. Five marked squares in a row, column or diagonal make a GREEN line. The centre square is free.',
  line: 'A GREEN line is five marked squares in a row: across, down or corner to corner. The free centre square counts, so the middle row, middle column and both diagonals only need four.',
  levels: 'Levels go up as you mark squares: Seedling (0), Sprout (5), Sapling (10), Watt Saver (15), Grid Guardian (20) and Green AI Champion (all 25).',
  saved: 'Your card and progress are saved only in this browser on this device. The game doesn’t send them anywhere. “New card” gives you a fresh mix of 24 habits; it asks before clearing your progress.',
  energy: 'Every AI answer runs on computers in a data centre. A chat model re-reads the whole conversation on each message and writes its answer one token at a time, so long chats, long answers, big models, images and video all use more electricity and water.',
  assess: 'After playing, adults can take a free 10-question Green AI Readiness Assessment for their organization. You’ll see your results and a 90-day plan right away, and you can choose to get a copy by email.'
};
const CHIPS = [
  ['How do I play?', 'play'], ['What’s a GREEN line?', 'line'], ['Why does AI use energy?', 'energy'], ['Is my progress saved?', 'saved'], ['What’s the assessment?', 'assess']
];
function localMatch(q) {
  const s = q.toLowerCase();
  if (/how (do|to) (i )?play|rules|instructions|how does (this|it) work/.test(s)) return 'play';
  if (/green line|bingo|in a row|diagonal/.test(s)) return 'line';
  if (/level|rank|seedling|champion/.test(s)) return 'levels';
  if (/save|saved|progress|privacy|data|track/.test(s)) return 'saved';
  if (/assess|readiness|organi[sz]ation|email/.test(s)) return 'assess';
  if (/energy|electric|power|water|why/.test(s)) return 'energy';
  return null;
}

const chat = { open: false, msgs: [], turns: 0, busy: false };

function buildChat() {
  const launcher = el('button', { class: 'ember-launch', id: 'emberLaunch', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'emberPanel', onclick: () => toggleChat() }, [
    el('span', { class: 'ember-dot', 'aria-hidden': 'true' }), 'Ask Ember'
  ]);
  const log = el('div', { class: 'ember-log', id: 'emberLog', role: 'log', 'aria-live': 'polite' });
  const chips = el('div', { class: 'ember-chips', id: 'emberChips' }, CHIPS.map(([label, key]) =>
    el('button', { type: 'button', class: 'ember-chip', onclick: () => askLocal(label, key) }, [label])));
  const input = el('textarea', { id: 'emberInput', rows: '1', maxlength: '500', placeholder: 'Ask about the game or green AI…', 'aria-label': 'Your question' });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  const form = el('form', { class: 'ember-form', onsubmit: e => { e.preventDefault(); send(); } }, [
    input, el('button', { type: 'submit', class: 'ember-send', 'aria-label': 'Send' }, ['Send'])
  ]);
  const panel = el('section', { class: 'ember-panel', id: 'emberPanel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'emberTitle', hidden: true }, [
    el('header', { class: 'ember-head' }, [
      el('div', null, [el('div', { class: 'ember-title', id: 'emberTitle', text: 'Ember · game guide' }), el('div', { class: 'ember-sub', text: 'Small AI model · short answers, on purpose' })]),
      el('button', { type: 'button', class: 'ember-x', 'aria-label': 'Close chat', onclick: () => toggleChat(false) }, ['×'])
    ]),
    log, chips, form,
    el('p', { class: 'ember-note' }, ['Please don’t share personal information. Typed questions go to our AI service in Canada and aren’t stored. ', el('a', { href: '/privacy#green-ai-bingo', text: 'Privacy' })])
  ]);
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') toggleChat(false); });
  document.body.append(launcher, panel);
  addMsg('assistant', 'Hi, I’m Ember. Ask me how to play, or about why AI uses energy. Tap a quick question below; those answers don’t use any AI at all.', true);
}

function toggleChat(force) {
  chat.open = force == null ? !chat.open : force;
  $('emberPanel').hidden = !chat.open;
  $('emberLaunch').setAttribute('aria-expanded', String(chat.open));
  if (chat.open) $('emberInput').focus(); else $('emberLaunch').focus();
}

function addMsg(role, text, local) {
  const m = el('div', { class: 'ember-msg ' + (role === 'user' ? 'me' : 'bot') }, [text]);
  if (role === 'assistant' && local) m.appendChild(el('span', { class: 'ember-tag', text: 'No AI used' }));
  $('emberLog').appendChild(m);
  $('emberLog').scrollTop = $('emberLog').scrollHeight;
  if (!local) chat.msgs.push({ role, content: text });
}

function askLocal(label, key) {
  addMsg('user', label, true);
  addMsg('assistant', FAQ[key], true);
}

async function send() {
  const input = $('emberInput');
  const q = input.value.trim().slice(0, 500);
  if (!q || chat.busy) return;
  input.value = '';
  if (chat.turns >= MAX_TURNS) { addMsg('assistant', 'This chat has reached its limit. Short chats are part of green AI! Reload the page to start a new one.', true); return; }
  addMsg('user', q);
  chat.turns++;
  chat.busy = true;
  const typing = el('div', { class: 'ember-msg bot typing', 'aria-label': 'Ember is typing' }, ['…']);
  $('emberLog').appendChild(typing);
  try {
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: chat.msgs.slice(-8), context: progress }) });
    const data = await r.json().catch(() => ({}));
    typing.remove();
    if (r.ok && data.reply) addMsg('assistant', data.reply);
    else fallback(q);
  } catch (e) { typing.remove(); fallback(q); }
  chat.busy = false;
}

function fallback(q) {
  chat.msgs.pop(); // don't keep an unanswered turn in the AI history
  const key = localMatch(q);
  addMsg('assistant', (key ? FAQ[key] + ' ' : '') + (key ? '(Ember’s AI is offline right now, so this is a saved answer.)' : 'Ember’s AI is offline right now. Try one of the quick questions below.'), true);
}

// =====================================================================
// Green AI Readiness Assessment
// =====================================================================
const asmt = { i: 0, answers: {}, result: null };

function showNudge() {
  const n = $('assessNudge');
  if (n) n.hidden = false;
}

function startAssessment() {
  asmt.i = 0; asmt.answers = {}; asmt.result = null;
  $('assessIntro').hidden = true;
  renderQuestion();
  $('assessBody').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function renderQuestion() {
  const box = $('assessBody'); box.textContent = '';
  const q = QUESTIONS[asmt.i];
  const name = 'aq-' + q.id;
  const fs = el('fieldset', { class: 'aq' }, [
    el('legend', null, [el('span', { class: 'aq-step', text: `Question ${asmt.i + 1} of ${QUESTIONS.length}` }), el('span', { class: 'aq-text', text: q.text })]),
    el('div', { class: 'aq-bar', 'aria-hidden': 'true' }, [el('i', { style: `width:${(asmt.i / QUESTIONS.length) * 100}%` })]),
    ...q.options.map((opt, k) => el('label', { class: 'aq-opt' }, [
      el('input', { type: 'radio', name, value: String(k + 1), checked: asmt.answers[q.id] === k + 1, onchange: () => { asmt.answers[q.id] = k + 1; setTimeout(next, 180); } }),
      el('span', { text: opt })
    ]))
  ]);
  const nav = el('div', { class: 'aq-nav' }, [
    asmt.i > 0 ? el('button', { type: 'button', class: 'btn', onclick: () => { asmt.i--; renderQuestion(); } }, ['Back']) : el('span'),
    el('button', { type: 'button', class: 'btn primary', onclick: next }, [asmt.i === QUESTIONS.length - 1 ? 'See my results' : 'Next'])
  ]);
  box.append(fs, nav);
  const first = box.querySelector('input:checked') || box.querySelector('input');
  first && first.focus();
}

function next() {
  const q = QUESTIONS[asmt.i];
  if (!asmt.answers[q.id]) { const leg = $('assessBody').querySelector('legend'); leg && leg.classList.add('need'); return; }
  if (asmt.i < QUESTIONS.length - 1) { asmt.i++; renderQuestion(); } else renderResults();
}

function renderResults() {
  const r = scoreAssessment(asmt.answers);
  asmt.result = r;
  const box = $('assessBody'); box.textContent = '';
  box.append(
    el('div', { class: 'ar-head' }, [
      el('div', { class: 'ar-level' }, [el('span', { text: 'Your organization is' }), el('b', { text: r.level.name }), el('span', { text: `Overall readiness ${r.overallPct}%` })]),
      el('p', { text: r.level.summary })
    ]),
    el('div', { class: 'ar-dims' }, r.dims.map(d => el('div', { class: 'ar-dim' }, [
      el('div', { class: 'ar-dim-top' }, [el('span', { text: d.name }), el('span', { text: d.pct + '%' })]),
      el('div', { class: 'ar-bar', role: 'img', 'aria-label': `${d.name}: ${d.pct} percent` }, [el('i', { style: `width:${Math.max(3, d.pct)}%` })])
    ]))),
    el('h3', { class: 'ar-h', text: 'Your 90-day plan' }),
    el('ol', { class: 'ar-plan' }, r.plan.map(p => el('li', null, [el('b', { text: p.when + ': ' }), p.what]))),
    el('details', { class: 'ar-more' }, [el('summary', { text: 'All practical actions by area' }),
      ...r.dims.map(d => el('div', null, [el('h4', { text: d.name }), el('ul', null, d.recs.map(x => el('li', { text: x })))]))]),
    buildEmailForm(),
    el('div', { class: 'aq-nav' }, [el('button', { type: 'button', class: 'btn', onclick: () => { $('assessIntro').hidden = false; $('assessBody').textContent = ''; } }, ['Retake the assessment'])])
  );
  box.querySelector('.ar-level b').setAttribute('tabindex', '-1');
  box.querySelector('.ar-level b').focus();
}

// ---------- email form ----------
const SITE_KEY = (document.querySelector('meta[name="gab-turnstile-sitekey"]') || {}).content || '';
let tsToken = '', tsWidget = null;

function loadTurnstile(container) {
  if (!SITE_KEY) return;
  const render = () => { try { tsWidget = window.turnstile.render(container, { sitekey: SITE_KEY, theme: 'light', callback: t => { tsToken = t; }, 'expired-callback': () => { tsToken = ''; } }); } catch (e) {} };
  if (window.turnstile) return render();
  window.__gabTs = render;
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__gabTs';
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}

function field(label, input, hint) {
  return el('label', { class: 'af-field' }, [el('span', { class: 'af-label', text: label }), input, hint ? el('span', { class: 'af-hint', text: hint }) : null]);
}

function buildEmailForm() {
  const wrap = el('div', { class: 'af', id: 'assessEmail' });
  wrap.append(el('h3', { class: 'ar-h', text: 'Email me the full report' }),
    el('p', { class: 'af-intro', text: 'Get a copy with your 90-day plan, every recommendation, and notes for your type of organization. For adults acting on behalf of an organization.' }));
  if (!SITE_KEY) {
    wrap.append(el('p', { class: 'af-status', text: 'Emailed reports are being switched on. Your full results are shown above. Use your browser’s print option to save them as a PDF.' }));
    return wrap;
  }
  const orgSel = el('select', { name: 'orgType', required: true }, [el('option', { value: '', text: 'Choose…' }), ...ORG_TYPES.map(o => el('option', { value: o.id, text: o.label }))]);
  const roleSel = el('select', { name: 'role', required: true }, [el('option', { value: '', text: 'Choose…' }), ...ROLES.map(o => el('option', { value: o.id, text: o.label }))]);
  const ts = el('div', { class: 'af-ts' });
  const status = el('p', { class: 'af-status', role: 'status', 'aria-live': 'polite' });
  const form = el('form', { class: 'af-form', novalidate: true }, [
    el('div', { class: 'af-grid' }, [
      field('First name (optional)', el('input', { name: 'firstName', autocomplete: 'given-name', maxlength: '60' })),
      field('Work email *', el('input', { name: 'email', type: 'email', autocomplete: 'email', required: true, maxlength: '254' })),
      field('Organization *', el('input', { name: 'org', autocomplete: 'organization', required: true, maxlength: '120' })),
      field('Type of organization *', orgSel),
      field('Your role *', roleSel),
      field('Your biggest AI goal (optional)', el('textarea', { name: 'goal', rows: '2', maxlength: '300' }), 'For example: “cut report-writing time for staff”. Don’t include personal information.')
    ]),
    el('label', { class: 'af-check' }, [el('input', { type: 'checkbox', name: 'adultOrg', required: true }), el('span', { text: 'I am 18 or older and completing this on behalf of an organization. Email me my results. *' })]),
    el('label', { class: 'af-check' }, [el('input', { type: 'checkbox', name: 'marketing' }), el('span', { text: 'Yes, GaiaLink Intelligence Systems Inc. may email me occasional updates about responsible AI and GaiaThinker. I can unsubscribe at any time. (Optional)' })]),
    ts,
    el('div', { class: 'af-actions' }, [el('button', { type: 'submit', class: 'btn primary', text: 'Email my report' }), el('a', { href: '/privacy#green-ai-bingo', text: 'How we handle your information' })]),
    status
  ]);
  form.addEventListener('submit', e => submitEmail(e, form, status));
  wrap.append(form);
  loadTurnstile(ts);
  return wrap;
}

async function submitEmail(e, form, status) {
  e.preventDefault();
  const f = new FormData(form);
  const contact = { firstName: f.get('firstName'), email: String(f.get('email') || '').trim(), org: String(f.get('org') || '').trim(), orgType: f.get('orgType'), role: f.get('role'), goal: f.get('goal') };
  const consent = { adultOrg: f.get('adultOrg') === 'on', marketing: f.get('marketing') === 'on' };
  const problems = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) problems.push('a valid work email');
  if (!contact.org) problems.push('your organization');
  if (!contact.orgType) problems.push('the type of organization');
  if (!contact.role) problems.push('your role');
  if (!consent.adultOrg) problems.push('the confirmation checkbox');
  if (!tsToken) problems.push('the security check');
  if (problems.length) { status.className = 'af-status err'; status.textContent = 'Please add ' + problems.join(', ') + '.'; return; }
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'Sending…'; status.className = 'af-status'; status.textContent = '';
  try {
    const r = await fetch('/api/assessment', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: asmt.answers, contact, consent, turnstileToken: tsToken }) });
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.ok) {
      form.replaceWith(el('p', { class: 'af-status ok', role: 'status', text: `Sent. Check ${contact.email} in the next few minutes, and your junk folder just in case.` }));
      return;
    }
    status.className = 'af-status err';
    status.textContent = data.error === 'invalid_contact' ? 'Please check your email address and organization.' : 'We couldn’t send the email right now. Your results are shown above. Please try again later.';
  } catch (err) {
    status.className = 'af-status err'; status.textContent = 'Network problem. Please try again.';
  }
  btn.disabled = false; btn.textContent = 'Email my report';
  tsToken = ''; try { window.turnstile && tsWidget != null && window.turnstile.reset(tsWidget); } catch (e) {}
}

// =====================================================================
buildChat();
$('assessStart').addEventListener('click', startAssessment);
const nudgeBtn = $('assessNudgeBtn');
if (nudgeBtn) nudgeBtn.addEventListener('click', () => { $('assessment').scrollIntoView({ block: 'start' }); startAssessment(); });
