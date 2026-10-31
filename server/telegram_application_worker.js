/**
 * Cloudflare Worker — secure job application -> Telegram relay.
 * Secrets remain on the server; NEVER embed the Telegram bot token in HTML.
 * Required environment bindings:
 *  - TELEGRAM_BOT_TOKEN    (Cloudflare Worker Secret)
 *  - TELEGRAM_CHAT_ID      (Cloudflare Worker Secret)
 *  - ALLOWED_ORIGIN        (Text variable, e.g. https://jobs.example.com)
 * Recommended: set a Cloudflare WAF rate limiting rule on POST /apply, and
 * use Turnstile or other server-validated anti-spam before going public.
 */
const MAX_LENGTH = 6800;
const FIELDS = {
  fullName: 90, age: 3, phone: 30, telegram: 80, location: 140,
  education: 130, laptop: 190, mobile: 130, internet: 120,
  experience: 120, availability: 120, notes: 600,
};

function response(body, status, origin = '') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'vary': 'Origin',
      ...(origin ? {'access-control-allow-origin': origin} : {}),
    },
  });
}
function clean(value, max) {
  return typeof value === 'string'
    ? value.trim().slice(0, max).replace(/[\u0000-\u001f\u007f]/g, ' ')
    : String(value ?? '').trim().slice(0, max);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = String(env.ALLOWED_ORIGIN || '').replace(/\/$/, '');
    if (!allowedOrigin || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return response({ok:false,error:'Server not configured'},503);
    }
    if (origin !== allowedOrigin) {
      return response({ok:false,error:'Origin not allowed'},403);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {status:204,headers:{
        'access-control-allow-origin': allowedOrigin,
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type',
        'access-control-max-age': '3600',
        'vary':'Origin',
      }});
    }
    if (url.pathname !== '/apply' || request.method !== 'POST') {
      return response({ok:false,error:'Not found'},404,allowedOrigin);
    }
    if (!(request.headers.get('content-type') || '').startsWith('application/json')) {
      return response({ok:false,error:'Expected JSON'},415,allowedOrigin);
    }
    let data;
    try {
      const body = await request.text();
      if (body.length > MAX_LENGTH) return response({ok:false,error:'Payload too large'},413,allowedOrigin);
      data = JSON.parse(body);
      if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Invalid payload');
    } catch {
      return response({ok:false,error:'Invalid request'},400,allowedOrigin);
    }
    if (data.companySite) {
      // Honeypot field: do not report to likely bots.
      return response({ok:true},200,allowedOrigin);
    }
    const d = Object.fromEntries(Object.entries(FIELDS).map(([key,max]) => [key,clean(data[key],max)]));
    const required = ['fullName','phone','location','education','laptop','mobile','internet','experience','availability'];
    if (required.some(key=>!d[key]) || !Number.isInteger(Number(d.age)) || Number(d.age)<18 || Number(d.age)>85 || data.consent!=='on') {
      return response({ok:false,error:'Missing or invalid fields'},400,allowedOrigin);
    }
    const message = [
      '📋 নতুন Remote Trading Operator আবেদন','',
      `নাম: ${d.fullName}`, `বয়স: ${d.age}`, `মোবাইল / WhatsApp: ${d.phone}`,
      `Telegram: ${d.telegram||'দেওয়া হয়নি'}`, `জেলা/শহর: ${d.location}`,
      `শিক্ষাগত যোগ্যতা: ${d.education}`, `ল্যাপটপ/PC: ${d.laptop}`,
      `মোবাইলের মডেল: ${d.mobile}`, `ইন্টারনেট: ${d.internet}`,
      `ট্রেডিং অভিজ্ঞতা: ${d.experience}`, `উপলব্ধতা: ${d.availability}`,
      `অতিরিক্ত তথ্য: ${d.notes||'নেই'}`,
      '', 'আবেদনকারী নিয়োগ যাচাইয়ের জন্য এই তথ্য পাঠাতে সম্মতি দিয়েছেন।',
    ].join('\n');
    try {
      const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({chat_id: env.TELEGRAM_CHAT_ID,text:message.slice(0,3900),disable_web_page_preview:true}),
        signal:AbortSignal.timeout(10000),
      });
      const payload = await r.json().catch(()=>null);
      if (!r.ok || !payload?.ok) throw new Error('Telegram rejected request');
      return response({ok:true},200,allowedOrigin);
    } catch {
      return response({ok:false,error:'Delivery failed'},502,allowedOrigin);
    }
  }
};