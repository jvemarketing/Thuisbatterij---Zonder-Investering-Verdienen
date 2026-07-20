# Per-Route Vercel Functions for API Latency Visibility

**Status:** Draft — pending user review
**Date:** 2026-07-20

## Problem

There is no way to see response-time data for individual API endpoints
(`/api/lead`, `/api/postcodecheck`, `/api/validate/mobile`, etc.) in Vercel.

Investigation ruled out the tools that looked like they should solve this:

- **Speed Insights** is frontend Real User Monitoring (Core Web Vitals for page
  loads). It never touches server-side API routes.
- **Vercel Observability Plus** has a "Vercel Functions" panel that shows p75
  latency broken down by path/route — but only across distinct deployed
  Functions. This project's `vercel.json` declares a single legacy `builds`
  entry (`{ "src": "app.js", "use": "@vercel/node" }`) with a catch-all
  rewrite (`"/(.*)" → "/app.js"`), so the entire app — every marketing page on
  every domain, plus every `/api/*` endpoint — is one Vercel Function. The
  dashboard shows one row, currently labeled `/app.js`.
- The `.js` suffix on that label is itself a symptom of the legacy `builds`
  property. Vercel's current docs mark `builds` as deprecated ("We recommend
  against using this property... please use the `functions` property
  instead") and it no longer appears in the main `vercel.json` reference,
  only in a "Legacy" appendix. Its replacement — zero-config detection of
  files under `/api/` — names Functions after their route (`/api/lead`), not
  their file path.

Confirmed via Vercel's own docs: filesystem-based Functions (including
zero-config `/api/*.js` files) take routing precedence over `rewrites`. A
request only falls through to a rewrite if no real file matches it first.
This is what makes the design below work without conflicts.

## Goals

- Every true API endpoint (`/api/lead`, `/api/postcodecheck`,
  `/api/validate/mobile`, `/api/validate/landline`, `/api/validate/email`,
  `/api/lookup/paf`, `/api/lookup/mobile-payment-type`, `/api/sms/send`,
  `/api/sms/verify`) becomes its own Vercel Function, visible as its own
  cleanly-named row with p75 latency in the Observability Plus dashboard.
- No third-party service, no new paid dependency beyond the Vercel plan the
  user already decided on (Observability Plus).
- Zero behavior change for end users — every route, response shape, and
  error path stays identical.
- The existing local dev workflow (`npm run dev`, `/etc/hosts` domain
  mapping, ngrok mobile testing via `npm run dev -- <hostname>`) keeps
  working exactly as documented in `CLAUDE.md`, unchanged.

## Non-goals

- Splitting the SSR marketing pages (`views/vaste-lasten/*`,
  `views/thuisbatterij/*`) into per-route Functions. They stay behind one
  catch-all Function, same as today — the user doesn't need per-marketing-page
  latency, only per-API-endpoint.
- Splitting the suppression admin endpoints (`/api/opt-out`,
  `/api/suppression/files`, `/api/suppression/download/:filename`). They're
  low-traffic admin tooling; not worth a dedicated Function each. They stay
  mounted via `suppression.js` inside the catch-all.
- Adding OpenTelemetry, Trace Drains, or any third-party observability
  backend. That was the alternative direction explicitly not chosen.
