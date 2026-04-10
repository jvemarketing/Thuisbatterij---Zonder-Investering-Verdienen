# Thuisbatterij / Vaste Lasten — Lead Generation Platform

Express-based SSR server serving multiple landing pages under different domains.

## Sites

| Domain | Path | Page |
|---|---|---|
| `vastelastenonderzoek.nl` | `/` | Vaste Lasten (no partner) |
| `vastelastenonderzoek.nl` | `/voltafy` | Vaste Lasten — Voltafy |
| `vastelastenonderzoek.nl` | `/gemakkelijkbesparen` | Vaste Lasten — Gemakkelijk Besparen |
| `vastelastenonderzoek.nl` | `/vle` | Vaste Lasten — VLE |
| `verdienduurzaam.nl` | `/thuisbatterij` | Thuisbatterij |

Routes are configured in [`routes.js`](./routes.js).

---

## Requirements

- Node.js 18+
- npm

---

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the API keys:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `POSTNL_API_KEY` | PostNL address lookup API key |
| `DATABOWL_PUBLIC_KEY` | Databowl public key |
| `DATABOWL_PRIVATE_KEY` | Databowl private key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service SID |

---

## Running locally

```bash
npm run dev
```

## Running via proxy:

```bash
npm run dev -- your-new-hostname.ngrok-free.app
```

The server starts on port 80. Because routing is domain-based, you need local domain aliases to test each site.

### Local domain aliases

Add the following to `/etc/hosts` (requires sudo):

```
127.0.0.1  vastelastenonderzoek.local
127.0.0.1  verdienduurzaam.local
```

Then visit:

- `http://vastelastenonderzoek.local/voltafy`
- `http://vastelastenonderzoek.local/gemakkelijkbesparen`
- `http://vastelastenonderzoek.local/vle`
- `http://verdienduurzaam.local/thuisbatterij`

The server automatically maps `.local` domains to their `.nl` equivalents for route matching.

---

## Adding a new site or partner

Edit [`routes.js`](./routes.js) — no other code needs touching:

```js
{
  domain: 'newdomain.nl',
  path: '/newpartner',
  view: 'vaste-lasten/index',   // EJS template in views/
  data: { partner: 'newpartner', src: '/vaste-lasten/img/NewPartner.png', alt: 'New Partner' },
},
```

Then add the domain alias to `/etc/hosts` for local dev.

---

## Project structure

```
app.js               Express server
routes.js            Domain + path → view mapping
views/               EJS templates (SSR)
  vaste-lasten/
  thuisbatterij/
public/              Static assets (CSS, JS, images)
  vaste-lasten/
  thuisbatterij/
  form-validation.js
  affiliate.js
```

---

## Tests

```bash
npm test
```

---

## Deployment

Deployed on Vercel. All requests are routed through Express via the catch-all rewrite in `vercel.json`.

## Google Sheet Receiver:
https://script.google.com/macros/s/AKfycbwtWDl0-Aiw7WZ2Z62x3O2-8Pq4DGOaiheYJEnRaSfF8i7gNY09v7Exr1nllcNlwI9r5w/exec
https://script.google.com/macros/s/AKfycbzOh0OnRsGMFxCfL957FE1rsnGzywWmHU3BPvFbDkD0u5q2BQnN5TULncvhaiq4eag2lg/exec