# Per-Route Vercel Functions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the nine `/api/*` endpoints currently living inside the monolithic `app.js` Express app into individual zero-config Vercel Functions, so Vercel Observability Plus shows real, cleanly-named per-endpoint latency instead of one row for the whole app.

**Architecture:** Each endpoint becomes its own file under `api/`, using Vercel's documented Node.js Function helpers (`request.body`, `response.status()`, `response.json()`) — the same signature style already used throughout the app today, confirmed still officially supported in Vercel's current Node.js runtime docs. Shared logic (Databowl HMAC signing, Everflow/Facebook tracking) moves into `lib/`. `app.js` is deleted; its domain-based SSR rendering, static file serving, and the suppression router move into `api/index.js`, which also imports and mounts every split-out handler for local dev only (gated by the existing `NODE_ENV !== 'test'` check), so `npm run dev` keeps working exactly as documented in `CLAUDE.md` without needing the Vercel CLI.

**Tech Stack:** Node.js (ESM), Express (only inside `api/index.js`), Vercel Node.js Functions (zero-config `/api` detection, no `builds`), Vitest + Supertest for tests. No new npm dependencies — everything needed (`express`, `node-fetch`, `twilio`, `@vercel/functions`) is already in `package.json`.

## Global Constraints

- No new npm dependencies.
- Every endpoint's response shape, status codes, and error-handling behavior must stay byte-for-byte identical to today — this is a relocation, not a rewrite.
- `req.hostname` (an Express-only convenience property) is **not** available on a standalone Vercel Function's request object — only `request.query`, `request.cookies`, and `request.body` are (confirmed in Vercel's Node.js runtime docs). Anywhere the original code reads `req.hostname`, the replacement must derive it from `req.headers.host` instead.
- Do not add `Co-Authored-By` trailers to commit messages (per `CLAUDE.md`).
- `npm run dev` must continue to serve every route (SSR pages and all API endpoints) on `http://127.0.0.1:3000`, and the `/etc/hosts` domain-mapping + `npm run dev -- <ngrok-hostname>` mobile-testing workflow documented in `CLAUDE.md` must keep working unchanged.

---

## Task 1: Extract shared Databowl and tracking helpers into `lib/`

**Files:**
- Create: `lib/databowl.js`
- Create: `lib/tracking.js`
- Test: `test/lib.test.js`

**Interfaces:**
- Produces: `databowlRequest(service: string, type: string, data: object): Promise<object>` from `lib/databowl.js`
- Produces: `sha256(value: string): string`, `FB_PIXEL_CONFIG: object`, `fireEverflowPostback(transactionId: string, leadId: string, leadContactData?: object): Promise<void>`, `fireFacebookConversion(fbConfig: {pixelId, token}, fbTracking: {fbclid}, req: Request, body?: object): Promise<void>` from `lib/tracking.js`

- [ ] **Step 1: Write the failing tests**

Create `test/lib.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import { databowlRequest } from '../lib/databowl.js';
import { sha256 } from '../lib/tracking.js';

describe('sha256', () => {
  it('trims and lowercases before hashing', () => {
    const expected = crypto.createHash('sha256').update('user@example.com').digest('hex');
    expect(sha256('  User@Example.COM  ')).toBe(expected);
  });
});

describe('databowlRequest', () => {
  beforeEach(() => {
    process.env.DATABOWL_PUBLIC_KEY = 'pub-key';
    process.env.DATABOWL_PRIVATE_KEY = 'priv-key';
    vi.mocked(fetch).mockReset();
  });

  it('builds a signed URL with literal brackets and percent-encoded values, and returns parsed JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: 'live' }) });

    const result = await databowlRequest('validate', 'hlr', { mobile: '+31612345678' });

    expect(result).toEqual({ result: 'live' });
    const calledUrl = vi.mocked(fetch).mock.calls[0][0];
    expect(calledUrl).toContain('key=pub-key');
    expect(calledUrl).toContain('service=validate');
    expect(calledUrl).toContain('type=hlr');
    expect(calledUrl).toContain('data[mobile]=%2B31612345678');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/lib.test.js`
Expected: FAIL — `lib/databowl.js` and `lib/tracking.js` don't exist yet (module not found errors).

- [ ] **Step 3: Create `lib/databowl.js`**

This is `databowlRequest` and its `DATABOWL_BASE` constant, moved verbatim from `app.js:93-118` (the leftover `console.log('fetching test ' + url)` debug line is dropped as pure noise with no behavioral effect — everything else is unchanged):

