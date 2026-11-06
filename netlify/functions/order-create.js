/* Saves a cart sent from the website and returns its order number (ATR-yymmdd-nnnn).
   The customer then opens WhatsApp with that number, and the assistant
   (whatsapp-webhook.js) replies with the order details from this saved copy.
   Only product codes and quantities are accepted; names and prices come from the
   site's own catalogue on the server. No personal data is stored here. */
const { GALLERY } = require("../../public/assets/js/data.js");
const { stores, getJSON, setJSON } = require("../lib/storage.js");
const { reply, lowerHeaders, clientIp, limiter, checkSiteRequest } = require("../lib/guard.js");

const tooMany = limiter(10, 10 * 60 * 1000); // 10 orders per visitor per 10 minutes

function newRef() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `ATR-${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
}

exports.handler = async event => {
  const bad = checkSiteRequest(event, process.env.SITE_URL);
  if (bad) return bad;
  if (tooMany(clientIp(lowerHeaders(event)))) return reply(429, { error: "too_many" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return reply(400, { error: "bad_json" }); }
  const seen = new Set();
  const lines = (Array.isArray(body.lines) ? body.lines : []).slice(0, 30)
    .map(l => ({ code: String(l && l.code || "").toUpperCase(), qty: Math.floor(Number(l && l.qty)) }))
    .filter(l => GALLERY.some(g => g.code === l.code) && l.qty >= 1 && !seen.has(l.code) && seen.add(l.code))
    .map(l => ({ code: l.code, qty: Math.min(20, l.qty) }));
  if (!lines.length) return reply(400, { error: "empty" });
  const lang = body.lang === "en" ? "en" : "ar";

  const { orders } = stores(event);
  let ref = newRef();
  for (let i = 0; i < 5 && (await getJSON(orders, ref)); i++) ref = newRef();
  await setJSON(orders, ref, { ref, lines, lang, status: "new", createdAt: new Date().toISOString() });
  return reply(200, { ref });
};
