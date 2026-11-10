// Pixel Calc telemetry proxy
// Browser POSTs here; we rate-limit, validate, and forward to Discord.
// Real Discord webhook URL lives in env.DISCORD_WEBHOOK_URL (secret).

const ALLOWED_ORIGIN = 'https://silvester13-sos.github.io';
const MAX_BODY_BYTES = 10_000;          // real payloads are ~3-4 KB
const PER_IP_PER_MINUTE = 5;            // real users click Calculate rarely
const DAILY_FORWARD_CAP = 2000;         // hard ceiling on what Discord sees per UTC day

// In-memory rate limit state. Lives per-isolate; good enough for casual abuse.
const ipHits = new Map();   // ip -> { count, resetAt }
let dayKey = '';
let dayCount = 0;

function clientIp(req) {
  return req.headers.get('CF-Connecting-IP') || 'unknown';
}

function rateLimitIp(ip) {
  const now = Date.now();
  const rec = ipHits.get(ip);
  if (!rec || now > rec.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (rec.count >= PER_IP_PER_MINUTE) return false;
  rec.count++;
  return true;
}

function dailyCapOk() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) { dayKey = today; dayCount = 0; }
  if (dayCount >= DAILY_FORWARD_CAP) return false;
  dayCount++;
  return true;
}

function cors(resp) {
  resp.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  resp.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return resp;
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }
    if (request.method !== 'POST') {
      return cors(new Response('Method Not Allowed', { status: 405 }));
    }

    // Kill switch: set env.KILL_SWITCH="1" in the dashboard to silently stop
    // forwarding to Discord without taking the Worker down.
    if (env.KILL_SWITCH === '1') {
      return cors(new Response(null, { status: 204 }));
    }

    // Origin check (soft — forgeable by non-browsers, but filters casual abuse)
    const origin = request.headers.get('Origin') || '';
    if (origin !== ALLOWED_ORIGIN) {
      return cors(new Response('Forbidden', { status: 403 }));
    }

    // Content-Type check
    const ct = request.headers.get('Content-Type') || '';
    if (!ct.includes('application/json')) {
      return cors(new Response('Unsupported Media Type', { status: 415 }));
    }

    // Size check (read as text so we can measure before parsing)
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) {
      return cors(new Response('Payload Too Large', { status: 413 }));
    }

    // Shape check
    let payload;
    try { payload = JSON.parse(body); }
    catch { return cors(new Response('Bad JSON', { status: 400 })); }
    if (!payload || typeof payload !== 'object') {
      return cors(new Response('Bad payload', { status: 400 }));
    }
    if (!Array.isArray(payload.embeds) || payload.embeds.length === 0) {
      return cors(new Response('Bad payload', { status: 400 }));
    }

    // Per-IP rate limit
    const ip = clientIp(request);
    if (!rateLimitIp(ip)) {
      return cors(new Response('Too Many Requests', { status: 429 }));
    }

    // Global daily forward cap — protects Discord's view of the webhook
    if (!dailyCapOk()) {
      // Return 204 so client sees success; we just silently drop.
      return cors(new Response(null, { status: 204 }));
    }

    // Forward to Discord. Logs only metadata — never the URL or error
    // messages, because fetch's TypeError includes the URL being fetched,
    // which would leak the webhook into wrangler tail output.
    const url = env.DISCORD_WEBHOOK_URL || '';
    const firstCh = url.charCodeAt(0);
    const lastCh  = url.charCodeAt(url.length - 1);
    console.log('fwd: len=' + url.length +
                ' first=' + firstCh +
                ' last=' + lastCh +
                ' startsOk=' + url.startsWith('https://discord.com/api/webhooks/'));
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('fwd result: status=' + r.status);
      if (!r.ok) {
        // Discord error bodies describe what's wrong with the payload;
        // they do NOT contain the webhook URL, so safe to log.
        const errBody = await r.text().catch(() => '<unreadable>');
        console.log('fwd err body: ' + errBody.slice(0, 800));
      }
      return cors(new Response(null, { status: r.ok ? 204 : 502 }));
    } catch (err) {
      // Deliberately NOT logging err.message — fetch's TypeError for a bad
      // URL includes the URL itself, which would leak the secret.
      console.log('fwd threw: name=' + err.name);
      return cors(new Response('Bad Gateway', { status: 502 }));
    }
  },
};