```js
import fetch from "node-fetch";
import crypto from "crypto";

const DATABOWL_BASE = "https://jve.databowl.com/api/v1/validation";

export function databowlRequest(service, type, data) {
  const timestamp = Math.floor(Date.now() / 1000);

  // Signature string must be raw (no URL-encoding), brackets literal
  // Format: timestamp=<ts>&service=<s>&type=<t>&data[key]=value
  let stringToSign = `timestamp=${timestamp}&service=${service}&type=${type}`;
  for (const [k, v] of Object.entries(data)) {
    stringToSign += `&data[${k}]=${v}`;
  }

  const signature = crypto
    .createHmac("sha256", process.env.DATABOWL_PRIVATE_KEY)
    .update(stringToSign)
    .digest("hex");

  // Build URL manually — URLSearchParams encodes [ ] to %5B%5D which breaks Databowl parsing
  let url = `${DATABOWL_BASE}?key=${process.env.DATABOWL_PUBLIC_KEY}&timestamp=${timestamp}&signature=${signature}&service=${service}&type=${type}`;
  for (const [k, v] of Object.entries(data)) {
    url += `&data[${k}]=${encodeURIComponent(v)}`;
  }

  return fetch(url).then((r) => r.json());
}
```

- [ ] **Step 4: Create `lib/tracking.js`**

This is `FB_PIXEL_CONFIG`, `sha256`, `fireEverflowPostback`, and `fireFacebookConversion`, moved verbatim from `app.js:228-244` and `app.js:357-435`:

```js
import fetch from "node-fetch";
import crypto from "crypto";

const EVERFLOW_POSTBACK_URL = "https://www.jh5th1trk.com/";

// Domain → Facebook pixel config. Add one entry per domain that needs FB conversion tracking.
export const FB_PIXEL_CONFIG = {
  'verdienduurzamer.nl': {
    pixelId: "4513411092222816",
    token: "EAALWuyeezx4BRgfv1yQs0TUuN5K4eP0JAWnedI4HFOZAUlarSmqHLBbMjJmczmTBnGW4Jke2ZBzOeiZBRG4RXZBPPyzdCgV2Um8TDJx5JO5zulupGoJYgiUZAGBM4s0v2ZAZAqIpmNCXsIuA3HXW1A1ovsLzo6dlmGjKSFm8L3P58lQTITGob5MB9OnwsYh9wZDZD",
  },
  'verdienduurzamer.local': {
    pixelId: "937971222531441",
    token: "EAAbdZANluGEkBRU21QKutVVWlhL1e6cd90rn4ByzJMhXta6LbiZANqBoe92ZCZBlbrSUTFQpNCAMC0lbDmWJzpdxXGKBsHqnZBUn4PSo4vA3JyYir6ECIuIzudpQ8FmWlgDoZBsUTQwJjCvDtMjoZCBQHD2ngb9rUQQhOYewGqjhBB2ohoTYF57YdNCSM6f3j0bJwZDZD",
  },
  'vastenlastenonderzoek.nl': {
    pixelId: "4513411092222816",
    token: "EAALWuyeezx4BRpHQQCh2NRXXyEKXgZBDzduK5QWK3xc6R7ZCKc9WZCi7WNplSgX8ZCtan0BAIkI2UdHuwx5T0wC6W3EC0fzJlUdZAJRm0e0qOIYTv2Jt609ZA3vAeR2EhM8znduZBOqMZBOhZA1MYa2vyOgPrkxlLR4pHvT0uZAV5faws0M3Amg6pQWmIZCruNX8wZDZD",
  },
};

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// Fire Everflow conversion postback
export async function fireEverflowPostback(transactionId, leadId, leadContactData = {}) {
  try {
    const postbackUrl = new URL(EVERFLOW_POSTBACK_URL);
    postbackUrl.searchParams.set('nid', '3773');
    postbackUrl.searchParams.set('transaction_id', transactionId);

    if (leadContactData.adv1) postbackUrl.searchParams.set('adv1', leadContactData.adv1);
    if (leadContactData.adv2) postbackUrl.searchParams.set('adv2', leadContactData.adv2);
    if (leadContactData.adv3) postbackUrl.searchParams.set('adv3', leadContactData.adv3);

    console.log(`Firing Everflow postback for transaction ${transactionId}, lead ${leadId}:`, postbackUrl.toString());

    const response = await fetch(postbackUrl.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'VerdienDuurzaam/1.0' }
    });

    if (!response.ok) {
      console.error(`Everflow postback failed with status ${response.status}`);
    } else {
      console.log(`Everflow postback successful for transaction ${transactionId}`);
    }
  } catch (error) {
    console.error('Everflow postback error:', error);
    throw error;
  }
}

// Fire Facebook Conversions API event
export async function fireFacebookConversion(fbConfig, fbTracking, req, body = {}) {
  const { pixelId, token } = fbConfig;
  const { fbclid } = fbTracking;
  const eventTime = Math.floor(Date.now() / 1000);

  const userData = {
    fbc:               `fb.1.${eventTime}.${fbclid}`,
    client_ip_address: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '',
    client_user_agent: req.headers['user-agent'] || '',
  };

  if (body.f_1_email)    userData.em      = sha256(body.f_1_email);
  if (body.f_3_firstname) userData.fn     = sha256(body.f_3_firstname);
  if (body.f_4_lastname)  userData.ln     = sha256(body.f_4_lastname);
  if (body.f_11_postcode) userData.zp     = sha256(body.f_11_postcode.replace(/\s+/g, ''));
  if (body.f_40_city)     userData.ct     = sha256(body.f_40_city);
  if (body.f_10_county)   userData.st     = sha256(body.f_10_county);
  if (body.f_12_phone1)   userData.ph     = sha256(body.f_12_phone1.replace(/\D/g, ''));
  // DOB stored as YYYY-MM-DD — Facebook wants YYYYMMDD
  if (body.f_5_dob)       userData.db     = sha256(body.f_5_dob.replace(/-/g, ''));
  userData.country = sha256('nl');

  const payload = {
    data: [{
      event_name:    'Lead',
      event_time:    eventTime,
      action_source: 'website',
      user_data:     userData,
    }],
  };

  const url = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${token}`;
  console.log(userData);
  console.log(`[facebook] pixel=${pixelId} event=Lead fbclid=${fbclid}`);

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(`Facebook Conversions API ${r.status}: ${JSON.stringify(json)}`);
  console.log('[facebook] ✓', json);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run test/lib.test.js`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/databowl.js lib/tracking.js test/lib.test.js
git commit -m "Extract Databowl signing and tracking helpers into lib/"
```

