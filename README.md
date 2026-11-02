# POCA 50th Anniversary landing page

A single static page for Police Officers Christmas Angels (POCA, Inc.). It's plain HTML, CSS and JavaScript, with no build step and no external dependencies. The Google Fonts files (Oswald, Inter, Lora; SIL Open Font License) are stored in `assets/fonts`.

## Files

```
index.html            page content (all copy lives here)
css/styles.css        styles; colours and spacing are variables at the top
js/site-data.js       values to edit each year (see below)
js/main.js            enhancements (donate chooser, menu, lightbox, countdown, .ics, share, counters)
assets/img/           WebP photos (from pocacc.org), logos, QR code, decorative SVGs (lights, snow, holly, bow)
assets/video/         POCA 2021 compilation video (first item in the gallery)
assets/fonts/         self-hosted Google Fonts (woff2, latin)
assets/og-image.jpg   social share image (50th logo)
assets/favicon.png, assets/apple-touch-icon.png
```

## Preview

Run a local preview server from the project folder, then open http://localhost:3000:

```
npm run dev        # same as: npx serve . -l 3000
```

Nothing needs installing: `package.json` only holds this script and has no dependencies. Opening `index.html` directly also works, but the menu links (`/our-story/` etc.) need a server.

To publish, upload the whole folder to any static host. Turn on gzip or brotli compression if the host offers it.

## Updating next year

1. Edit `js/site-data.js`: `CURRENT_YEAR`, `EVENT` (date, times, venue), `STATS` (for example 50 to 51), `HERO_TOTAL`, donate links, mailing address, `LETTER_PDF`.
2. The hero counter digits (`data-odo`) are built from `HERO_TOTAL`, and the page also shows these values as plain text, so it still works without JavaScript. Search `index.html` for each old value (for example `2026`, `December 24`, `50`) and update that text too.
3. Replace the letter content in the `#letter` section of `index.html`, and drop the new PDF into `assets/` under the filename set in `LETTER_PDF`.
4. Update the JSON-LD block in the `<head>` (Event `startDate` and `endDate`).

## Settings to confirm with the client

- `SHOW_PERSONAL_NUMBERS`: `false` keeps the cell numbers for Joe Hopkins and Bob Corrigan off the page. Set it to `true` once they agree to publish them.
- `SOCIAL`: add real profile URLs. A network set to `null` shows no icon.
- Minimum donation amounts are set in Stripe, not on this site.
