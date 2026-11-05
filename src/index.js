// gaiathinker.ca Worker: serves the static site (ASSETS) and the /api/* endpoints
// used by Green AI Bingo (Ask Ember chat, Readiness Assessment, public config).
import * as chat from './api/chat.js';
import * as assessment from './api/assessment.js';
import * as config from './api/config.js';
import { json } from './lib/common.js';

const ROUTES = { '/api/chat': chat, '/api/assessment': assessment, '/api/config': config };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const mod = ROUTES[url.pathname];
    if (mod) {
      const m = request.method.toUpperCase();
      const handler = (m === 'POST' && mod.onRequestPost) || (m === 'GET' && mod.onRequestGet) || mod.onRequest;
      if (!handler) return json({ error: 'method_not_allowed' }, 405);
      try { return await handler({ request, env, ctx }); }
      catch (e) { return json({ error: 'server_error' }, 500); }
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS.fetch(request);
  }
};
