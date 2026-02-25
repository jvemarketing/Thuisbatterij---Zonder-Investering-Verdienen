import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

console.log(process.env.DATABOWL_PUBLIC_KEY);
console.log(process.env.DATABOWL_PRIVATE_KEY);

app.use(express.static('public'));

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

// ─── Lead submission ──────────────────────────────────────────────────────────

const LEAD_ENDPOINT = "https://jve.databowl.com/api/v1/lead";

// Maps incoming JSON keys (from the frontend) → Databowl field names.
// Update this object when the campaign fields change — no other code needs touching.
const LEAD_FIELD_MAP = {
  email:      "f_1_email",
  voornaam:   "f_3_firstname",
  achternaam: "f_4_lastname",
  straat:     "f_991_street_name",
  huisnummer: "f_6_address1",
  toevoeging: "f_7_address2",
  postcode:   "f_11_postcode",
  gemeente:   "f_9_towncity",
  // telefoon: "f_??_mobile",  // add once the campaign exposes a mobile custom field
};

// POST /api/lead
// Body (JSON): { voornaam, achternaam, email, telefoon, postcode, huisnummer,
//               toevoeging, straat, gemeente, newsletter, ... }
// Response: Databowl JSON — { result: "created"|"error", lead_id, error? }
app.post("/api/lead", async (req, res) => {
  try {
    const body = req.body;
    const now = new Date().toISOString();

    // Fixed campaign params — change via env vars without touching code
    const params = {
      cid: process.env.DATABOWL_CID ?? "892",
      sid: process.env.DATABOWL_SID ?? "34",
    };

    // Optin consent — newsletter checkbox drives all optin channels
    const optin = body.newsletter ? "true" : "false";
    params.optin_email          = optin;
    params.optin_email_timestamp = now;
    params.optin_phone          = optin;
    params.optin_phone_timestamp = now;
    params.optin_sms            = optin;
    params.optin_sms_timestamp   = now;

    // Map frontend fields → Databowl fields; omit blank / missing values
    for (const [inKey, outKey] of Object.entries(LEAD_FIELD_MAP)) {
      const val = body[inKey];
      if (val !== undefined && val !== null && val !== "") {
        params[outKey] = String(val);
      }
    }

    const r = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });

    const json = await r.json();
    res.status(r.status).json(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  //app.listen(8080, () => console.log("Proxy running on http://127.0.0.1:8080"));
}

// Export the Express app
export default app;