import { db } from '../db/postgre.js';
import type { User, PublicUser } from './users.model.js';

export const findAllUsers = async (): Promise<PublicUser[]> => {
  const result = await db.query<PublicUser>(`
    SELECT
      id,
      email,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
};

export const createUser = async (
  email: string,
  passwordHash: string,
): Promise<User> => {
  const result = await db.query<User>(
    `
      INSERT INTO users (
        email,
        password_hash
      )
      VALUES ($1, $2)
      RETURNING
        id,
        email,
        password_hash,
        created_at,
        updated_at
    `,
    [email, passwordHash],
  );

  return result.rows[0];
};