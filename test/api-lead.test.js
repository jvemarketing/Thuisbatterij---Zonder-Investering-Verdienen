import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@vercel/functions', () => ({ waitUntil: vi.fn() }));
vi.mock('../lib/tracking.js', () => ({
  FB_PIXEL_CONFIG: {},
  fireEverflowPostback: vi.fn().mockResolvedValue(undefined),
  fireFacebookConversion: vi.fn().mockResolvedValue(undefined),
}));

import fetch from 'node-fetch';
import { waitUntil } from '@vercel/functions';
import { fireEverflowPostback } from '../lib/tracking.js';
import handler from '../api/lead.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function baseReq(body) {
  return {
    method: 'POST',
    body,
    headers: { host: 'verdienduurzaam.nl' },
    socket: { remoteAddress: '127.0.0.1' },
  };
}

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  vi.mocked(waitUntil).mockReset();
  vi.mocked(fireEverflowPostback).mockReset().mockResolvedValue(undefined);
});

describe('api/lead', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires cid and sid', async () => {
    const res = mockRes();
    await handler(baseReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('forwards the lead to Databowl and returns its response on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();

    await handler(baseReq({ cid: '925', sid: '1', f_1_email: 'a@b.com' }), res);

    expect(fetch).toHaveBeenCalledWith(
      'https://jve.databowl.com/api/v1/lead',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: 'created', lead_id: '123' });
  });

  it('returns 409 for a duplicate lead instead of the raw Databowl status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'error', error: { msg: 'DUPLICATE_LEAD' } }),
    });
    const res = mockRes();

    await handler(baseReq({ cid: '925', sid: '1' }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('schedules the Everflow postback via waitUntil when ef_click_id is present', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();

    await handler(
      baseReq({ cid: '925', sid: '1', everflow_tracking: { ef_click_id: 'click-1' } }),
      res
    );

    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it('derives the hostname from the Host header, not req.hostname', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      json: async () => ({ result: 'created', lead_id: '123' }),
    });
    const res = mockRes();
    const req = baseReq({ cid: '925', sid: '1' });
    req.headers.host = 'verdienduurzaam.nl:8080';

    await handler(req, res);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new URLSearchParams(options.body).get('f_1288_lead_source_url')).toBe('verdienduurzaam.nl');
  });
});
