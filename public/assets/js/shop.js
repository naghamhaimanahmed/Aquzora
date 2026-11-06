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
  // Prices: each brand's regular price converted to EGP at the 6 Nov 2026 rate and rounded to 10.
  // Full list with sources: prices/price-list.csv. Change any number here to set your own price.
  PRICES: {
    // osma
    OS01: 3440,   // Rouge, 100 ml: 239 SAR
    OS02: 3440,   // Noir, 100 ml: 239 SAR (estimate)
    OS03: 3720,   // Bonsoir, 150 ml: 259 SAR (estimate)
    OS04: 3720,   // Positano, 150 ml: 259 SAR (estimate)
    OS05: 3720,   // Bonjour, 150 ml: 259 SAR (estimate)
    // dkhoon
    DK01: 3800,   // Special Edition Collection, 6 x 50 ml: 50 JOD
    DK02: 1370,   // Musk Toffee, 100 ml: 95 SAR (estimate)
    DK03: 1370,   // Crown Black, 100 ml: 95 SAR
    DK04: 1370,   // No One, 100 ml: 95 SAR
    DK05: 1370,   // Gold Tears, 100 ml: 95 SAR
    DK06: 1850,   // Kahilan, 100 ml: 129 SAR
    DK07: 1370,   // Dkhoon Desert, 100 ml: 95 SAR (estimate)
    // reef
    RF01: 6020,   // Princess Reef, box: 419 SAR
    RF02: 4670,   // Pesca, 200 ml: 325 SAR
    RF03: 3990,   // Reef 11, 100 ml: 55 GBP
    RF04: 3990,   // Reef 42, 100 ml: 55 GBP
    RF05: 4670,   // Diriyah, 100 ml: 325 SAR (estimate)
    RF06: 4670,   // Summer Yellow, 100 ml: 325 SAR
    RF07: 4670,   // Bluest, 200 ml: 325 SAR (estimate)
    RF08: 4100,   // Reef 10, 100 ml: 76 USD
    RF09: 4670,   // Reef 19, 100 ml: 325 SAR
    RF10: 4670,   // Reef 31, 100 ml: 325 SAR (estimate)
    // laverne
    LV01: 3950,   // Champion, 200 ml: 275 SAR
    LV02: 3950,   // Tyrant, 200 ml: 275 SAR (estimate)
    LV03: 3950,   // Last Chance, 200 ml: 275 SAR (estimate)
    LV04: 3950,   // Into the Sea, 200 ml: 275 SAR
    LV05: 3950,   // Fearless, 200 ml: 275 SAR
    C07: 4040,    // Amber Royal, 200 ml: 275 AED
    LV06: 3950,   // La'Dor Bakhur, 200 ml: 275 SAR
    LV07: 4100,   // La'Dor Bakhur Valley, 200 ml: 54 JOD
    LV08: 3950,   // La'Dor Santorini, 200 ml: 275 SAR
    LV09: 3950,   // Atlantis Homme, 200 ml: 275 SAR
    LV10: 4040,   // Bella, 200 ml: 275 AED
    LV11: 4040,   // Lady Rose Bloom 200 ml, 200 ml: 275 AED
    LV12: 2760,   // Lady Rose Bloom 100 ml, 100 ml: 37.99 GBP
    LV13: 3950,   // Orchid Valley, 200 ml: 275 SAR (estimate)
    LV14: 3950,   // Queen Rose, 200 ml: 275 SAR (estimate)
    // assaf
    AS01: 7640,   // Pegasus Collection, 3 x 100 ml: 520.87 AED
    AS02: 3590,   // Aura Black, 150 ml: 250 SAR
    AS03: 4240,   // Frankel Black Out, 200 ml: 295 SAR
    AS04: 4300,   // Frankel Blue Elixir, 200 ml: 299 SAR
    AS05: 4150,   // Frankel Battle, 100 ml: 289 SAR
    AS06: 3950,   // Addict Blue, 125 ml: 275 SAR
    AS07: 3950,   // Wild Pegasus, 150 ml: 275 SAR
    AS08: 3580,   // No Comment: 249 SAR
    AS09: 2860,   // Gris Erik, 100 ml: 199 SAR
    AS10: 4240,   // Dangerous Arrogate, 200 ml: 295 SAR
    AS11: 4240,   // Arrogate Comete, 200 ml: 295 SAR
    AS12: 3520,   // Arrogate Pink Diva, 200 ml: 245 SAR
    AS13: 2860,   // Boom Blue, 200 ml: 199 SAR
    AS14: 2920,   // Baby Girl, 120 ml: 199 AED
    AS15: 4040,   // Feeling, 200 ml: 275 AED
    AS16: 3230,   // Rose, 200 ml: 225 SAR (estimate)
    B08: 4300,    // Pink Queen: 299 SAR
    WA0119: 4300, // Arrogate Girl: 299 SAR
    WA0133: 2860, // Arrogate Hook Blue, 200 ml: 199 SAR
  },

  // Delivery fee in EGP. Free when the order total reaches freeFrom.
  // Leave a fee as null until you decide it: below freeFrom the fee is then agreed on WhatsApp
  // and card payment is not offered.
  DELIVERY: {
    freeFrom: 2000,
    aswan: 50,     // delivery inside Aswan, where the store is (1–2 working days)
    other: 100     // all other governorates (2–4 days)
  },

  // Card payments through Paymob (see README → "Card payments with Paymob").
  // Turn on only after the Paymob keys are set on the server.
  // InstaPay: how customers pay. An order is confirmed once the customer sends the transfer
  // screenshot in WhatsApp. Put your InstaPay address (e.g. "atr@instapay") or the mobile
  // number linked to InstaPay, and optionally the account holder's name as InstaPay shows it.
  // While address is empty, customers are told the details will be sent in the WhatsApp chat.
  INSTAPAY: {
    address: "",
    accountName: ""
  },

  // The automatic WhatsApp assistant (see README → "WhatsApp order assistant").
  // Turn on only after it is connected to the WhatsApp Business Platform.
  WHATSAPP_BOT: {
    enabled: false,
    orderEndpoint: "/.netlify/functions/order-create"
  },

  PAYMENT: {
    cardEnabled: false,
    checkoutEndpoint: "/.netlify/functions/paymob-checkout",
    verifyEndpoint: "/.netlify/functions/paymob-verify"
  },

  // The 27 governorates of Egypt, Aswan (home, "local" delivery fee) first.
  GOVERNORATES: [
    { id: "aswan", en: "Aswan", ar: "أسوان", local: true },
    { id: "cairo", en: "Cairo", ar: "القاهرة" },
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
  else if (gov) delivery = gov.local ? SHOP.DELIVERY.aswan : SHOP.DELIVERY.other;
  else if (governorateId === "other") delivery = SHOP.DELIVERY.other; // "another governorate" (not Aswan)
  // no total while any item has no price: it is agreed on WhatsApp
  return { subtotal, unpriced, delivery, total: unpriced || delivery === null ? null : subtotal + delivery };
};

if (typeof module !== "undefined") module.exports = SHOP;