---

## Task 2: Split the five Databowl-backed validate/lookup endpoints

**Files:**
- Create: `api/validate/mobile.js`
- Create: `api/validate/landline.js`
- Create: `api/validate/email.js`
- Create: `api/lookup/paf.js`
- Create: `api/lookup/mobile-payment-type.js`
- Test: `test/api-validate-lookup.test.js`

**Interfaces:**
- Consumes: `databowlRequest` from `lib/databowl.js` (Task 1)
- Produces: default-exported `(req, res)` handlers, one per file, each rejecting non-POST methods with `405`

- [ ] **Step 1: Write the failing tests**

Create `test/api-validate-lookup.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/databowl.js', () => ({ databowlRequest: vi.fn() }));

import { databowlRequest } from '../lib/databowl.js';
import mobileHandler from '../api/validate/mobile.js';
import landlineHandler from '../api/validate/landline.js';
import emailHandler from '../api/validate/email.js';
import pafHandler from '../api/lookup/paf.js';
import mobilePaymentTypeHandler from '../api/lookup/mobile-payment-type.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.mocked(databowlRequest).mockReset();
});

describe('api/validate/mobile', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await mobileHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires mobile in body', async () => {
    const res = mockRes();
    await mobileHandler({ method: 'POST', body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls databowlRequest with the hlr service and returns the result', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobileHandler({ method: 'POST', body: { mobile: '+31612345678' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'hlr', { mobile: '+31612345678' });
    expect(res.json).toHaveBeenCalledWith({ result: 'live' });
  });
});

describe('api/validate/landline', () => {
  it('calls databowlRequest with the llv service', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await landlineHandler({ method: 'POST', body: { phone: '0201234567' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'llv', { phone: '0201234567' });
  });
});

describe('api/validate/email', () => {
  it('calls databowlRequest with the email service', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await emailHandler({ method: 'POST', body: { email: 'user@example.com' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'email', { email: 'user@example.com' });
  });
});

describe('api/lookup/paf', () => {
  it('calls databowlRequest with the paf lookup', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await pafHandler({ method: 'POST', body: { postcode: 'SW1A1AA' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'paf', { postcode: 'SW1A1AA' });
  });
});

describe('api/lookup/mobile-payment-type', () => {
  it('calls databowlRequest with mobile_payment_type, including the optional network', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobilePaymentTypeHandler({ method: 'POST', body: { mobile: '447123456', network: 'O2' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'mobile_payment_type', { mobile: '447123456', network: 'O2' });
  });

  it('omits network when not provided', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobilePaymentTypeHandler({ method: 'POST', body: { mobile: '447123456' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'mobile_payment_type', { mobile: '447123456' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/api-validate-lookup.test.js`
Expected: FAIL — the five `api/*.js` files don't exist yet.

- [ ] **Step 3: Create the five handler files**

`api/validate/mobile.js` (from `app.js:121-131`):

