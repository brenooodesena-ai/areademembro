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

let selectResult = { data: null, error: null };

const eqMockUpdate = jest.fn().mockResolvedValue({ error: null });
const updateMock = jest.fn(() => ({ eq: eqMockUpdate }));
const insertMock = jest.fn().mockResolvedValue({ error: null });

const maybeSingleMock = jest.fn(() => Promise.resolve(selectResult));
const eqMockSelect = jest.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = jest.fn(() => ({ eq: eqMockSelect }));

const mockClient = {
  from: jest.fn(() => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('new student receives Argon2id hash and welcome email', async () => {
    // Simular que o aluno não existe
    selectResult = { data: null, error: null };

    const response = await request(app).post('/webhook').send(basePayload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    
    // Verify that the password hash stored starts with $argon2
    expect(insertMock).toHaveBeenCalledTimes(1);
    const insertCall = insertMock.mock.calls[0][0];
    expect(insertCall.password_hash).toMatch(/^\$argon2/);
    
    // Verify that welcome email was sent
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].subject).toContain('Seu acesso à Área de Membros');
  });

  test('duplicate webhook does not change password nor resend email', async () => {
    // Simular que o aluno já existe e está aprovado
    selectResult = { data: { email: 'new@example.com', status: 'approved', password_hash: '$argon2id$existinghash' }, error: null };

    const response = await request(app).post('/webhook').send(basePayload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    
    expect(updateMock).toHaveBeenCalledTimes(1);
    const updateCall = updateMock.mock.calls[0][0];
    // Não deve conter password_hash
    expect(updateCall.password_hash).toBeUndefined();
    
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].subject).toContain('Seu acesso foi atualizado');
  });

  test('refunded student buys again receives welcome email and new password', async () => {
    // Simular que o aluno já existe, mas estava reembolsado
    selectResult = { data: { email: 'new@example.com', status: 'rejected', password_hash: '$argon2id$oldhash' }, error: null };

    const response = await request(app).post('/webhook').send(basePayload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    
    expect(updateMock).toHaveBeenCalledTimes(1);
    const updateCall = updateMock.mock.calls[0][0];
    // DEVE conter novo password_hash
    expect(updateCall.password_hash).toMatch(/^\$argon2/);
    expect(updateCall.status).toBe('approved');
    
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].subject).toContain('Seu acesso à Área de Membros');
  });
});
