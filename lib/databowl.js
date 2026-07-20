import fetch from "node-fetch";
import crypto from "crypto";

const DATABOWL_BASE = "https://jve.databowl.com/api/v1/validation";

export function databowlRequest(service, type, data) {
  const timestamp = Math.floor(Date.now() / 1000);

  // Signature string must be raw (no URL-encoding), brackets literal
  // Format: timestamp=<ts>&service=<s>&type=<t>&data[key]=value
  let stringToSign = `timestamp=${timestamp}&service=${service}&type=${type}`;
  for (const [k, v] of Object.entries(data)) {
    stringToSign += `&data[${k}]=${v}`;
  }

  const signature = crypto
    .createHmac("sha256", process.env.DATABOWL_PRIVATE_KEY)
    .update(stringToSign)
    .digest("hex");

  // Build URL manually — URLSearchParams encodes [ ] to %5B%5D which breaks Databowl parsing
  let url = `${DATABOWL_BASE}?key=${process.env.DATABOWL_PUBLIC_KEY}&timestamp=${timestamp}&signature=${signature}&service=${service}&type=${type}`;
  for (const [k, v] of Object.entries(data)) {
    url += `&data[${k}]=${encodeURIComponent(v)}`;
  }

  return fetch(url).then((r) => r.json());
}
