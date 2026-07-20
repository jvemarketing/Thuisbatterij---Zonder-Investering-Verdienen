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
