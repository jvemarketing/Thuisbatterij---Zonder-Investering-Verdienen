# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start server with file-watching (port 3000)
npm test          # run all tests (vitest)
```

To test against a specific domain locally, map it in `/etc/hosts`:
```
127.0.0.1  vastelastenonderzoek.local
127.0.0.1  verdienduurzaam.local
```
Then access e.g. `http://vastelastenonderzoek.local:3000/voltafy`. The server maps `.local` → `.nl` for route matching.

To test from a mobile device via ngrok:
```bash
npm run dev -- your-hostname.ngrok-free.app
```

## Architecture

**Domain-based SSR routing** — all routes are defined in `pages.js` as an array of page objects. Each page has:
- `domains` — one or more `{ domain, clarityId }` entries (the same routes serve all listed domains, each with its own Clarity tag)
- `defaultViewData` — view data shared across all routes for that page
- `routes` — array of `{ path, view, routeViewData }` where `routeViewData` is merged over `defaultViewData`

`app.js` matches the incoming `Host` header against `pages.js`, merges the data, and renders the EJS template. **To add a new site, domain, or partner route, only `pages.js` needs to be edited.**

**Views & static assets** are co-located by campaign under `views/` (EJS templates) and `public/` (CSS, JS, images):
- `views/vaste-lasten/index.ejs` — shared template for all Vaste Lasten partner variants
- `views/thuisbatterij/index.ejs` — Thuisbatterij / battery campaign
- `views/sovendus.ejs` — post-conversion Sovendus integration page
- `public/form-validation.js`, `public/affiliate.js` — shared frontend scripts

**API endpoints** (all in `app.js`):
| Endpoint | Purpose |
|---|---|
| `POST /api/postcodecheck` | PostNL address lookup proxy |
| `POST /api/validate/mobile` | Databowl HLR mobile validation |
| `POST /api/validate/landline` | Databowl landline validation |
| `POST /api/validate/email` | Databowl email validation |
| `POST /api/lead` | Submit lead to Databowl + fire Everflow postback |
| `POST /api/sms/send` | Send SMS via Twilio Programmable Messaging |
| `POST /api/sms/verify` | Verify SMS code (checked against `SMS_VERIFY_CODE` env var) |
| `GET  /sovendus` | Render Sovendus clickout page |

**Suppression list** (`suppression.js`, mounted at `/api`):
- `POST /api/opt-out` — appends email/phone to a daily CSV in Vercel Blob
- `GET /api/suppression/files` — list CSVs (Basic Auth)
- `GET /api/suppression/download/:filename` — download CSV and record timestamp (Basic Auth)

**Lead submission flow**: The frontend applies the Databowl field name mapping (e.g. `voornaam` → `f_3_firstname`) before posting to `/api/lead`. The server forwards pre-mapped fields directly to Databowl. The `newsletter` checkbox drives all `optin_*` fields server-side.

**Databowl signature**: `databowlRequest()` in `app.js` builds an HMAC-SHA256 signature. URL brackets (`data[key]`) must remain literal (not percent-encoded) in the string-to-sign but must be percent-encoded in the actual request URL — this is a known Databowl quirk.

**Deployment**: Vercel. All requests rewrite to `app.js` via `vercel.json`. `@vercel/functions` `waitUntil` is used to fire the Everflow postback after the response is sent.

**Analytics**: Every template ends its `<body>` with the Vercel Web Analytics + Speed Insights scripts:
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```
On a successful lead creation (`data.result === 'created'` from `/api/lead`), the frontend fires a custom `lead_submitted` event via `if (window.va) window.va('event', { name: 'lead_submitted' });` — see `views/vaste-lasten/index.ejs` and `views/thuisbatterij/flow.ejs`. Any new lead form should fire this same event on success so conversions stay comparable across campaigns in Vercel Analytics.

## Environment Variables

| Variable | Purpose |
|---|---|
| `POSTNL_API_KEY` | PostNL address lookup |
| `DATABOWL_PUBLIC_KEY` / `DATABOWL_PRIVATE_KEY` | Databowl API auth |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio SMS |
| `SMS_VERIFY_CODE` | Static verification code checked in `/api/sms/verify` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob for suppression CSVs |
| `SUPPRESSION_USER` / `SUPPRESSION_PASS` | Basic Auth for suppression admin endpoints |
| `SOV_TRAFFIC_SOURCE_NUMBER` / `SOV_TRAFFIC_MEDIUM_NUMBER` | Sovendus integration |

## Prelander Workflow (Bundled HTML → EJS)

Marketing generates new prelander designs in a visual tool (Framer or similar) and exports them as a single bundled HTML file (e.g. `views/vaste-lasten/html-reference.html`). These bundles pack all assets as base64 inside `<script type="__bundler/manifest">` and `<script type="__bundler/template">` tags. Each time a new bundle arrives, extract the template and apply these standard fixes before saving as the target `.ejs` file.

**Extract the template HTML:**
```js
const html = fs.readFileSync('views/.../html-reference.html', 'utf8');
const tmStart = html.indexOf('<script type="__bundler/template">');
const tmEnd = html.indexOf('</script>', tmStart);
const data = JSON.parse(html.slice(tmStart + '<script type="__bundler/template">'.length, tmEnd));
const pageHtml = data.pages[data.entry];
```

**Standard fixes to apply:**

1. Replace inlined `@font-face` UUID declarations with a Google Fonts `<link>` for Inter + Outfit.
2. Replace UUID image references with real asset paths (check `<script type="__bundler/manifest">` to identify which UUIDs are images).
3. Add `overflow-x:hidden` to `html,body` — the bundler omits this and negative-margin bleed elements cause horizontal scroll.
4. Add `width:calc(100% + 48px)` to elements using `margin:0 -24px` inside `<article>` (`.hero-image-header`, `.hero-visual`) — the bundler omits this.
5. Remove `margin:0 -24px` from `.final-cta` — it sits outside `<article>` at body level and is naturally full-width; negative margins cause overflow.
6. Fix placeholder CTA links — bundled CTAs use `#funnel` or `#start`; replace with `/?start` (relative, not absolute URL — the same prelander may be served from multiple domains).
7. Fix footer links — bundled footer uses `#`; replace with `/opt-out.html`, `/privacy.html`, `/terms.html`.
8. Fix sticky mobile CTA link — same placeholder issue.
9. Add the Clarity tracking script using `<%= clarityId %>` — the ID is injected server-side from `pages.js` per domain, so no hardcoded value is needed in the template.
10. Add `<script src="/affiliate.js"></script>` at the end of `<body>`.
11. Mobile hero image — change `aspect-ratio: 4/5` to `4/3` and add `background-size:cover; background-position:center top` on `.bg` in the mobile media query.
12. Add the Vercel Web Analytics + Speed Insights scripts at the end of `<body>` (see Analytics section above), and fire the `lead_submitted` custom event on successful lead creation if the template includes its own lead form.

## Git

Do not add `Co-Authored-By` trailers to commit messages.