
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { UserResponse } from '../users/users.schema.js';

vi.mock('../users/users.service.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../users/users.service.js')>();

  return {
    ...actual,
    getUserById: vi.fn(),
  };
});

import { getUserById } from '../users/users.service.js';
import { buildApp } from '../app.js';

const app = buildApp();

const userId = '550e8400-e29b-41d4-a716-446655440000';
const missingUserId = '660e8400-e29b-41d4-a716-446655440000';

const expectedUser: UserResponse = {
  id: userId,
  email: 'test@example.com',
  role: 'user',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeAll(async () => {
  await app.ready();
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  await app.close();
});

describe('GET /auth/me', () => {
  it('returns 401 when the token is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
    });

    expect(response.statusCode).toBe(401);
    expect(getUserById).not.toHaveBeenCalled();
  });

  it('returns the current user when the token is valid', async () => {
    vi.mocked(getUserById).mockResolvedValue(expectedUser);

    const token = app.jwt.sign({
      sub: userId,
      email: expectedUser.email,
      role: expectedUser.role,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expectedUser);
    expect(getUserById).toHaveBeenCalledWith(userId);
  });

  it('returns 404 when the token belongs to a missing user', async () => {
    vi.mocked(getUserById).mockResolvedValue(null);

    const token = app.jwt.sign({
      sub: missingUserId,
      email: 'missing@example.com',
      role: 'user',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      message: 'User not found',
    });
  });
});
