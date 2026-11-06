/* Request checks shared by the functions the website calls. */

const reply = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const lowerHeaders = event => Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
const clientIp = h => h["x-nf-client-connection-ip"] || (h["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

// Per-visitor limit kept in the function's memory (resets when Netlify starts a fresh copy).
function limiter(max, windowMs) {
  const hits = new Map();
  return key => {
    const now = Date.now(), list = (hits.get(key) || []).filter(t => now - t < windowMs);
    list.push(now); hits.set(key, list);
    if (hits.size > 5000) hits.clear();
    return list.length > max;
  };
}

// Same-site JSON POST of a reasonable size, from SITE_URL only. Returns an error reply or null.
function checkSiteRequest(event, siteUrl, maxBytes = 10000) {
  if (event.httpMethod !== "POST") return reply(405, { error: "method" });
  if (!siteUrl) return reply(503, { error: "not_configured" });
  const h = lowerHeaders(event);
  if (h.origin !== new URL(siteUrl).origin) return reply(403, { error: "origin" });
  if (!/^application\/json/.test(h["content-type"] || "")) return reply(415, { error: "type" });
  if ((event.body || "").length > maxBytes) return reply(413, { error: "too_large" });
  return null;
}

module.exports = { reply, lowerHeaders, clientIp, limiter, checkSiteRequest };
