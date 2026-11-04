/* Paymob's server-to-server notification ("transaction processed callback").
   Paymob calls this after every card payment, even if the customer closes the page before
   coming back to the site. It checks Paymob's HMAC signature, then sends the shop owner an
   alert for each paid order.

   Environment variables (Netlify → Site configuration → Environment variables):
     PAYMOB_HMAC_SECRET   Paymob dashboard → Settings → Account info → HMAC secret   (required)
     TELEGRAM_BOT_TOKEN   optional: token of a Telegram bot (from @BotFather) that sends the alerts
     TELEGRAM_CHAT_ID     optional: your chat ID with that bot (from @userinfobot)
   Without Telegram, each paid order is still written to Netlify's function log, and it is
   always listed in the Paymob dashboard.
*/
const crypto = require("crypto");

// Paymob signs these transaction fields, concatenated in exactly this order.
const FIELDS = ["amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction", "id",
  "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
  "is_voided", "order.id", "owner", "pending", "source_data.pan", "source_data.sub_type", "source_data.type", "success"];

const pick = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
const reply = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function validSignature(obj, hmac, secret) {
  if (!hmac || !obj) return false;
  const text = FIELDS.map(f => { const v = pick(obj, f); return v === undefined || v === null ? "" : String(v); }).join("");
  const expected = Buffer.from(crypto.createHmac("sha512", secret).update(text).digest("hex"));
  const given = Buffer.from(String(hmac).toLowerCase());
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

function orderMessage(obj) {
  const order = obj.order || {};
  const claims = obj.payment_key_claims || {};
  const billing = claims.billing_data || order.shipping_data || {};
  const extra = claims.extra || {};
  const egp = cents => `EGP ${(Number(cents) / 100).toLocaleString("en")}`;
  const items = (order.items || []).map(i => `• ${i.name} × ${i.quantity} = ${egp(i.amount_cents * i.quantity)}`);
  return [
    "✅ New paid order (card)",
    `Order: ${extra.ref || order.merchant_order_id || "—"}`,
    `Amount: ${egp(obj.amount_cents)}`,
    ...(items.length ? ["", ...items, ""] : []),
    `Customer: ${[billing.first_name, billing.last_name].filter(v => v && v !== "NA").join(" ")}`,
    `Mobile: ${billing.phone_number || "—"}`,
    `Governorate: ${extra.governorate || billing.city || "—"}`,
    `Address: ${extra.address || billing.street || "—"}`,
    `Paymob transaction ${obj.id}, order ${order.id}`
  ].join("\n");
}

async function notifyOwner(text) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  console.log(text); // always kept in Netlify's function log
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
  } catch (e) { console.error("Telegram alert failed", e.message); }
}

exports.handler = async event => {
  if (event.httpMethod !== "POST") return reply(405, { error: "method" });
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return reply(503, { error: "not_configured" });
  if ((event.body || "").length > 200000) return reply(413, { error: "too_large" });

  let data;
  try { data = JSON.parse(event.body || "{}"); } catch { return reply(400, { error: "bad_json" }); }
  const obj = data.obj;
  const hmac = (event.queryStringParameters || {}).hmac;
  if (data.type !== "TRANSACTION" || !validSignature(obj, hmac, secret)) return reply(401, { error: "signature" });

  if (obj.success === true && obj.pending !== true && obj.is_refunded !== true && obj.is_voided !== true) {
    await notifyOwner(orderMessage(obj));
  }
  return reply(200, { received: true });
};
