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
