# Aquzora · Perfumes, Oud & Musk

A professional, bilingual (English / العربية) perfume store website for customers in Egypt (prices in EGP). Open `index.html` in any browser; no install or build step.

## Features
- **English ⇄ Arabic** with full right-to-left layout; the choice is remembered.
- **Our collection**: real photos of the perfumes, musks and gift sets in stock, filterable by type (perfumes, musk, gift sets) or brand, 12 at a time with "Show more".
- **Photo viewer**: tap a photo to see it full size, move through the photos (buttons or arrow keys), and **ask about it on WhatsApp**. The message includes the product name and photo reference so you know which item the customer means.
- **Shop by category** tiles (Perfumes, Musk, Gift sets) that open the collection with that filter on.
- **Search** (header or bottom bar, press `/`) by product name, brand or type, in English or Arabic.
- **WhatsApp** buttons in the header, banner, footer and mobile bottom bar.
- Brands strip, reviews, newsletter sign-up, footer with contact details.
- Mobile first: bottom navigation bar, bottom-sheet photo viewer, large tap targets, keyboard and screen-reader friendly, respects reduced motion.

There is no bag or online checkout: customers order on WhatsApp.

## Images
### Product photos (the collection)
The product photos are in `assets/img/collection/` (1000 px, used in the photo viewer) and `assets/img/collection/thumb/` (480 px, used in the grid). Their names, brands and types are listed in `GALLERY` at the bottom of `assets/js/data.js`; each line uses the photo's file name as its reference (for example `B04`). To add a photo, save both sizes with a new reference name and add a line, for example:

```js
g("E01", "assaf", "perfume", "Arrogate Pink", "أروغيت بينك"),
```

The type is `perfume`, `musk` or `set`. Leave the name out if you do not know it, and the brand is shown instead. The photos used on the category tiles are set in `GALLERY_TILES`.

### Banner photos
The banner and "Why Aquzora" backgrounds are free Pexels photos (free for commercial use, no credit required: https://www.pexels.com/license/), saved in `assets/img/` so they work offline. If a file is missing, the site loads it from Pexels, and if that fails it shows a drawn illustration. To re-download them, run `bash download-images.sh`.

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
- Product photos, brands, filters and reviews: `assets/js/data.js`
- All interface text in both languages: `assets/js/i18n.js`
- WhatsApp number: `STORE.whatsapp` in `assets/js/data.js`, in international format without `+` or the leading 0 (now `201289555608`, i.e. +20 128 955 5608). The number shown in the footer is in `index.html`.
- Colours and fonts: the `:root` variables at the top of `assets/css/style.css`
