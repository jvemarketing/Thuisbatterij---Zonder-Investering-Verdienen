// POST /api/bespaarcheck-sms-verify   { code: "1234" }
// Checked against the BESPAARCHECK_SMS_VERIFY_CODE env var — same shared
// static-code pattern as the rest of the site, kept separate because
// De Grote Bespaarcheck uses its own Twilio account (see
// api/bespaarcheck-sms-send.js).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code is required" });
    const verified = code.trim() === process.env.BESPAARCHECK_SMS_VERIFY_CODE;
    const result = { verified };
    if (verified) result.doi_confirmed_time = new Date().toISOString();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