```js
import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/mobile   { mobile: "+31612345678" }
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

`api/validate/landline.js` (from `app.js:134-143`):

```js
import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/landline   { phone: "0201234567" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const result = await databowlRequest("validate", "llv", { phone });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

`api/validate/email.js` (from `app.js:146-159` — the two debug `console.log` lines are preserved verbatim to keep behavior identical):

```js
import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/email   { email: "user@example.com" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  console.log('public: ' + process.env.DATABOWL_PUBLIC_KEY);
  console.log('private: ' + process.env.DATABOWL_PRIVATE_KEY);

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });
    const result = await databowlRequest("validate", "email", { email });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

`api/lookup/paf.js` (from `app.js:162-171`):

```js
import { databowlRequest } from "../../lib/databowl.js";

// POST /api/lookup/paf   { postcode: "SW1A1AA" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { postcode } = req.body;
    if (!postcode) return res.status(400).json({ error: "postcode is required" });
    const result = await databowlRequest("lookup", "paf", { postcode });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

`api/lookup/mobile-payment-type.js` (from `app.js:174-184`):

```js
import { databowlRequest } from "../../lib/databowl.js";

// POST /api/lookup/mobile-payment-type   { mobile: "44712345678", network?: "O2" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { mobile, network } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });
    const data = network ? { mobile, network } : { mobile };
    const result = await databowlRequest("lookup", "mobile_payment_type", data);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/api-validate-lookup.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add api/validate api/lookup test/api-validate-lookup.test.js
git commit -m "Split validate/lookup endpoints into individual Vercel Functions"
```

---

## Task 3: Split the postcodecheck endpoint

**Files:**
- Create: `api/postcodecheck.js`
- Test: `test/api-postcodecheck.test.js`

**Interfaces:**
- Produces: default-exported `(req, res)` handler rejecting non-POST with `405`

- [ ] **Step 1: Write the failing test**

Create `test/api-postcodecheck.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import handler from '../api/postcodecheck.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  process.env.POSTNL_API_KEY = 'test-key';
});

describe('api/postcodecheck', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('normalizes the postal code and forwards the PostNL response verbatim', async () => {
    vi.mocked(fetch).mockResolvedValue({ status: 200, text: async () => '{"street":"Damrak"}' });
    const req = { method: 'POST', body: { postalCode: '1012 jk', houseNumber: '1' } };
    const res = mockRes();

    await handler(req, res);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0];
    expect(calledUrl).toContain('postalCode=1012JK');
    expect(calledUrl).toContain('houseNumber=1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"street":"Damrak"}');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/api-postcodecheck.test.js`
Expected: FAIL — `api/postcodecheck.js` doesn't exist yet.

- [ ] **Step 3: Create `api/postcodecheck.js`**

Moved verbatim from `app.js:59-89`:

```js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const payload = {
      postalcode: String(req.body.postalCode ?? req.body.postalcode ?? "").replace(/\s+/g, "").toUpperCase(),
      housenumber: String(req.body.houseNumber ?? req.body.housenumber ?? ""),
      housenumberaddition: String(req.body.houseNumberAddition ?? req.body.housenumberaddition ?? ""),
    };

    const BASE_URL = "https://api.postnl.nl/v2/address/benelux";
    const url = new URL(BASE_URL);
    url.searchParams.set("postalCode", payload.postalcode);
    url.searchParams.set("houseNumber", String(parseInt(payload.housenumber) || 0));
    url.searchParams.set("countryIso", 'NL');

    const r = await fetch(url.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.POSTNL_API_KEY,
          Accept: "application/json",
        }
      }
    );

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/api-postcodecheck.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add api/postcodecheck.js test/api-postcodecheck.test.js
git commit -m "Split postcodecheck endpoint into its own Vercel Function"
```

---

## Task 4: Split the SMS send/verify endpoints

**Files:**
- Create: `api/sms/send.js`
- Create: `api/sms/verify.js`
- Test: `test/api-sms.test.js`

**Interfaces:**
- Produces: default-exported `(req, res)` handlers, each rejecting non-POST with `405`

- [ ] **Step 1: Write the failing tests**

Create `test/api-sms.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const messagesCreate = vi.fn();
vi.mock('twilio', () => ({
  default: vi.fn(() => ({ messages: { create: messagesCreate } })),
}));

import sendHandler from '../api/sms/send.js';
import verifyHandler from '../api/sms/verify.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  messagesCreate.mockReset().mockResolvedValue({});
  process.env.SMS_VERIFY_CODE = '4463';
});

describe('api/sms/send', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await sendHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires phone', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sends the verification SMS and reports sent:true', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith({
      body: expect.stringContaining('Beste Jan'),
      from: 'Onderzoek',
      to: '+31612345678',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sent: true }));
  });
});

describe('api/sms/verify', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('reports verified:true for the correct code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '4463' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it('reports verified:false for the wrong code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '0000' } }, res);
    expect(res.json).toHaveBeenCalledWith({ verified: false });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/api-sms.test.js`
Expected: FAIL — the two files don't exist yet.

- [ ] **Step 3: Create the two handler files**

`api/sms/send.js` (from `app.js:188-209`, `getTwilioClient` kept local since it's only used here):

```js
import twilio from "twilio";

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// POST /api/sms/send   { phone: "+31612345678", firstName: "Jan" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone, firstName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const name = firstName || 'deelnemer';
    const message = `Beste ${name}, Gebruik verificatiecode 4463 om je deelname op vastelastenonderzoek.nl te bevestigen. Afmelden: vastelastenexperts.nl/toestemming-intrekken`;

    await getTwilioClient().messages.create({
      body: message,
      from: "Onderzoek",
      to: phone,
    });
    res.json({ sent: true, doi_sent_time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

`api/sms/verify.js` (from `app.js:212-223`):

```js
// POST /api/sms/verify   { code: "4463" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code is required" });
    const verified = code.trim() === process.env.SMS_VERIFY_CODE;
    const result = { verified };
    if (verified) result.doi_confirmed_time = new Date().toISOString();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/api-sms.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add api/sms test/api-sms.test.js
git commit -m "Split SMS send/verify endpoints into individual Vercel Functions"
```

---

## Task 5: Split the lead endpoint

This is the most involved handler and the one place where the `req.hostname` incompatibility (see Global Constraints) actually matters — it's read twice in the original code.

**Files:**
- Create: `api/lead.js`
- Test: `test/api-lead.test.js`

**Interfaces:**
- Consumes: `FB_PIXEL_CONFIG`, `fireEverflowPostback`, `fireFacebookConversion` from `lib/tracking.js` (Task 1)
- Produces: default-exported `(req, res)` handler rejecting non-POST with `405`

- [ ] **Step 1: Write the failing tests**

Create `test/api-lead.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@vercel/functions', () => ({ waitUntil: vi.fn() }));
vi.mock('../lib/tracking.js', () => ({
  FB_PIXEL_CONFIG: {},
  fireEverflowPostback: vi.fn().mockResolvedValue(undefined),
  fireFacebookConversion: vi.fn().mockResolvedValue(undefined),
}));

import fetch from 'node-fetch';
import { waitUntil } from '@vercel/functions';
import { fireEverflowPostback } from '../lib/tracking.js';
import handler from '../api/lead.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function baseReq(body) {
  return {
    method: 'POST',
    body,
    headers: { host: 'verdienduurzaam.nl' },
    socket: { remoteAddress: '127.0.0.1' },
  };
}

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  vi.mocked(waitUntil).mockReset();
  vi.mocked(fireEverflowPostback).mockReset().mockResolvedValue(undefined);
});

