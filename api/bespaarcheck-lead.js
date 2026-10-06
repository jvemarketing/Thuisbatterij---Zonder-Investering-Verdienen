import fetch from "node-fetch";

// POST /api/bespaarcheck-lead
// Body (JSON): the full lead payload built client-side by views/bespaarcheck/index.ejs
// (aanhef, voornaam, achternaam, geboortedatum, email, postcode, huisnummer,
// toevoeging, straat, plaats, stateName, telefoon, consent, antwoorden, utm, ...).
//
// Forwards the lead to a Google Apps Script Web App (bound to the lead
// spreadsheet) configured via BESPAARCHECK_SHEETS_WEBHOOK_URL. The webhook
// URL and shared secret stay server-side only — the browser never sees them.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const webhookUrl = process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("BESPAARCHECK_SHEETS_WEBHOOK_URL not configured — lead not stored:", req.body);
      return res.status(503).json({ result: "error", error: "Lead storage not configured" });
    }

    const payload = {
      ...req.body,
      secret: process.env.BESPAARCHECK_SHEETS_SECRET || "",
      received_at: new Date().toISOString(),
    };

    console.log("Sending bespaarcheck lead to Google Sheets webhook:", { ...payload, secret: "[redacted]" });

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!r.ok || json.result !== "created") {
      console.warn("Google Sheets webhook rejected the lead:", json);
      return res.status(502).json({ result: "error", detail: json });
    }

    res.status(200).json({ result: "created" });
  } catch (e) {
    res.status(500).json({ result: "error", error: String(e) });
  }
}
