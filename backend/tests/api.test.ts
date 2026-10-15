import request from 'supertest';
import app from '../src/app';
const { Storage } = require('../src/storage');
import JWT_SECRET from '../src/config';
const jwt = require('jsonwebtoken');

// Mock global fetch for EmailJS REST API calls
const mockedFetch = jest.fn();
global.fetch = mockedFetch;

let token: string;
let adminToken: string;
let complaintId: string;

describe('CivicPulse API flow', () => {
  const testEmail = `alice_${Date.now()}@example.com`;
  const adminEmail = `admin_${Date.now()}@example.com`;

  beforeEach(() => {
    mockedFetch.mockClear();
    mockedFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  test('register citizen', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: testEmail, password: 'Password1', passwordConfirmation: 'Password1', block_division: 'Block A' });
    expect(res.status).toBe(201);
    token = res.body.token;
  });

  test('register rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice Again', email: testEmail, password: 'Password1', passwordConfirmation: 'Password1' });
    expect(res.status).toBe(409);
  });

  test('login citizen', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'Password1' });
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  test('login rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword' });
    expect(res.status).toBe(401);
  });

  test('admin login (hardcoded)', async () => {
    const admin = await Storage.addUser({ name: 'Admin', email: adminEmail, passwordHash: 'hash', role: 'admin' });
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
  });

  test('create complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({ zone: 'Zone1', landmark: 'Landmark1', category: 'Road', description: 'pothole' });
    expect(res.status).toBe(201);
    complaintId = res.body.id;
    expect(res.body.priority_level).toBeDefined();
  });

  test('create complaint rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({ zone: 'Zone1' });
    expect(res.status).toBe(400);
  });

  test('create complaint rejects unauthenticated user', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({ zone: 'Zone1', landmark: 'L', category: 'Road', description: 'pothole' });
    expect(res.status).toBe(401);
  });

  test('upvote complaint', async () => {
    const res = await request(app)
      .post(`/api/votes/${complaintId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
  });

  test('duplicate upvote is rejected', async () => {
    const res = await request(app)
      .post(`/api/votes/${complaintId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(409);
  });

  test('admin upvote is rejected', async () => {
    const res = await request(app)
      .post(`/api/votes/${complaintId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/citizens may upvote/i);
  });

  test('seeded default admin can log in through the admin gateway', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@civicpulse.gov.in', password: 'Admin@1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.token).toBeDefined();
  });

  test('admin change status', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'In Progress' });
    expect(res.status).toBe(200);
  });

  test('citizen cannot change status', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Resolved', admin_reply: 'Trying to self-resolve' });
    expect(res.status).toBe(403);
  });

  test('resolving without a reply is rejected', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });
    expect(res.status).toBe(400);
  });

  test('admin resolves complaint with official reply', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved', admin_reply: 'Pothole filled by municipal crew on site.' });
    expect(res.status).toBe(200);

    const detail = await request(app)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.body.status).toBe('Resolved');
    expect(detail.body.admin_reply).toBe('Pothole filled by municipal crew on site.');
    expect(detail.body.resolved_at).toBeDefined();
  });

  test('owner can withdraw complaint, non-owner cannot', async () => {
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({ zone: 'Zone2', landmark: 'Temp Landmark', category: 'Water', description: 'water leakage' });
    const tempId = createRes.body.id;

    const otherEmail = `bob_${Date.now()}@example.com`;
    const otherReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: otherEmail, password: 'Password1', passwordConfirmation: 'Password1' });

    const forbidden = await request(app)
      .delete(`/api/complaints/${tempId}`)
      .set('Authorization', `Bearer ${otherReg.body.token}`);
    expect(forbidden.status).toBe(403);

    const deleted = await request(app)
      .delete(`/api/complaints/${tempId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleted.status).toBe(200);

    const after = await request(app)
      .get(`/api/complaints/${tempId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(404);
  });

  describe('OTP via EmailJS REST API', () => {
    test('OTP request stores a 6-digit code with 5 minute expiry and sends via EmailJS', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });
      expect(res.status).toBe(200);

      // Response must never contain the OTP
      expect(res.body.code).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toMatch(/\b\d{6}\b/);

      // Fetch called with exact EmailJS REST payload
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockedFetch.mock.calls[0];
      expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send');
      const body = JSON.parse(options.body);
      expect(body.service_id).toBe(process.env.EMAILJS_SERVICE_ID);
      expect(body.template_id).toBe(process.env.EMAILJS_TEMPLATE_ID);
      expect(body.user_id).toBe(process.env.EMAILJS_PUBLIC_KEY);
      expect(body.template_params).toEqual({ email: testEmail, passcode: expect.stringMatching(/^\d{6}$/) });

      // Stored token matches the emailed passcode, expiry ~5 minutes out
      const user = await Storage.getUserByEmail(testEmail);
      expect(user.reset_token).toBe(body.template_params.passcode);

      const minutesOut = (new Date(user.reset_token_expires).getTime() - Date.now()) / 60000;
      expect(minutesOut).toBeGreaterThan(4);
      expect(minutesOut).toBeLessThanOrEqual(5);
    });

    test('OTP request without email is rejected', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});
      expect(res.status).toBe(400);
      expect(mockedFetch).not.toHaveBeenCalled();
    });

    test('EmailJS failure returns a safe error and does not report success', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Unable to send verification code');
      expect(res.body.code).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('Network error');
    });

    test('OTP is not written to console logs', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });
      const user = await Storage.getUserByEmail(testEmail);
      const otp = user.reset_token;

      const printed = [...logSpy.mock.calls, ...errorSpy.mock.calls, ...warnSpy.mock.calls]
        .flat()
        .join(' ');
      expect(printed).not.toContain(otp);

      logSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });

    test('invalid OTP is rejected', async () => {
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: testEmail, code: '000000', newPassword: 'NewPassword99', confirmPassword: 'NewPassword99' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid verification code');
    });

    test('expired OTP is rejected', async () => {
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });
      const user = await Storage.getUserByEmail(testEmail);
      user.reset_token_expires = new Date(Date.now() - 1000).toISOString();
      await Storage.setResetToken(testEmail, user.reset_token, user.reset_token_expires);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: testEmail, code: user.reset_token, newPassword: 'NewPassword99', confirmPassword: 'NewPassword99' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('expired');
    });

    test('valid OTP resets password and the OTP cannot be reused', async () => {
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });
      const user = await Storage.getUserByEmail(testEmail);
      const otp = user.reset_token;

      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: testEmail, code: otp, newPassword: 'NewPassword99', confirmPassword: 'NewPassword99' });
      expect(resetRes.status).toBe(200);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'NewPassword99' });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();

      const reuseRes = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: testEmail, code: otp, newPassword: 'AnotherPass1', confirmPassword: 'AnotherPass1' });
      expect(reuseRes.status).toBe(400);
    });
  });
});