describe('api/lead', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires cid and sid', async () => {
    const res = mockRes();
    await handler(baseReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('forwards the lead to Databowl and returns its response on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();

    await handler(baseReq({ cid: '925', sid: '1', f_1_email: 'a@b.com' }), res);

    expect(fetch).toHaveBeenCalledWith(
      'https://jve.databowl.com/api/v1/lead',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: 'created', lead_id: '123' });
  });

  it('returns 409 for a duplicate lead instead of the raw Databowl status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'error', error: { msg: 'DUPLICATE_LEAD' } }),
    });
    const res = mockRes();

    await handler(baseReq({ cid: '925', sid: '1' }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('schedules the Everflow postback via waitUntil when ef_click_id is present', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();

    await handler(
      baseReq({ cid: '925', sid: '1', everflow_tracking: { ef_click_id: 'click-1' } }),
      res
    );

    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it('derives the hostname from the Host header, not req.hostname', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();
    const req = baseReq({ cid: '925', sid: '1' });

    await handler(req, res);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new URLSearchParams(options.body).get('f_1288_lead_source_url')).toContain('verdienduurzaam.nl');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/api-lead.test.js`
Expected: FAIL — `api/lead.js` doesn't exist yet.

- [ ] **Step 3: Create `api/lead.js`**

Moved from `app.js:253-355`, with `req.hostname` (used twice: for `f_1288_lead_source_url` and the Facebook pixel config lookup) replaced by a `hostname` variable derived from `req.headers.host`, since that's the only source of the host available on a standalone Vercel Function:

```js
import fetch from "node-fetch";
import { waitUntil } from "@vercel/functions";
import { FB_PIXEL_CONFIG, fireEverflowPostback, fireFacebookConversion } from "../lib/tracking.js";

const LEAD_ENDPOINT = "https://jve.databowl.com/api/v1/lead";

// POST /api/lead
// Body (JSON): already-mapped Databowl field names (f_*) + newsletter boolean.
// The frontend applies the field mapping before sending, so this handler just
// forwards all fields directly — no mapping needed here.
// Response: Databowl JSON — { result: "created"|"error", lead_id, error? }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = req.body;
    const now = new Date().toISOString();
    const hostname = (req.headers.host || '').split(':')[0];

    // Extract network tracking data (not forwarded to Databowl)
    const everflowTracking = body.everflow_tracking || null;
    const fbTracking       = body.fb_tracking       || null;

    // Campaign params — must be provided by the frontend
    if (!body.cid || !body.sid) {
      return res.status(400).json({ error: "cid and sid are required" });
    }
    const params = {
      cid: body.cid,
      sid: body.sid,
    };

    // IP address and source URL
    params.f_17_ipaddress          = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const referer = req.headers.referer || req.headers.referrer || '';
    const refPath = referer ? new URL(referer).pathname : '';
    params.f_1288_lead_source_url  = hostname + refPath;

    // Optin consent — newsletter checkbox drives all optin channels
    const optin = body.newsletter ? "true" : "false";
    params.optin_email           = optin;
    params.optin_email_timestamp = now;
    params.optin_phone           = optin;
    params.optin_phone_timestamp = now;
    params.optin_sms             = optin;
    params.optin_sms_timestamp   = now;

    // Forward all pre-mapped fields from the frontend; skip internal/tracking keys
    const skip = new Set(["newsletter", "cid", "sid", "everflow_tracking", "fb_tracking"]);
    for (const [key, val] of Object.entries(body)) {
      if (skip.has(key)) continue;
      if (val !== undefined && val !== null && val !== "") {
        params[key] = String(val);
      }
    }

    console.log('Sending lead to Databowl:', params);

    const r = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });

    const json = await r.json();

    // Return 409 for duplicate leads or daily cap reached
    if (json.result === "error" && json.error?.msg) {
      if (json.error.msg === "DUPLICATE_LEAD" || json.error.msg === "DAILY_CAP_REACHED") {
        return res.status(409).json(json);
      }
    }

    if (json.result === "created") {
      if (everflowTracking?.ef_click_id) {
        const leadContactData = {
          adv1: body.f_1_email     || '',
          adv2: body.f_12_phone1   || '',
          adv3: body.f_11_postcode || '',
        };
        waitUntil(
          fireEverflowPostback(everflowTracking.ef_click_id, json.lead_id, leadContactData)
            .catch(err => console.error('❌ Everflow postback error:', err))
        );
        console.log('✓ Everflow postback scheduled');
      }

      const fbConfig = FB_PIXEL_CONFIG[hostname.replace(/^www\./, '')];

      const isThuisbatterijFlow = refPath.endsWith('/flow');
      const notARenter = !isThuisbatterijFlow || body.f_1058_type_woning !== 'huurwoning';

      if (fbConfig?.pixelId && fbConfig?.token && fbTracking?.fbclid && notARenter) {
        waitUntil(
          fireFacebookConversion(fbConfig, fbTracking, req, body)
            .catch(err => console.error('❌ Facebook Conversions API error:', err))
        );
        console.log('✓ Facebook postback scheduled');
      }
    }

    res.status(r.status).json(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
```

Note: the noisy `console.log(FB_PIXEL_CONFIG, req.hostname, fbTracking)` and the multi-line `Degugging FB tracking:` debug logs from the original are dropped — they referenced `req.hostname` directly (which no longer exists) and were pure debug noise with a typo in the label, not behavior. Everything that affects the response or an external call is preserved.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/api-lead.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add api/lead.js test/api-lead.test.js
git commit -m "Split lead endpoint into its own Vercel Function"
```

---

## Task 6: Relocate `app.js` to `api/index.js`

**Files:**
- Create: `api/index.js`
- Delete: `app.js`
- Modify: `package.json` (dev script)
- Modify: `test/smoke.test.js` (import path)
- Test: `test/smoke.test.js` (existing, must still pass), `test/api-dev-mounts.test.js` (new)

**Interfaces:**
- Consumes: every handler from Tasks 2-5, `suppression.js`'s default export, `pages.js`'s default export
- Produces: default-exported Express `app`, importable by tests and by the local dev server

- [ ] **Step 1: Write the failing test for dev-mount wiring**

This confirms the split-out handlers are reachable through `api/index.js` locally, which is the entire point of the dev-mount mechanism from the design spec.

Create `test/api-dev-mounts.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import app from '../api/index.js';

describe('local dev mounts the split-out API handlers on the same Express app', () => {
  it('serves POST /api/validate/mobile', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: 'live' }) });
    process.env.DATABOWL_PUBLIC_KEY = 'pub';
    process.env.DATABOWL_PRIVATE_KEY = 'priv';

    await request(app)
      .post('/api/validate/mobile')
      .send({ mobile: '+31612345678' })
      .expect(200);
  });

  it('serves POST /api/postcodecheck', async () => {
    vi.mocked(fetch).mockResolvedValue({ status: 200, text: async () => '{}' });

    await request(app)
      .post('/api/postcodecheck')
      .send({ postalCode: '1012JK', houseNumber: '1' })
      .expect(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/api-dev-mounts.test.js`
Expected: FAIL — `api/index.js` doesn't exist yet.

- [ ] **Step 3: Create `api/index.js`**

Moved from `app.js`, with relative paths adjusted one level deeper (`views`/`public` are now `../views`/`../public`), the `app.post(...)` API route bodies removed (they live in the split files now), and the dev-mount wiring added at the bottom:

```js
import express from "express";
import dotenv from "dotenv";
import pages from "../pages.js";
import suppressionRouter from "../suppression.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Local-dev convenience mounts (see bottom of file) — these are the same
// handler files deployed as individual Vercel Functions in production.
// Importing them here costs nothing extra: today's single app.js bundle
// already includes all of this code together.
import postcodecheckHandler from './postcodecheck.js';
import validateMobileHandler from './validate/mobile.js';
import validateLandlineHandler from './validate/landline.js';
import validateEmailHandler from './validate/email.js';
import lookupPafHandler from './lookup/paf.js';
import lookupMobilePaymentTypeHandler from './lookup/mobile-payment-type.js';
import smsSendHandler from './sms/send.js';
import smsVerifyHandler from './sms/verify.js';
import leadHandler from './lead.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', suppressionRouter);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '..', 'views'));

// Domain-aware SSR routing — must come before express.static
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = req.hostname
    .replace(/^www\./, '')
    .replace(/\.local$/, '.nl'); // local dev: vastelastenonderzoek.local → vastelastenonderzoek.nl

  let lookupHost = host;

  //used for local mobile testing directly on phone
  const proxyHostname = process.argv[2] || '';
  if (req.hostname === proxyHostname) {
    lookupHost = 'vastelastenonderzoek.nl';
  }

  const normalizedPath = req.path !== '/' ? req.path.replace(/\/$/, '') : '/';

  const page = pages.find(p => p.domains.some(d => d.domain === lookupHost));
  const domainEntry = page?.domains.find(d => d.domain === lookupHost);
  const route = page?.routes.find(r => r.path === normalizedPath);

  if (!page || !domainEntry || !route) return next();

  const viewData = {
    ...page.defaultViewData,
    ...route.routeViewData,
    clarityId: domainEntry.clarityId,
    query: req.query,
  };
  console.log(viewData);
  res.render(route.view, viewData);
});

app.use(express.static(join(__dirname, '..', 'public')));

// ─── Sovendus clickout page ───────────────────────────────────────────────────
// Opened in a new tab from the thank-you page; renders the Sovendus integration.
app.get('/sovendus', (req, res) => {
  res.render('sovendus', {
    trafficSourceNumber: process.env.SOV_TRAFFIC_SOURCE_NUMBER || '',
    trafficMediumNumber: process.env.SOV_TRAFFIC_MEDIUM_NUMBER || '',
    sessionId:           Date.now().toString(36),
    firstName:           req.query.firstName  || '',
    lastName:            req.query.lastName   || '',
    email:               req.query.email      || '',
    zipcode:             req.query.zipcode    || '',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Local-dev convenience: mount the split-out API handlers (each its own Vercel
// Function in production) onto this same Express app so `npm run dev` keeps
// serving every route from one process, unchanged from before the split. In
// production these mounts are never reached — Vercel's filesystem routing
// intercepts /api/* at the dedicated function file before this rewrite target
// ever runs.
if (process.env.NODE_ENV !== 'test') {
  app.post('/api/postcodecheck', postcodecheckHandler);
  app.post('/api/validate/mobile', validateMobileHandler);
  app.post('/api/validate/landline', validateLandlineHandler);
  app.post('/api/validate/email', validateEmailHandler);
  app.post('/api/lookup/paf', lookupPafHandler);
  app.post('/api/lookup/mobile-payment-type', lookupMobilePaymentTypeHandler);
  app.post('/api/sms/send', smsSendHandler);
  app.post('/api/sms/verify', smsVerifyHandler);
  app.post('/api/lead', leadHandler);

  app.listen(3000, () => console.log("Proxy running on http://127.0.0.1:3000"));
}

// Export the Express app
export default app;
```

- [ ] **Step 4: Update `test/smoke.test.js`'s import path**

Find this line in `test/smoke.test.js`:

```js
import app from '../app.js';
```

Replace it with:

```js
import app from '../api/index.js';
```

- [ ] **Step 5: Update `package.json`'s dev script**

Find:

```json
"dev": "node --watch app.js",
```

Replace with:

```json
"dev": "node --watch api/index.js",
```

- [ ] **Step 6: Delete `app.js`**

```bash
rm app.js
```

- [ ] **Step 7: Run the full test suite to verify everything passes**

Run: `npx vitest run`
Expected: PASS — all 24 existing smoke tests, all tests from Tasks 1-5, and the 2 new dev-mount tests (39 tests total).

- [ ] **Step 8: Commit**

```bash
git add api/index.js test/smoke.test.js test/api-dev-mounts.test.js package.json
git rm app.js
git commit -m "Relocate app.js to api/index.js; mount split handlers for local dev"
```

---

## Task 7: Update `vercel.json`, verify end-to-end, update docs

**Files:**
- Modify: `vercel.json`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace `vercel.json`**

Current content (legacy, deprecated):

```json
{
  "version": 2,
  "builds": [
    { "src": "app.js", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/app.js" }
  ]
}
```

Replace with:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index" }
  ]
}
```

- [ ] **Step 2: Run the full test suite once more**

Run: `npx vitest run`
Expected: PASS (39 tests) — confirms the `vercel.json` change didn't affect local test running (Vitest doesn't read `vercel.json` at all; this step exists to catch any accidental collateral edits).

- [ ] **Step 3: Manually verify local dev end-to-end**

```bash
npm run dev
```

In a second terminal:

```bash
curl -s -X POST http://127.0.0.1:3000/api/validate/mobile \
  -H "Content-Type: application/json" \
  -d '{"mobile":"+31612345678"}'

