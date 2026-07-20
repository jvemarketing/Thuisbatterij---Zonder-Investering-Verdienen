import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import { databowlRequest } from '../lib/databowl.js';
import { sha256 } from '../lib/tracking.js';

describe('sha256', () => {
  it('trims and lowercases before hashing', () => {
    const expected = crypto.createHash('sha256').update('user@example.com').digest('hex');
    expect(sha256('  User@Example.COM  ')).toBe(expected);
  });
});

describe('databowlRequest', () => {
  beforeEach(() => {
    process.env.DATABOWL_PUBLIC_KEY = 'pub-key';
    process.env.DATABOWL_PRIVATE_KEY = 'priv-key';
    vi.mocked(fetch).mockReset();
  });

  it('builds a signed URL with literal brackets and percent-encoded values, and returns parsed JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: 'live' }) });

    const result = await databowlRequest('validate', 'hlr', { mobile: '+31612345678' });

    expect(result).toEqual({ result: 'live' });
    const calledUrl = vi.mocked(fetch).mock.calls[0][0];
    expect(calledUrl).toContain('key=pub-key');
    expect(calledUrl).toContain('service=validate');
    expect(calledUrl).toContain('type=hlr');
    expect(calledUrl).toContain('data[mobile]=%2B31612345678');
  });
});
