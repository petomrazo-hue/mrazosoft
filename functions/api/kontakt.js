/* /api/kontakt — Cloudflare Pages Function
   Zabezpecene prijatie kontaktneho formulara:
   POST-only, allowlist poli, max dlzky, honeypot, casovy bot-check,
   Turnstile overenie, sanitizacia, genericke chyby, forward na Web3Forms.

   Env premenne (Pages dashboard -> Settings -> Environment variables):
   - WEB3FORMS_KEY     (povinne) - access key z web3forms.com
   - TURNSTILE_SECRET  (odporucane) - secret key Turnstile widgetu;
     ak chyba, Turnstile krok sa preskoci (honeypot + ts check ostavaju).
   Lokalny vyvoj: npx wrangler pages dev . --binding WEB3FORMS_KEY=... \
     --binding TURNSTILE_SECRET=1x0000000000000000000000000000000AA */

const LIMITS = { meno: 100, email: 200, tel: 40, sprava: 3000, zaujem: 200 };
const ALLOWED = new Set(['meno', 'email', 'tel', 'sprava', 'zaujem', 'ts', 'website', 'turnstileToken']);
const MIN_FILL_MS = 3000;           // rychlejsie odoslanie = bot
const MAX_FILL_MS = 4 * 3600 * 1000; // starsie ako 4 h = stara/replay session

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

// genericka odpoved - botom neprezradzame, ktora kontrola ich chytila
const reject = () => json({ success: false, error: 'validation' }, 400);

const clean = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') // control znaky (okrem \n \t \r)
    .trim()
    .slice(0, max);

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return reject();
  }
  if (typeof body !== 'object' || body === null) return reject();

  // len ocakavane polia
  for (const key of Object.keys(body)) {
    if (!ALLOWED.has(key)) return reject();
  }

  // honeypot - pole "website" musi ostat prazdne
  if (body.website) return reject();

  // casovy bot-check
  const ts = Number(body.ts);
  const age = Date.now() - ts;
  if (!Number.isFinite(ts) || age < MIN_FILL_MS || age > MAX_FILL_MS) return reject();

  const meno = clean(body.meno, LIMITS.meno);
  const email = clean(body.email, LIMITS.email);
  const tel = clean(body.tel, LIMITS.tel);
  const sprava = clean(body.sprava, LIMITS.sprava);
  const zaujem = clean(body.zaujem, LIMITS.zaujem);

  if (!meno || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reject();

  // Turnstile overenie (jednorazovy token = ochrana proti opakovanemu odoslaniu)
  if (env.TURNSTILE_SECRET) {
    const token = clean(body.turnstileToken, 2048);
    if (!token) return reject();
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || undefined,
      }),
    }).then((r) => r.json()).catch(() => null);
    if (!verify || !verify.success) return reject();
  }

  if (!env.WEB3FORMS_KEY) {
    // chybajuca konfiguracia nesmie prezradit detaily
    return json({ success: false, error: 'server' }, 500);
  }

  const forward = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_KEY,
      subject: 'Dopyt z webu - ' + meno,
      from_name: 'MRAZOSOFT web',
      meno,
      email,
      telefon: tel || '-',
      zaujem: zaujem || '-',
      sprava: sprava || '-',
    }),
  }).then((r) => r.json()).catch(() => null);

  if (forward && forward.success) return json({ success: true });
  return json({ success: false, error: 'server' }, 502);
}

// CF Pages vola onRequest len pre metody bez specifickeho handlera (POST ma vlastny)
export function onRequest() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