curl -s -o /dev/null -w "%{http_code}\n" -H "Host: vastelastenonderzoek.nl" http://127.0.0.1:3000/
```

Expected: the first command returns JSON from the (real, since `DATABOWL_*` keys are loaded from `.env` by `npm run dev`) Databowl API; the second returns `200`. Stop the dev server afterward.

- [ ] **Step 4: Update `CLAUDE.md`**

In the `## Architecture` section, find:

```markdown
`app.js` matches the incoming `Host` header against `pages.js`, merges the data, and renders the EJS template. **To add a new site, domain, or partner route, only `pages.js` needs to be edited.**
```

Replace with:

```markdown
`api/index.js` matches the incoming `Host` header against `pages.js`, merges the data, and renders the EJS template. **To add a new site, domain, or partner route, only `pages.js` needs to be edited.**

Each `/api/*` endpoint is its own zero-config Vercel Function file under `api/` (e.g. `api/lead.js`, `api/validate/mobile.js`), not a route inside `api/index.js` — this is what lets Vercel Observability Plus show per-endpoint latency instead of one row for the whole app. Shared logic lives in `lib/databowl.js` (Databowl HMAC signing) and `lib/tracking.js` (Everflow/Facebook conversion tracking). **To add a new API endpoint, create a new file under `api/` and add its dev-mount line in `api/index.js`'s `NODE_ENV !== 'test'` block** — Vercel auto-detects the new file in production, no `vercel.json` change needed.
```

Also find the `**API endpoints** (all in \`app.js\`):` line and update it to say `**API endpoints** (each its own file under \`api/\`):`.

- [ ] **Step 5: Commit**

```bash
git add vercel.json CLAUDE.md
git commit -m "Drop legacy builds config; document per-route Vercel Functions in CLAUDE.md"
```

---

## Post-deploy verification (not a task — do this after merging and deploying)

After this deploys to Vercel, confirm in the Observability dashboard's **Vercel Functions** panel that `/api/lead`, `/api/postcodecheck`, `/api/validate/mobile`, `/api/validate/landline`, `/api/validate/email`, `/api/lookup/paf`, `/api/lookup/mobile-payment-type`, `/api/sms/send`, and `/api/sms/verify` each show up as distinct rows with their own latency data, and that a real request to `/api/lead` produces a data point under that row rather than under `/api/index`.

If any handler throws `res.status is not a function` in production logs (a known issue on Vercel's newer Rust-based Node runtime — see `docs/superpowers/specs/2026-07-20-per-route-vercel-functions-design.md`), the fix is replacing `res.status(code).json(obj)` with `res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj));` in the affected file — but this hasn't been seen in this project's existing production usage of the same helpers today, so it's not pre-emptively worked around here.
