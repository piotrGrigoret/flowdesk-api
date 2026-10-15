
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
    getUsers: vi.fn(),
  };
});

import { getUsers } from '../users/users.service.js';
import { buildApp } from '../app.js';

const app = buildApp();

const expectedUser: UserResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
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

const createToken = (role: 'user' | 'admin') =>
  app.jwt.sign({
    sub:
      role === 'admin'
        ? '660e8400-e29b-41d4-a716-446655440000'
        : expectedUser.id,
    email: `${role}@example.com`,
    role,
  });

describe('GET /users authorization', () => {
  it('returns 401 without a token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
    });

    expect(response.statusCode).toBe(401);
    expect(getUsers).not.toHaveBeenCalled();
  });

  it('returns 403 for a regular user', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: `Bearer ${createToken('user')}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: 'Forbidden',
    });
    expect(getUsers).not.toHaveBeenCalled();
  });

  it('returns 200 for an admin', async () => {
    vi.mocked(getUsers).mockResolvedValue([expectedUser]);

    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: `Bearer ${createToken('admin')}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([expectedUser]);
    expect(getUsers).toHaveBeenCalledOnce();
  });
});
