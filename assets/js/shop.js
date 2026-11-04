/* Atr shop settings: prices, delivery and payment.
   This one file is read by the website AND by the payment function
   (netlify/functions/paymob-checkout.js), so the amount a customer pays by card
   is always worked out from these prices on the server, never from the browser. */

const SHOP = {
  currency: "EGP",

  // Price in Egyptian pounds for each product, by its photo reference (see GALLERY in data.js).
  // A product with no price here shows "Price on request": it can still go in the cart and be
  // ordered on WhatsApp, but it cannot be paid by card until it has a price.
  // Example:  B03: 1850,
  PRICES: {
  },

  // Delivery fee in EGP. Free when the order total reaches freeFrom.
  // Leave a fee as null until you decide it: below freeFrom the fee is then agreed on WhatsApp
  // and card payment is not offered.
  DELIVERY: {
    freeFrom: 2000,
    cairo: null,   // delivery inside Cairo (1–2 working days)
    other: null    // all other governorates (2–4 days)
  },

  // Card payments through Paymob (see README → "Card payments with Paymob").
  // Turn on only after the Paymob keys are set on the server.
  PAYMENT: {
    cardEnabled: false,
    checkoutEndpoint: "/.netlify/functions/paymob-checkout",
    verifyEndpoint: "/.netlify/functions/paymob-verify"
  },

  // The 27 governorates of Egypt. "cairo" decides the delivery fee.
  GOVERNORATES: [
    { id: "cairo", en: "Cairo", ar: "القاهرة", cairo: true },
    { id: "giza", en: "Giza", ar: "الجيزة" },
    { id: "alexandria", en: "Alexandria", ar: "الإسكندرية" },
    { id: "qalyubia", en: "Qalyubia", ar: "القليوبية" },
    { id: "port-said", en: "Port Said", ar: "بورسعيد" },
    { id: "suez", en: "Suez", ar: "السويس" },
    { id: "damietta", en: "Damietta", ar: "دمياط" },
    { id: "dakahlia", en: "Dakahlia", ar: "الدقهلية" },
    { id: "sharqia", en: "Sharqia", ar: "الشرقية" },
    { id: "gharbia", en: "Gharbia", ar: "الغربية" },
    { id: "monufia", en: "Monufia", ar: "المنوفية" },
    { id: "beheira", en: "Beheira", ar: "البحيرة" },
    { id: "kafr-el-sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    { id: "ismailia", en: "Ismailia", ar: "الإسماعيلية" },
    { id: "faiyum", en: "Faiyum", ar: "الفيوم" },
    { id: "beni-suef", en: "Beni Suef", ar: "بني سويف" },
    { id: "minya", en: "Minya", ar: "المنيا" },
    { id: "asyut", en: "Asyut", ar: "أسيوط" },
    { id: "sohag", en: "Sohag", ar: "سوهاج" },
    { id: "qena", en: "Qena", ar: "قنا" },
    { id: "luxor", en: "Luxor", ar: "الأقصر" },
    { id: "aswan", en: "Aswan", ar: "أسوان" },
    { id: "red-sea", en: "Red Sea", ar: "البحر الأحمر" },
    { id: "new-valley", en: "New Valley", ar: "الوادي الجديد" },
    { id: "matrouh", en: "Matrouh", ar: "مطروح" },
    { id: "north-sinai", en: "North Sinai", ar: "شمال سيناء" },
    { id: "south-sinai", en: "South Sinai", ar: "جنوب سيناء" }
  ]
};

// Shared money rules, used by the website and the server alike.
SHOP.priceOf = code => (Number.isFinite(SHOP.PRICES[code]) && SHOP.PRICES[code] > 0 ? SHOP.PRICES[code] : null);
// lines: [{ code, qty }]. Returns subtotal of priced lines, whether any line has no price,
// the delivery fee (null if unknown) and the total.
SHOP.quote = (lines, governorateId) => {
  let subtotal = 0, unpriced = false;
  lines.forEach(l => { const p = SHOP.priceOf(l.code); if (p === null) unpriced = true; else subtotal += p * l.qty; });
  const gov = SHOP.GOVERNORATES.find(g => g.id === governorateId);
  let delivery = null;
  if (subtotal >= SHOP.DELIVERY.freeFrom && !unpriced) delivery = 0;
  else if (gov) delivery = gov.cairo ? SHOP.DELIVERY.cairo : SHOP.DELIVERY.other;
  return { subtotal, unpriced, delivery, total: delivery === null ? null : subtotal + delivery };
};

if (typeof module !== "undefined") module.exports = SHOP;
