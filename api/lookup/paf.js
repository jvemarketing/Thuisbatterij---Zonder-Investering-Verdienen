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
