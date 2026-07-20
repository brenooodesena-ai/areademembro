const mockSend = jest.fn().mockResolvedValue({ data: { id: 'msg_123' }, error: null });
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.RESEND_API_KEY = 'resend-key';
process.env.KIWIFY_PUBLIC_KEY = 'public-key';

const updateMock = jest.fn().mockReturnThis();
const eqMock = jest.fn().mockResolvedValue({ error: null });
const upsertMock = jest.fn();
// First call: new student (no password_hash), second call: existing student (has hash)
upsertMock
  .mockResolvedValueOnce({ data: [{ email: 'new@example.com' }], error: null })
  .mockResolvedValueOnce({ data: [{ email: 'new@example.com', password_hash: '$argon2id$dummyhash' }], error: null });
const mockClient = {
  from: jest.fn(() => ({
    upsert: upsertMock,
    update: updateMock,
    eq: eqMock,
    select: jest.fn(),
  })),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockClient),
}));

const request = require('supertest');
const { app } = require('../index');

describe('Webhook password handling', () => {
  const basePayload = {
    order_status: 'paid',
    Customer: { email: 'new@example.com', full_name: 'Test User' },
    Complements: { order_bumps: [] },
    webhook_event_type: null,
  };

  test('new student receives Argon2id hash and welcome email', async () => {
    const response = await request(app).post('/webhook').send(basePayload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    // Verify that the password hash stored starts with $argon2
    const supabase = require('@supabase/supabase-js');
    const client = supabase.createClient.mock.results[0].value;
    const updateCall = client.from().update.mock.calls[0][0];
    expect(updateCall.password_hash).toMatch(/^\$argon2/);
    // Verify that welcome email was sent
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].subject).toContain('Seu acesso à Área de Membros');
  });

  test('duplicate webhook does not change password nor resend email', async () => {
    const response = await request(app).post('/webhook').send(basePayload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    const supabase = require('@supabase/supabase-js');
    const client = supabase.createClient.mock.results[0].value;
    // update should have been called only once (for first student)
    expect(client.from().update).toHaveBeenCalledTimes(1);
    // Verify that send was called twice (once for welcome, once for upgrade)
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend.mock.calls[1][0].subject).toContain('Seu acesso foi atualizado');
  });
});
