/* Checks that a Paymob redirect really comes from Paymob (HMAC signature), so the
   "payment received" message on the site cannot be faked by editing the address bar.

   Needs this environment variable in Netlify:
     PAYMOB_HMAC_SECRET   Paymob dashboard → Settings → Account info → HMAC secret
*/
const crypto = require("crypto");

// Paymob signs these redirect fields, concatenated in exactly this order.
const FIELDS = ["amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction", "id",
  "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
  "is_voided", "order", "owner", "pending", "source_data.pan", "source_data.sub_type", "source_data.type", "success"];

const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

exports.handler = async event => {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return json(503, { error: "not_configured" });
  const p = event.queryStringParameters || {};
  if (!p.hmac) return json(400, { error: "missing" });

  const expected = crypto.createHmac("sha512", secret).update(FIELDS.map(f => p[f] ?? "").join("")).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(String(p.hmac).toLowerCase());
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!valid) return json(400, { error: "signature" });

  return json(200, {
    paid: p.success === "true" && p.pending !== "true",
    pending: p.pending === "true",
    amount: Number(p.amount_cents) / 100,
    currency: p.currency,
    transaction: p.id,
    order: p.order
  });
};
