import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const payload = {
      postalcode: String(req.body.postalCode ?? req.body.postalcode ?? "").replace(/\s+/g, "").toUpperCase(),
      housenumber: String(req.body.houseNumber ?? req.body.housenumber ?? ""),
      housenumberaddition: String(req.body.houseNumberAddition ?? req.body.housenumberaddition ?? ""),
    };

    const BASE_URL = "https://api.postnl.nl/v2/address/benelux";
    const url = new URL(BASE_URL);
    url.searchParams.set("postalCode", payload.postalcode);
    url.searchParams.set("houseNumber", String(parseInt(payload.housenumber) || 0));
    url.searchParams.set("countryIso", 'NL');

    const r = await fetch(url.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.POSTNL_API_KEY,
          Accept: "application/json",
        }
      }
    );

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
