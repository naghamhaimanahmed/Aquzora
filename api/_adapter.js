/* Runs the site's server functions (written for Netlify, in netlify/functions/) on Vercel.
   Vercel calls handler(req, res); this turns the request into the event object those
   functions expect and writes their reply back. The raw body is passed through unchanged,
   so payment and WhatsApp signatures still verify. */
module.exports = handler => async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const event = {
    httpMethod: req.method,
    headers: req.headers,
    path: url.pathname,
    rawUrl: url.href,
    queryStringParameters: Object.fromEntries(url.searchParams),
    body: Buffer.concat(chunks).toString("utf8"),
    isBase64Encoded: false
  };
  let out;
  try { out = (await handler(event, {})) || {}; }
  catch (e) { console.error(e); out = { statusCode: 500, headers: { "Content-Type": "application/json" }, body: '{"error":"server"}' }; }
  res.statusCode = out.statusCode || 200;
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  for (const [k, v] of Object.entries(out.multiValueHeaders || {})) res.setHeader(k, v);
  res.end(out.isBase64Encoded ? Buffer.from(out.body || "", "base64") : out.body || "");
};
