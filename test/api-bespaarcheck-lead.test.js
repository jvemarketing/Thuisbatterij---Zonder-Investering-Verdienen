import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import handler from '../api/bespaarcheck-lead.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function baseReq(body) {
  return { method: 'POST', body };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  process.env = { ...ORIGINAL_ENV };
});

describe('api/bespaarcheck-lead', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('returns 503 when the webhook URL is not configured', async () => {
    delete process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL;
    const res = mockRes();

    await handler(baseReq({ voornaam: 'Jan' }), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('forwards the lead to the configured webhook and returns created on success', async () => {
    process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/abc/exec';
    process.env.BESPAARCHECK_SHEETS_SECRET = 'topsecret';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ result: 'created' }),
    });
    const res = mockRes();

    await handler(baseReq({ voornaam: 'Jan', email: 'jan@example.com' }), res);

    expect(fetch).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/abc/exec',
      expect.objectContaining({ method: 'POST' })
    );
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody.voornaam).toBe('Jan');
    expect(sentBody.secret).toBe('topsecret');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: 'created' });
  });

  it('returns 502 when the webhook rejects the lead', async () => {
    process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/abc/exec';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ result: 'error', error: 'invalid secret' }),
    });
    const res = mockRes();

    await handler(baseReq({ voornaam: 'Jan' }), res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('returns 502 when the webhook response is not valid JSON', async () => {
    process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/abc/exec';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => '<html>not json</html>',
    });
    const res = mockRes();

    await handler(baseReq({ voornaam: 'Jan' }), res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('returns 500 when the fetch itself throws', async () => {
    process.env.BESPAARCHECK_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/abc/exec';
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));
    const res = mockRes();

    await handler(baseReq({ voornaam: 'Jan' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
