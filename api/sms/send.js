import twilio from "twilio";

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Per-partner opt-out link shown in the double opt-in SMS; falls back to the
// site's own opt-out page for partners without their own preference center.
const PARTNER_OPT_OUT_LINKS = {
  ebned: 'https://ebned.nl/privacyvoorkeuren',
};
const DEFAULT_OPT_OUT_LINK = 'vastelastenexperts.nl/toestemming-intrekken';

// Partners needing a full custom closing sentence instead of the generic
// "Afmelden: <link>" — e.g. wij-vergelijken's sentence names the original
// consent entity ("Vaste Lasten Onderzoek"), not the on-page partner brand.
// See Asana task 1219246685521505.
const PARTNER_OPT_OUT_TEXT = {
  'wij-vergelijken': 'Wil je telemarketing toestemming voor Vaste Lasten Onderzoek intrekken? Klik dan hier: https://wij-vergelijken.nl/toestemming-intrekken/',
};

// POST /api/sms/send   { phone: "+31612345678", firstName: "Jan", partner: "ebned" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone, firstName, partner } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const name = firstName || 'deelnemer';
    const optOutLink = PARTNER_OPT_OUT_LINKS[partner] || DEFAULT_OPT_OUT_LINK;
    const optOutText = PARTNER_OPT_OUT_TEXT[partner] || `Afmelden: ${optOutLink}`;
    const message = `Beste ${name}, Gebruik verificatiecode ${process.env.SMS_VERIFY_CODE} om je deelname op vastelastenonderzoek.nl te bevestigen. ${optOutText}`;

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
