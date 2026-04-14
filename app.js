import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";
import { waitUntil } from "@vercel/functions";
import twilio from "twilio";
import routes from "./routes.js";
import suppressionRouter from "./suppression.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', suppressionRouter);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Domain-aware SSR routing — must come before express.static
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = req.hostname
    .replace(/^www\./, '')
    .replace(/\.local$/, '.nl'); // local dev: vastelastenonderzoek.local → vastelastenonderzoek.nl

  let route = routes.find(r => r.domain === host && req.path === r.path);

  //used for local mobile testing directly on phone
  const proxyHostname = process.argv[2] || '';

  console.log(proxyHostname);

  if (req.hostname === proxyHostname) {
    const domainToTest = 'vastelastenonderzoek.nl';
    const pathToTest = "/";
    console.log(host, req.path);
    route = routes.find(r => r.domain === domainToTest && req.path === pathToTest);
    console.log(route);
  }

  if (!route) return next();
  console.log({ ...route.data, query: req.query });
  res.render(route.view, { ...route.data, query: req.query });
});

app.use(express.static(join(__dirname, 'public')));

app.post("/api/postcodecheck", async (req, res) => {
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
});

// ─── Databowl Validation API proxy ───────────────────────────────────────────

const DATABOWL_BASE = "https://jve.databowl.com/api/v1/validation";

function databowlRequest(service, type, data) {
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

  console.log('fetching test ' + url);
  return fetch(url).then((r) => r.json());
}

// POST /api/validate/mobile   { mobile: "+31612345678" }
app.post("/api/validate/mobile", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });
    const result = await databowlRequest("validate", "hlr", { mobile });
    //res.json({result: 'live'});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/validate/landline   { phone: "0201234567" }
app.post("/api/validate/landline", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const result = await databowlRequest("validate", "llv", { phone });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/validate/email   { email: "user@example.com" }
app.post("/api/validate/email", async (req, res) => {

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
});

// POST /api/lookup/paf   { postcode: "SW1A1AA" }
app.post("/api/lookup/paf", async (req, res) => {
  try {
    const { postcode } = req.body;
    if (!postcode) return res.status(400).json({ error: "postcode is required" });
    const result = await databowlRequest("lookup", "paf", { postcode });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/lookup/mobile-payment-type   { mobile: "44712345678", network?: "O2" }
app.post("/api/lookup/mobile-payment-type", async (req, res) => {
  try {
    const { mobile, network } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });
    const data = network ? { mobile, network } : { mobile };
    const result = await databowlRequest("lookup", "mobile_payment_type", data);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── SMS verification via Twilio Programmable Messaging ──────────────────────

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// POST /api/sms/send   { phone: "+31612345678", firstName: "Jan" }
app.post("/api/sms/send", async (req, res) => {
  try {
    const { phone, firstName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const name = firstName || 'deelnemer';
    const message = `Beste ${name}, Gebruik verificatiecode 4463 om je deelname www.vastelastenonderzoek.nl te bevestigen.`;

    await getTwilioClient().messages.create({
      body: message,
      from: "Onderzoek",
      to: phone,
    });
    res.json({ sent: true, doi_sent_time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/sms/verify   { code: "4463" }
app.post("/api/sms/verify", async (req, res) => {
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
});

// ─── Lead submission ──────────────────────────────────────────────────────────

const LEAD_ENDPOINT = "https://jve.databowl.com/api/v1/lead";
const EVERFLOW_POSTBACK_URL = "https://www.jh5th1trk.com/";

// Maps incoming JSON keys (from the frontend) → Databowl field names.
// Update this object when the campaign fields change — no other code needs touching.
// POST /api/lead
// Body (JSON): already-mapped Databowl field names (f_*) + newsletter boolean.
// The frontend (flow.html) applies LEAD_FIELD_MAP before sending, so this
// handler just forwards all fields directly — no mapping needed here.
// Response: Databowl JSON — { result: "created"|"error", lead_id, error? }
app.post("/api/lead", async (req, res) => {
  try {
    const body = req.body;
    const now = new Date().toISOString();

    // Extract Everflow tracking data (not sent to Databowl)
    const everflowTracking = body.everflow_tracking || null;

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
    params.f_1288_lead_source_url  = `${req.protocol}://${req.hostname}${req.originalUrl}`;

    // Optin consent — newsletter checkbox drives all optin channels
    const optin = body.newsletter ? "true" : "false";
    params.optin_email           = optin;
    params.optin_email_timestamp = now;
    params.optin_phone           = optin;
    params.optin_phone_timestamp = now;
    params.optin_sms             = optin;
    params.optin_sms_timestamp   = now;

    // Forward all pre-mapped fields from the frontend; skip internal keys
    const skip = new Set(["newsletter", "cid", "sid", "everflow_tracking"]);
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

    // Fire Everflow postback on successful conversion
    if (json.result === "created" && everflowTracking?.ef_click_id) {
      // Use Vercel's waitUntil to ensure postback completes before function shutdown
      waitUntil(
        fireEverflowPostback(everflowTracking.ef_click_id, json.lead_id)
          .catch(err => {
            console.error('❌ Everflow postback error:', err);
            console.error('Error stack:', err.stack);
          })
      );
      console.log('✓ Everflow postback scheduled with waitUntil');
    }

    res.status(r.status).json(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Fire Everflow conversion postback
async function fireEverflowPostback(transactionId, leadId) {
  try {

    const postbackUrl = new URL(EVERFLOW_POSTBACK_URL);
    postbackUrl.searchParams.set('nid', '3773');
    postbackUrl.searchParams.set('transaction_id', transactionId);

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log("Proxy running on http://127.0.0.1:3000"));
}

// Export the Express app
export default app;