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
