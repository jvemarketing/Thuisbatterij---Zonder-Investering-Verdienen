import { describe, it, expect, vi, beforeEach } from 'vitest';

const messagesCreate = vi.fn();
vi.mock('twilio', () => ({
  default: vi.fn(() => ({ messages: { create: messagesCreate } })),
}));

import sendHandler from '../api/bespaarcheck-sms-send.js';
import verifyHandler from '../api/bespaarcheck-sms-verify.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  messagesCreate.mockReset().mockResolvedValue({});
  process.env.BESPAARCHECK_SMS_VERIFY_CODE = '1234';
});

describe('api/bespaarcheck-sms-send', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await sendHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires phone', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sends the VLE-branded SMS and reports sent:true', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan', brand: 'vle' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith({
      body: expect.stringContaining('vastelastenexperts.nl/toestemming-intrekken'),
      from: 'VLExperts',
      to: '+31612345678',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sent: true }));
  });

  it('sends the Hoekstra-branded SMS when brand is hoekstra', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan', brand: 'hoekstra' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining('hoekstraondernemersadvies.nl/toestemming-intrekken'),
        from: 'Hoekstra',
      })
    );
  });

  it('falls back to the VLE brand for an unknown brand value', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan', brand: 'nonsense' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith(expect.objectContaining({ from: 'VLExperts' }));
  });

  it('uses a separate Twilio account from the rest of the site', async () => {
    const twilio = (await import('twilio')).default;
    process.env.BESPAARCHECK_TWILIO_ACCOUNT_SID = 'bespaarcheck-sid';
    process.env.BESPAARCHECK_TWILIO_AUTH_TOKEN = 'bespaarcheck-token';
    process.env.TWILIO_ACCOUNT_SID = 'other-sid';
    process.env.TWILIO_AUTH_TOKEN = 'other-token';
    const res = mockRes();

    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan' } }, res);

    expect(twilio).toHaveBeenCalledWith('bespaarcheck-sid', 'bespaarcheck-token');
  });

  it('sends the code from BESPAARCHECK_SMS_VERIFY_CODE', async () => {
    process.env.BESPAARCHECK_SMS_VERIFY_CODE = '7777';
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.stringContaining('7777') })
    );
  });
});

describe('api/bespaarcheck-sms-verify', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('reports verified:true for the correct code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '1234' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it('reports verified:false for the wrong code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '0000' } }, res);
    expect(res.json).toHaveBeenCalledWith({ verified: false });
  });

  it('is independent of the shared SMS_VERIFY_CODE env var', async () => {
    process.env.SMS_VERIFY_CODE = '1234';
    process.env.BESPAARCHECK_SMS_VERIFY_CODE = '5678';
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '1234' } }, res);
    expect(res.json).toHaveBeenCalledWith({ verified: false });
  });
});
