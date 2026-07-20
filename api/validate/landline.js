import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/landline   { phone: "0201234567" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const result = await databowlRequest("validate", "llv", { phone });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
