import twilio from "twilio";

// Separate Twilio account from the rest of the site (see env vars below) —
// De Grote Bespaarcheck is billed independently.
function getTwilioClient() {
  return twilio(process.env.BESPAARCHECK_TWILIO_ACCOUNT_SID, process.env.BESPAARCHECK_TWILIO_AUTH_TOKEN);
}

const BRAND_OPT_OUT_LINKS = {
  vle: 'https://vastelastenexperts.nl/toestemming-intrekken/',
  hoekstra: 'https://hoekstraondernemersadvies.nl/toestemming-intrekken/',
};
const BRAND_SENDER_NAMES = {
  vle: 'VLExperts',
  hoekstra: 'Hoekstra',
};
const DEFAULT_BRAND = 'vle';

// POST /api/bespaarcheck-sms-send   { phone: "+31612345678", firstName: "Jan", brand: "vle" | "hoekstra" }
//
// Same double opt-in pattern as the rest of the site (one shared code from
// the BESPAARCHECK_SMS_VERIFY_CODE env var, texted via plain Twilio SMS) —
// avoids Twilio Verify's per-check fee, only the per-SMS send cost.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone, firstName, brand } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const name = firstName || 'deelnemer';
    const key = BRAND_OPT_OUT_LINKS[brand] ? brand : DEFAULT_BRAND;
    const optOutLink = BRAND_OPT_OUT_LINKS[key];
    const senderName = BRAND_SENDER_NAMES[key];
    const message = `Beste ${name}, Gebruik verificatiecode ${process.env.BESPAARCHECK_SMS_VERIFY_CODE} om je deelname op de-grote-bespaarcheck.nl te bevestigen. Afmelden: ${optOutLink}`;

    await getTwilioClient().messages.create({
      body: message,
      from: senderName,
      to: phone,
    });
    res.json({ sent: true, doi_sent_time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
