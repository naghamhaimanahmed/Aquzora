// Vercel entry point for netlify/functions/order-create.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/order-create.js").handler);
