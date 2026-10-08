import { db } from '../db/postgre.js';
import type { User } from '../users/users.model.js';

export const findUserByEmail = async (
  email: string,
): Promise<User | null> => {
  const result = await db.query<User>(
    `
      SELECT
        id,
        email,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
};
