import { describe, it, expect, vi, beforeEach } from 'vitest';

const messagesCreate = vi.fn();
vi.mock('twilio', () => ({
  default: vi.fn(() => ({ messages: { create: messagesCreate } })),
}));

import sendHandler from '../api/sms/send.js';
import verifyHandler from '../api/sms/verify.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  messagesCreate.mockReset().mockResolvedValue({});
  process.env.SMS_VERIFY_CODE = '4463';
});

describe('api/sms/send', () => {
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

  it('sends the verification SMS and reports sent:true', async () => {
    const res = mockRes();
    await sendHandler({ method: 'POST', body: { phone: '+31612345678', firstName: 'Jan' } }, res);

    expect(messagesCreate).toHaveBeenCalledWith({
      body: expect.stringContaining('Beste Jan'),
      from: 'Onderzoek',
      to: '+31612345678',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sent: true }));
  });
});

describe('api/sms/verify', () => {
  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'GET' }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('reports verified:true for the correct code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '4463' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it('reports verified:false for the wrong code', async () => {
    const res = mockRes();
    await verifyHandler({ method: 'POST', body: { code: '0000' } }, res);
    expect(res.json).toHaveBeenCalledWith({ verified: false });
  });
});
