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
      postalcode: String(req.query.postalCode ?? req.query.postalcode ?? "").replace(/\s+/g, "").toUpperCase(),
      housenumber: String(req.query.houseNumber ?? req.query.housenumber ?? ""),
      housenumberaddition: String(req.query.houseNumberAddition ?? req.query.housenumberaddition ?? ""),
    };

    const r = await fetch(
      "https://api.postnl.nl/shipment/checkout/v1/postalcodecheck?postalcode=" + payload.postalcode + "&housenumber=" + payload.housenumber + "&housenumberaddition=" + payload.housenumberaddition,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.POSTNL_API_KEY,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(8080, () => console.log("Proxy running on http://127.0.0.1:8080"));