- Changing how static assets in `public/` are served. They continue to be
  served via `express.static` inside the catch-all Function, exactly as
  today (not migrated to Vercel's native static-file serving).

## Design

### New file layout

```
api/
  index.js                    ← relocated app.js: SSR catch-all + static + suppression router
  lead.js
  postcodecheck.js
  validate/
    mobile.js
    landline.js
    email.js
  lookup/
    paf.js
    mobile-payment-type.js
  sms/
    send.js
    verify.js
lib/
  databowl.js                 ← extracted databowlRequest()
  tracking.js                 ← extracted fireEverflowPostback / fireFacebookConversion / sha256
pages.js                       ← unchanged, stays at root
views/                         ← unchanged
public/                        ← unchanged
suppression.js                 ← unchanged, still mounted inside api/index.js
```

`app.js` is deleted; its logic is split between `api/index.js` and the new
`api/*.js` handler files.

### Shared logic extraction

**`lib/databowl.js`** exports `databowlRequest(service, type, data)` — the
HMAC-SHA256 signing helper currently defined inline in `app.js`. Used by
`api/validate/*.js` and `api/lookup/*.js`.

**`lib/tracking.js`** exports `fireEverflowPostback`, `fireFacebookConversion`,
and `sha256` — currently defined inline in `app.js`, used only by
`api/lead.js`. `FB_PIXEL_CONFIG` moves here too since it's only needed by the
same call site.

### Per-route handler files

Each file exports a default `(req, res)` handler, matching Vercel's Node.js
Function signature (which provides the same `req.body` auto-parsing,
`res.json()`, `res.status()` helpers Express does today — the handler bodies
are otherwise unchanged from their current `app.post(...)` callbacks). Example:

```js
// api/validate/mobile.js
import { databowlRequest } from "../../lib/databowl.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });
    const result = await databowlRequest("validate", "hlr", { mobile });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

The explicit `if (req.method !== "POST")` check is new — today, Express's
`app.post(...)` only ever routes POST requests here. A standalone Vercel
Function receives every method, so each handler needs to guard for it.

`api/lead.js` follows the same pattern, pulling in `lib/tracking.js` for the
Everflow/Facebook side effects (still fired via `waitUntil` from
`@vercel/functions`, unchanged).

### `api/index.js` (relocated SSR catch-all)

Same Express app as today's `app.js`: domain-routing middleware reading
`pages.js`, `express.static` for `public/`, the `suppression.js` router
mounted at `/api`, and `GET /sovendus`. Only two things change:

1. Relative paths gain one `..` (`join(__dirname, '..', 'views')` instead of
   `join(__dirname, 'views')`), since the file is now one directory deeper.
2. **Local-dev convenience mounts** (see below) — the only functional
   addition.

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index" }
  ]
}
```

No `builds`, no `version` (both legacy). Vercel auto-detects every file under
`api/` as its own Function. Because filesystem routing wins over rewrites,
`/api/lead` resolves to `api/lead.js` directly; only paths matching no real
file (every marketing page across every domain, plus `/api/opt-out` and the
other suppression routes) fall through to the catch-all rewrite into
`api/index.js`.

### Preserving local dev without `vercel dev`

Splitting handlers into standalone files means they're no longer routes on
the Express app that `npm run dev` (`node --watch app.js`) serves. The
standard fix would be switching local dev to `vercel dev`, but that's a
bigger workflow change than this task warrants — it needs the Vercel CLI, a
linked project, and would require re-validating the `/etc/hosts` domain
mapping and the `npm run dev -- <ngrok-hostname>` mobile-testing trick
documented in `CLAUDE.md`, both of which depend on reading `req.hostname`
and `process.argv[2]` directly.

Instead, `api/index.js` imports each handler and mounts it on the same
Express app, gated behind the existing `NODE_ENV !== 'test'` block that
already guards `app.listen(3000)`:

```js
import leadHandler from './lead.js';
import postcodecheckHandler from './postcodecheck.js';
import validateMobileHandler from './validate/mobile.js';
import validateLandlineHandler from './validate/landline.js';
import validateEmailHandler from './validate/email.js';
import lookupPafHandler from './lookup/paf.js';
import lookupMobilePaymentTypeHandler from './lookup/mobile-payment-type.js';
import smsSendHandler from './sms/send.js';
import smsVerifyHandler from './sms/verify.js';

// ...existing domain SSR + static middleware...

if (process.env.NODE_ENV !== 'test') {
  app.post('/api/lead', leadHandler);
  app.post('/api/postcodecheck', postcodecheckHandler);
  app.post('/api/validate/mobile', validateMobileHandler);
  app.post('/api/validate/landline', validateLandlineHandler);
  app.post('/api/validate/email', validateEmailHandler);
  app.post('/api/lookup/paf', lookupPafHandler);
  app.post('/api/lookup/mobile-payment-type', lookupMobilePaymentTypeHandler);
  app.post('/api/sms/send', smsSendHandler);
  app.post('/api/sms/verify', smsVerifyHandler);
  app.listen(3000, () => console.log("Proxy running on http://127.0.0.1:3000"));
}
```

Each handler file is the single source of truth; `api/index.js` just wires
them up for convenient local testing. The route mounts themselves are
unconditional — only the `app.listen(3000, ...)` call is gated on
`NODE_ENV !== 'test'`, matching today's `app.js`, where the `app.post(...)`
registrations were always unconditional and only the listener was skipped
under test. In production on Vercel, the mounts are unreachable dead code
regardless — `/api/lead` never reaches `api/index.js` because the dedicated
`api/lead.js` Function intercepts it first at the filesystem-routing level —
so there's no behavioral difference in production, only in local dev and
in tests that exercise the app directly via supertest.

Two small accompanying changes:

- `package.json`: `"dev": "node --watch app.js"` → `"dev": "node --watch api/index.js"`
- `test/smoke.test.js`: `import app from '../app.js'` → `import app from '../api/index.js'`

## Data flow

**Split API endpoint** (e.g. `POST /api/lead`):
Request → Vercel edge → filesystem match on `api/lead.js` → handler runs
directly (imports `lib/tracking.js`, `@vercel/functions` `waitUntil`) →
response. Never touches `api/index.js` in production.

**Marketing page** (e.g. `GET /` on `vastelastenonderzoek.nl`):
Request → Vercel edge → no filesystem match → catch-all rewrite to
`/api/index` → `api/index.js`'s domain-routing middleware matches
`pages.js`, renders the EJS view. Identical to today's behavior via `app.js`.

**Suppression admin endpoint** (e.g. `POST /api/opt-out`):
Request → Vercel edge → no filesystem match (no literal `api/opt-out.js`
file exists) → catch-all rewrite to `/api/index` → the `suppressionRouter`
mounted inside `api/index.js` handles it, exactly as today.

## Error handling

No changes to any error path, status code, or response shape. Every
`try/catch` and validation check in each handler is copied verbatim from the
current `app.post(...)` callback. The only addition is the `405` guard for
non-POST methods on each split-out handler, since a standalone Vercel
Function (unlike an Express `app.post` route) receives every HTTP method and
needs to reject the wrong ones itself.

## Testing

- `test/smoke.test.js` needs its import path updated
  (`'../api/index.js'`) but otherwise requires no changes — it only ever
  exercised the GET SSR routes from `pages.js`, never the POST API endpoints,
  so the split doesn't remove any existing coverage.
- Manually verify each split endpoint locally via `npm run dev` (using the
  dev-mount wiring above) with the same requests used during the original
  postcodecheck/validate/lead testing.
- After deploying, confirm in the Vercel Observability dashboard that the
  Functions panel shows each `/api/*` endpoint as a distinct row, and spot
  check that a real request to e.g. `/api/lead` produces a latency data point
  under the `api/lead.js` row, not under `api/index`.

## Risks / open questions

- **Vercel Function cold starts**: going from 1 Function to ~10 means more
  independent cold-start paths (each endpoint's first invocation after
  inactivity pays its own cold start, rather than sharing one warmed-up
  Express process). Given this app's traffic pattern (lead-gen forms, not
  high-frequency APIs), this is unlikely to matter, but worth watching after
  deploy.
- **`vercel.json` maintenance**: every new API endpoint added in the future
  needs its own file under `api/` — there's no explicit registration step to
  forget (zero-config auto-detects it), but it does mean remembering the
  convention when adding endpoints, rather than just adding a line to
  `app.js`.
- **Dashboard label for the catch-all**: `api/index.js` will likely show as
  `/api/index` or `/api` in the dashboard (exact label not yet confirmed
  against a live deployment) — cosmetic only, doesn't affect the goal.
