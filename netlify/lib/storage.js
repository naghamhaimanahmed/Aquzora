/* Small key-value storage for orders, the WhatsApp assistant's conversations and newsletter sign-ups.

   - On Vercel (or anywhere) it uses a Redis database over its REST API when these are set:
       KV_REST_API_URL + KV_REST_API_TOKEN            (added by Vercel's "Upstash for Redis" storage)
       or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
   - On Netlify, without those, it uses Netlify Blobs (built in, nothing to set up).
   Tests can pass their own in-memory stores through global.__ATR_TEST_STORES.
   Each store has get(key, { type: "json" }) and setJSON(key, value). */

const NAMES = { orders: "atr-orders", chats: "atr-chats", subs: "atr-newsletter" };

function redisStore(url, token, prefix) {
  const call = async cmd => {
    const res = await fetch(url.replace(/\/$/, ""), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmd)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(`storage: ${data.error || res.status}`);
    return data.result;
  };
  return {
    async get(key, opt = {}) {
      const v = await call(["GET", `${prefix}:${key}`]);
      if (v == null) return null;
      return opt.type === "json" ? JSON.parse(v) : v;
    },
    setJSON: (key, value) => call(["SET", `${prefix}:${key}`, JSON.stringify(value)])
  };
}

function stores(event) {
  if (global.__ATR_TEST_STORES) return global.__ATR_TEST_STORES;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return Object.fromEntries(Object.entries(NAMES).map(([k, name]) => [k, redisStore(url, token, name)]));
  if (process.env.VERCEL) throw new Error("storage: not_configured (connect an Upstash for Redis database in Vercel → Storage)");
  const { connectLambda, getStore } = require("@netlify/blobs");
  connectLambda(event);
  return Object.fromEntries(Object.entries(NAMES).map(([k, name]) => [k, getStore({ name, consistency: "strong" })]));
}

const getJSON = async (store, key) => (await store.get(key, { type: "json" })) || null;
const setJSON = (store, key, value) => store.setJSON(key, value);

module.exports = { stores, getJSON, setJSON };
