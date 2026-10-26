# Aquzora · Perfumes, Oud, Makeup & Skincare

A professional, bilingual (English / العربية) beauty store website. Open `index.html` in any browser; no install or build step.

## Features
Built for customers in Egypt: prices in EGP, delivery to all 27 governorates, Egyptian mobile numbers and local payment methods.

- **English ⇄ Arabic** with full right-to-left layout. The first visit follows the browser language, and the choice is remembered.
- **Shop by category**: Perfumes, Oud & Bakhoor, Makeup, Skincare.
- **Find things fast**: live search (header search, press `/`), category chips, sort by price or rating, a max-price slider and an "On sale" filter.
- **Product view**: pick a size (each with its own price) or a lipstick/foundation shade from colour swatches, stock warnings ("only 3 left"), delivery time and fee for your governorate, share button, and customer reviews you can add.
- **Shareable product links**: `index.html#p6` opens that product directly.
- **Recently viewed** products under the collection.
- **Bag**: quantity controls with stock limits, remove with **Undo**, promo codes, **Deliver to** governorate with the delivery fee and time, a free-delivery progress bar (free over EGP 1,500), and **Order on WhatsApp**.
- **Checkout**: name, Egyptian mobile validation (010, 011, 012, 015), governorate, area, address, courier notes, gift wrap with a message, and payment by cash on delivery, card, mobile wallet (Vodafone Cash and others), InstaPay, Fawry or valU instalments. Details can be saved for next time.
- **My orders**: every order with its status steps, items, total, **Order again**, **Cancel order** and a WhatsApp help button.
- **Wishlist** saved in the browser.
- **Scent finder**: 3 quick questions that recommend perfumes.
- **Help & FAQ** about delivery, payment, opening the box before paying, returns and tracking.
- Brands strip, reviews, newsletter sign-up, floating WhatsApp button, back-to-top button, footer with contact.
- Mobile first: bottom navigation bar, bottom-sheet product views, large tap targets, keyboard and screen-reader friendly, respects reduced motion.

### Promo codes
Set in `PROMOS` in `assets/js/data.js`:
- `WELCOME10`: 10% off
- `AQZ200`: EGP 200 off orders of EGP 2,000 or more
- `FREESHIP`: free delivery on orders of EGP 800 or more

## Images
All photos are free Pexels photos (free for commercial use, no credit required: https://www.pexels.com/license/), chosen to show unbranded bottles and products. They are saved in `assets/img/`, so they work offline. If a file is missing, the site loads it from Pexels, and if that fails it shows a drawn illustration, so nothing ever looks broken.

To re-download the photos, run `bash download-images.sh`. To use your own product photos, put them in `assets/img/` with the same file names (for example `product-1.jpg`), or change the IDs in `assets/js/data.js`.

Official photos and logos of brands such as Assaf or Ibrahim Al Qurashi are copyrighted, so they are not included. If you are an authorised seller, ask the brand for its media kit and add the photos the same way.

## Logo
The logo's Q is a round perfume bottle filled with gold, and its tail is a ribbon of scent ending in spray drops. The files are in `assets/logo/`:
- `aquzora-logo.svg` / `.png`: main logo with tagline, for light backgrounds
- `aquzora-logo-white.svg` / `.png`: the same for dark backgrounds
- `aquzora-wordmark.svg` / `-white.svg` (and `.png`): the name alone, used in the website header and footer
- `aquzora-logo-stacked.svg` / `-dark.svg` (and `.png`): with the Arabic name أكوزورا, for packaging and social media
- `aquzora-icon.svg`, `aquzora-icon-512.png`, `aquzora-icon-gold-512.png`, `apple-touch-icon.png`: square icons for profile pictures and the browser tab
- `aquzora-mark.svg`: the perfume-bottle Q on its own
- `logo-sheet.png`: all versions on one page; `logo-concepts.png`: the four concepts considered

Use the SVG files wherever possible, because they stay sharp at any size. `build-logo.py` regenerates the SVG files.

## Editing content
- Products, prices, sizes, shades, stock, categories, brands and reviews: `assets/js/data.js`
- Delivery fees and times per governorate (`GOVERNORATES`), promo codes (`PROMOS`) and payment methods (`PAYMENTS`): `assets/js/data.js`
- All interface text in both languages: `assets/js/i18n.js`
- WhatsApp number: set `STORE.whatsapp` in `assets/js/data.js` (e.g. `"2010XXXXXXXX"`)
- Colours and fonts: the `:root` variables at the top of `assets/css/style.css`

Checkout, orders and reviews are a front-end demo saved only in the shopper's browser. Before taking real orders, connect checkout to a store platform or payment provider (for example Paymob or Fawry) so orders reach you.
