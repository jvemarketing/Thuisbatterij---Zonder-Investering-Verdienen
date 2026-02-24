import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

console.log(process.env.POSTNL_API_KEY);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/api/postcodecheck", async (req, res) => {
  try {
    const payload = {
      postalcode: String(req.body.postalCode ?? req.body.postalcode ?? "").replace(/\s+/g, "").toUpperCase(),
      housenumber: String(req.body.houseNumber ?? req.body.housenumber ?? ""),
      housenumberaddition: String(req.body.houseNumberAddition ?? req.body.housenumberaddition ?? ""),
    };

    const BASE_URL = "https://api.postnl.nl/v2/address/benelux";
    const url = new URL(BASE_URL);
    url.searchParams.set("postalCode", payload.postalcode);
    url.searchParams.set("houseNumber", parseInt(payload.housenumber) || 0);
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
});

app.listen(8080, () => console.log("Proxy running on http://127.0.0.1:8080"));

// Export the Express app
export default app;