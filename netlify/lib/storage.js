/* Small key-value storage for the WhatsApp assistant: orders and conversations.
   On Netlify it uses Netlify Blobs (built in, nothing to set up). Tests can pass
   their own in-memory store through global.__ATR_TEST_STORES. */
const { connectLambda, getStore } = require("@netlify/blobs");

function stores(event) {
  if (global.__ATR_TEST_STORES) return global.__ATR_TEST_STORES;
  connectLambda(event);
  return {
    orders: getStore({ name: "atr-orders", consistency: "strong" }),
    chats: getStore({ name: "atr-chats", consistency: "strong" })
  };
}

const getJSON = async (store, key) => (await store.get(key, { type: "json" })) || null;
const setJSON = (store, key, value) => store.setJSON(key, value);

module.exports = { stores, getJSON, setJSON };
