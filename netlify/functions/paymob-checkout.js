/* Creates a Paymob card payment for a cart and returns the secure Paymob checkout URL.
   Runs on the server (Netlify Functions), so the secret key never reaches the browser.

   Set these in Netlify → Site configuration → Environment variables:
     PAYMOB_SECRET_KEY      Paymob dashboard → Settings → Account info → Secret key
     PAYMOB_PUBLIC_KEY      Paymob dashboard → Settings → Account info → Public key
     PAYMOB_INTEGRATION_ID  Paymob dashboard → Developers → Payment integrations → the card integration ID
     SITE_URL               Your site address, e.g. https://atr-perfume.netlify.app
*/
const SHOP = require("../../assets/js/shop.js");

const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const clean = (v, max = 120) => String(v || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

exports.handler = async event => {
  if (event.httpMethod !== "POST") return json(405, { error: "method" });
  const { PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID, SITE_URL } = process.env;
  if (!PAYMOB_SECRET_KEY || !PAYMOB_PUBLIC_KEY || !PAYMOB_INTEGRATION_ID || !SITE_URL) return json(503, { error: "not_configured" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "bad_json" }); }

  // Rebuild the cart from codes and quantities only; every price comes from shop.js.
  const lines = (Array.isArray(body.lines) ? body.lines : []).slice(0, 50)
    .map(l => ({ code: clean(l.code, 12).toUpperCase(), name: clean(l.name, 60), qty: Math.min(20, Math.max(1, parseInt(l.qty, 10) || 0)) }))
    .filter(l => /^[A-Z0-9]{2,12}$/.test(l.code));
  if (!lines.length) return json(400, { error: "empty" });

  const c = body.customer || {};
  const customer = { name: clean(c.name, 80), phone: clean(c.phone, 20), email: clean(c.email, 80), gov: clean(c.gov, 30), address: clean(c.address, 200) };
  if (!customer.name || !/^(\+?20|0)?1[0125]\d{8}$/.test(customer.phone.replace(/[\s-]/g, "")) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.address)
    return json(400, { error: "customer" });
  const gov = SHOP.GOVERNORATES.find(g => g.id === customer.gov);
  if (!gov) return json(400, { error: "governorate" });

  const q = SHOP.quote(lines, gov.id);
  if (q.unpriced) return json(400, { error: "unpriced" });
  if (q.total === null) return json(400, { error: "delivery_unknown" });

  const ref = clean(body.ref, 40) || `ATR-${Date.now()}`;
  const [first, ...rest] = customer.name.split(/\s+/);
  const items = lines.map(l => ({ name: `${l.name || "Item"} (${l.code})`.slice(0, 50), amount: SHOP.priceOf(l.code) * 100, description: `Ref ${l.code}`, quantity: l.qty }));
  if (q.delivery > 0) items.push({ name: "Delivery", amount: q.delivery * 100, description: gov.en, quantity: 1 });

  const res = await fetch("https://accept.paymob.com/v1/intention/", {
    method: "POST",
    headers: { "Authorization": `Token ${PAYMOB_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: q.total * 100, // piasters
      currency: SHOP.currency,
      payment_methods: [Number(PAYMOB_INTEGRATION_ID)],
      items,
      billing_data: {
        first_name: first || "NA", last_name: rest.join(" ") || "NA",
        phone_number: customer.phone, email: customer.email,
        street: customer.address, city: gov.en, state: gov.en, country: "EG",
        apartment: "NA", floor: "NA", building: "NA"
      },
      special_reference: ref,
      extras: { ref, governorate: gov.en, address: customer.address },
      redirection_url: `${SITE_URL.replace(/\/$/, "")}/?paid=1`
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.client_secret) return json(502, { error: "paymob", detail: data.detail || data.message || res.status });

  return json(200, {
    ref,
    total: q.total,
    url: `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(PAYMOB_PUBLIC_KEY)}&clientSecret=${encodeURIComponent(data.client_secret)}`
  });
};
