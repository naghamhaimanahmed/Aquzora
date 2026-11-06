/* Request checks shared by the functions the website calls. */

const reply = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const lowerHeaders = event => Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
// Netlify, Vercel or any proxy: the visitor's address as the host reports it
const clientIp = h => h["x-nf-client-connection-ip"] || h["x-real-ip"] || (h["x-vercel-forwarded-for"] || h["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

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

// Same-site JSON POST of a reasonable size. Returns an error reply or null.
// Only pages of SITE_URL may call; without SITE_URL (allowSameHost), pages of the address the request came to.
function checkSiteRequest(event, siteUrl, maxBytes = 10000, allowSameHost = false) {
  if (event.httpMethod !== "POST") return reply(405, { error: "method" });
  const h = lowerHeaders(event);
  const site = siteUrl ? new URL(siteUrl).origin : allowSameHost && h.host ? `https://${h.host}` : null;
  if (!site) return reply(503, { error: "not_configured" });
  if (h.origin !== site) return reply(403, { error: "origin" });
  if (!/^application\/json/.test(h["content-type"] || "")) return reply(415, { error: "type" });
  if ((event.body || "").length > maxBytes) return reply(413, { error: "too_large" });
  return null;
}

module.exports = { reply, lowerHeaders, clientIp, limiter, checkSiteRequest };
