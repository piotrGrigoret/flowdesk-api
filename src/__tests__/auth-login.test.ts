import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import bcrypt from 'bcrypt';
import type { User } from '../users/users.model.js';

vi.mock('../auth/auth.repository.js', () => ({
  findUserByEmail: vi.fn(),
}));

import { findUserByEmail } from '../auth/auth.repository.js';
import { buildApp } from '../app.js';

const app = buildApp();

const password = 'correct-password';

const testUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  password_hash: '',
  role: 'user',
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
};

beforeAll(async () => {
  testUser.password_hash = await bcrypt.hash(password, 4);
  await app.ready();
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  await app.close();
});

describe('POST /auth/login', () => {
  it('returns a JWT for valid credentials', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: testUser.email,
        password,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      token: expect.any(String),
    });
    expect(response.json().token.length).toBeGreaterThan(0);
  });

  it('returns 401 for an incorrect password', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: testUser.email,
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
    });
  });

  it('returns 401 when the user does not exist', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'unknown@example.com',
        password,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
    });
  });
});