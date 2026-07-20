import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import handler from '../api/postcodecheck.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  process.env.POSTNL_API_KEY = 'test-key';
});

describe('api/postcodecheck', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('normalizes the postal code and forwards the PostNL response verbatim', async () => {
    vi.mocked(fetch).mockResolvedValue({ status: 200, text: async () => '{"street":"Damrak"}' });
    const req = { method: 'POST', body: { postalCode: '1012 jk', houseNumber: '1' } };
    const res = mockRes();

    await handler(req, res);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0];
    expect(calledUrl).toContain('postalCode=1012JK');
    expect(calledUrl).toContain('houseNumber=1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"street":"Damrak"}');
  });
});
