import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/databowl.js', () => ({ databowlRequest: vi.fn() }));

import { databowlRequest } from '../lib/databowl.js';
import mobileHandler from '../api/validate/mobile.js';
import landlineHandler from '../api/validate/landline.js';
import emailHandler from '../api/validate/email.js';
import pafHandler from '../api/lookup/paf.js';
import mobilePaymentTypeHandler from '../api/lookup/mobile-payment-type.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.mocked(databowlRequest).mockReset();
});

describe('api/validate/mobile', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await mobileHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires mobile in body', async () => {
    const res = mockRes();
    await mobileHandler({ method: 'POST', body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls databowlRequest with the hlr service and returns the result', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobileHandler({ method: 'POST', body: { mobile: '+31612345678' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'hlr', { mobile: '+31612345678' });
    expect(res.json).toHaveBeenCalledWith({ result: 'live' });
  });
});

describe('api/validate/landline', () => {
  it('calls databowlRequest with the llv service', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await landlineHandler({ method: 'POST', body: { phone: '0201234567' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'llv', { phone: '0201234567' });
  });
});

describe('api/validate/email', () => {
  it('calls databowlRequest with the email service', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await emailHandler({ method: 'POST', body: { email: 'user@example.com' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('validate', 'email', { email: 'user@example.com' });
  });
});

describe('api/lookup/paf', () => {
  it('calls databowlRequest with the paf lookup', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await pafHandler({ method: 'POST', body: { postcode: 'SW1A1AA' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'paf', { postcode: 'SW1A1AA' });
  });
});

describe('api/lookup/mobile-payment-type', () => {
  it('calls databowlRequest with mobile_payment_type, including the optional network', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobilePaymentTypeHandler({ method: 'POST', body: { mobile: '447123456', network: 'O2' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'mobile_payment_type', { mobile: '447123456', network: 'O2' });
  });

  it('omits network when not provided', async () => {
    vi.mocked(databowlRequest).mockResolvedValue({ result: 'live' });
    const res = mockRes();
    await mobilePaymentTypeHandler({ method: 'POST', body: { mobile: '447123456' } }, res);
    expect(databowlRequest).toHaveBeenCalledWith('lookup', 'mobile_payment_type', { mobile: '447123456' });
  });
});
