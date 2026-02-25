import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// vi.mock is hoisted before imports, so node-fetch is mocked before app.js loads it
vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import app from '../app.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Set up fetch to resolve with a JSON response for the next call. */
function mockFetch(body, status = 200) {
  fetch.mockResolvedValueOnce({
    status,
    json: () => Promise.resolve(body),
  });
}

/** Parse the URL-encoded body that was sent in the last fetch call. */
function lastRequestBody() {
  const calls = fetch.mock.calls;
  const [, options] = calls[calls.length - 1];
  return new URLSearchParams(options.body);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/lead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the Databowl response on success', async () => {
    mockFetch({ result: 'created', lead_id: 'abc123' });

    const res = await request(app)
      .post('/api/lead')
      .send({
        voornaam: 'Jan', achternaam: 'Jansen',
        email: 'jan@example.com',
        postcode: '1234AB', huisnummer: '10', toevoeging: 'A',
        straat: 'Hoofdstraat', gemeente: 'Amsterdam',
        newsletter: true,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ result: 'created', lead_id: 'abc123' });
  });

  it('maps all frontend field names to their Databowl equivalents', async () => {
    mockFetch({ result: 'created', lead_id: '1' });

    await request(app).post('/api/lead').send({
      voornaam: 'Jan', achternaam: 'Jansen',
      email: 'jan@example.com',
      postcode: '1234AB', huisnummer: '10', toevoeging: 'A',
      straat: 'Hoofdstraat', gemeente: 'Amsterdam',
      newsletter: false,
    });

    const body = lastRequestBody();
    expect(body.get('f_3_firstname')).toBe('Jan');
    expect(body.get('f_4_lastname')).toBe('Jansen');
    expect(body.get('f_1_email')).toBe('jan@example.com');
    expect(body.get('f_11_postcode')).toBe('1234AB');
    expect(body.get('f_6_address1')).toBe('10');
    expect(body.get('f_7_address2')).toBe('A');
    expect(body.get('f_991_street_name')).toBe('Hoofdstraat');
    expect(body.get('f_9_towncity')).toBe('Amsterdam');
  });

  it('sets optin_* fields to "true" when newsletter is true', async () => {
    mockFetch({ result: 'created', lead_id: '2' });

    await request(app).post('/api/lead').send({ newsletter: true });

    const body = lastRequestBody();
    expect(body.get('optin_email')).toBe('true');
    expect(body.get('optin_phone')).toBe('true');
    expect(body.get('optin_sms')).toBe('true');
    expect(body.get('optin_email_timestamp')).toBeTruthy();
    expect(body.get('optin_phone_timestamp')).toBeTruthy();
    expect(body.get('optin_sms_timestamp')).toBeTruthy();
  });

  it('sets optin_* fields to "false" when newsletter is false', async () => {
    mockFetch({ result: 'created', lead_id: '3' });

    await request(app).post('/api/lead').send({ newsletter: false });

    const body = lastRequestBody();
    expect(body.get('optin_email')).toBe('false');
    expect(body.get('optin_phone')).toBe('false');
    expect(body.get('optin_sms')).toBe('false');
  });

  it('includes cid and sid sourced from environment variables', async () => {
    mockFetch({ result: 'created', lead_id: '4' });

    await request(app).post('/api/lead').send({ newsletter: false });

    const body = lastRequestBody();
    expect(body.get('cid')).toBe(process.env.DATABOWL_CID ?? '892');
    expect(body.get('sid')).toBe(process.env.DATABOWL_SID ?? '34');
  });

  it('omits fields whose value is empty or absent', async () => {
    mockFetch({ result: 'created', lead_id: '5' });

    await request(app).post('/api/lead').send({
      email: 'a@b.com',
      voornaam: '',   // empty string — must be omitted
      toevoeging: '', // empty string — must be omitted
      newsletter: false,
    });

    const body = lastRequestBody();
    expect(body.has('f_1_email')).toBe(true);        // present
    expect(body.has('f_3_firstname')).toBe(false);   // empty voornaam omitted
    expect(body.has('f_7_address2')).toBe(false);    // empty toevoeging omitted
    expect(body.has('f_9_towncity')).toBe(false);    // absent gemeente omitted
  });

  it('posts to the correct Databowl URL with application/x-www-form-urlencoded', async () => {
    mockFetch({ result: 'created', lead_id: '6' });

    await request(app).post('/api/lead').send({ newsletter: false });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://jve.databowl.com/api/v1/lead');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  });

  it('passes through a Databowl error response unchanged', async () => {
    mockFetch({ result: 'error', error: { msg: 'MISSING_FIELD' } });

    const res = await request(app).post('/api/lead').send({ newsletter: false });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('error');
    expect(res.body.error.msg).toBe('MISSING_FIELD');
  });

  it('returns 500 when the Databowl request throws', async () => {
    fetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await request(app).post('/api/lead').send({ newsletter: false });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch('ECONNREFUSED');
  });
});