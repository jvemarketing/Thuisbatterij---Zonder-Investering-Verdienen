import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import app from '../api/index.js';

describe('local dev mounts the split-out API handlers on the same Express app', () => {
  it('serves POST /api/validate/mobile', async () => {
    vi.mocked(fetch).mockResolvedValue({ json: async () => ({ result: 'live' }) });
    process.env.DATABOWL_PUBLIC_KEY = 'pub';
    process.env.DATABOWL_PRIVATE_KEY = 'priv';

    await request(app)
      .post('/api/validate/mobile')
      .send({ mobile: '+31612345678' })
      .expect(200);
  });

  it('serves POST /api/postcodecheck', async () => {
    vi.mocked(fetch).mockResolvedValue({ status: 200, text: async () => '{}' });

    await request(app)
      .post('/api/postcodecheck')
      .send({ postalCode: '1012JK', houseNumber: '1' })
      .expect(200);
  });
});
