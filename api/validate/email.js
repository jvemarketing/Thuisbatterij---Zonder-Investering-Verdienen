import { databowlRequest } from "../../lib/databowl.js";

// POST /api/validate/email   { email: "user@example.com" }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  console.log('public: ' + process.env.DATABOWL_PUBLIC_KEY);
  console.log('private: ' + process.env.DATABOWL_PRIVATE_KEY);

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });
    const result = await databowlRequest("validate", "email", { email });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
