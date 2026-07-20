import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/mobile   { mobile: "+31612345678" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "mobile is required" });
    const result = await databowlRequest("validate", "hlr", { mobile });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
