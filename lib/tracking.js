import fetch from "node-fetch";
import crypto from "crypto";

const EVERFLOW_POSTBACK_URL = "https://www.jh5th1trk.com/";

// Domain → Facebook pixel config. Add one entry per domain that needs FB conversion tracking.
export const FB_PIXEL_CONFIG = {
  'verdienduurzamer.nl': {
    pixelId: "4513411092222816",
    token: "EAALWuyeezx4BRgfv1yQs0TUuN5K4eP0JAWnedI4HFOZAUlarSmqHLBbMjJmczmTBnGW4Jke2ZBzOeiZBRG4RXZBPPyzdCgV2Um8TDJx5JO5zulupGoJYgiUZAGBM4s0v2ZAZAqIpmNCXsIuA3HXW1A1ovsLzo6dlmGjKSFm8L3P58lQTITGob5MB9OnwsYh9wZDZD",
  },
  'verdienduurzamer.local': {
    pixelId: "937971222531441",
    token: "EAAbdZANluGEkBRU21QKutVVWlhL1e6cd90rn4ByzJMhXta6LbiZANqBoe92ZCZBlbrSUTFQpNCAMC0lbDmWJzpdxXGKBsHqnZBUn4PSo4vA3JyYir6ECIuIzudpQ8FmWlgDoZBsUTQwJjCvDtMjoZCBQHD2ngb9rUQQhOYewGqjhBB2ohoTYF57YdNCSM6f3j0bJwZDZD",
  },
  'vastenlastenonderzoek.nl': {
    pixelId: "4513411092222816",
    token: "EAALWuyeezx4BRpHQQCh2NRXXyEKXgZBDzduK5QWK3xc6R7ZCKc9WZCi7WNplSgX8ZCtan0BAIkI2UdHuwx5T0wC6W3EC0fzJlUdZAJRm0e0qOIYTv2Jt609ZA3vAeR2EhM8znduZBOqMZBOhZA1MYa2vyOgPrkxlLR4pHvT0uZAV5faws0M3Amg6pQWmIZCruNX8wZDZD",
  },
};

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// Fire Everflow conversion postback
export async function fireEverflowPostback(transactionId, leadId, leadContactData = {}) {
  try {
    const postbackUrl = new URL(EVERFLOW_POSTBACK_URL);
    postbackUrl.searchParams.set('nid', '3773');
    postbackUrl.searchParams.set('transaction_id', transactionId);

    if (leadContactData.adv1) postbackUrl.searchParams.set('adv1', leadContactData.adv1);
    if (leadContactData.adv2) postbackUrl.searchParams.set('adv2', leadContactData.adv2);
    if (leadContactData.adv3) postbackUrl.searchParams.set('adv3', leadContactData.adv3);

    console.log(`Firing Everflow postback for transaction ${transactionId}, lead ${leadId}:`, postbackUrl.toString());

    const response = await fetch(postbackUrl.toString(), {
      method: 'GET',
      headers: { 'User-Agent': 'VerdienDuurzaam/1.0' }
    });

    if (!response.ok) {
      console.error(`Everflow postback failed with status ${response.status}`);
    } else {
      console.log(`Everflow postback successful for transaction ${transactionId}`);
    }
  } catch (error) {
    console.error('Everflow postback error:', error);
    throw error;
  }
}

// Fire Facebook Conversions API event
export async function fireFacebookConversion(fbConfig, fbTracking, req, body = {}) {
  const { pixelId, token } = fbConfig;
  const { fbclid } = fbTracking;
  const eventTime = Math.floor(Date.now() / 1000);

  const userData = {
    fbc:               `fb.1.${eventTime}.${fbclid}`,
    client_ip_address: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '',
    client_user_agent: req.headers['user-agent'] || '',
  };

  if (body.f_1_email)    userData.em      = sha256(body.f_1_email);
  if (body.f_3_firstname) userData.fn     = sha256(body.f_3_firstname);
  if (body.f_4_lastname)  userData.ln     = sha256(body.f_4_lastname);
  if (body.f_11_postcode) userData.zp     = sha256(body.f_11_postcode.replace(/\s+/g, ''));
  if (body.f_40_city)     userData.ct     = sha256(body.f_40_city);
  if (body.f_10_county)   userData.st     = sha256(body.f_10_county);
  if (body.f_12_phone1)   userData.ph     = sha256(body.f_12_phone1.replace(/\D/g, ''));
  // DOB stored as YYYY-MM-DD — Facebook wants YYYYMMDD
  if (body.f_5_dob)       userData.db     = sha256(body.f_5_dob.replace(/-/g, ''));
  userData.country = sha256('nl');

  const payload = {
    data: [{
      event_name:    'Lead',
      event_time:    eventTime,
      action_source: 'website',
      user_data:     userData,
    }],
  };

  const url = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${token}`;
  console.log(userData);
  console.log(`[facebook] pixel=${pixelId} event=Lead fbclid=${fbclid}`);

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(`Facebook Conversions API ${r.status}: ${JSON.stringify(json)}`);
  console.log('[facebook] ✓', json);
}
