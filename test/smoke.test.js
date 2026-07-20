import { describe, it } from 'vitest';
import request from 'supertest';
import { vi } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import app from '../api/index.js';
import pages from '../pages.js';

// Build the full route matrix from pages.js so the test list stays in sync automatically
const cases = pages.flatMap(page =>
  page.domains.flatMap(({ domain }) =>
    page.routes.map(route => ({ domain, path: route.path }))
  )
);

describe('smoke — all routes return 200', () => {
  for (const { domain, path } of cases) {
    it(`${domain}${path}`, async () => {
      await request(app)
        .get(path)
        .set('Host', domain)
        .expect(200);
    });
  }
});
