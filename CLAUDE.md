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

**Domain-based SSR routing** — all routes are defined in `routes.js` as an array of `{ domain, path, view, data }` objects. `app.js` matches incoming requests against this array and renders the EJS template with the associated data. **To add a new site or partner, only `routes.js` needs to be edited.**

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